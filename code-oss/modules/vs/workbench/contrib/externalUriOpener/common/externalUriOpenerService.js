/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { firstOrDefault } from 'vs/base/common/arrays';
import { Iterable } from 'vs/base/common/iterator';
import { Disposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';
import { isWeb } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import * as languages from 'vs/editor/common/languages';
import * as nls from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { defaultExternalUriOpenerId, externalUriOpenersSettingId } from 'vs/workbench/contrib/externalUriOpener/common/configuration';
import { testUrlMatchesGlob } from 'vs/workbench/contrib/url/common/urlGlob';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
export const IExternalUriOpenerService = createDecorator('externalUriOpenerService');
let ExternalUriOpenerService = class ExternalUriOpenerService extends Disposable {
    configurationService;
    logService;
    preferencesService;
    quickInputService;
    _serviceBrand;
    _providers = new LinkedList();
    constructor(openerService, configurationService, logService, preferencesService, quickInputService) {
        super();
        this.configurationService = configurationService;
        this.logService = logService;
        this.preferencesService = preferencesService;
        this.quickInputService = quickInputService;
        this._register(openerService.registerExternalOpener(this));
    }
    registerExternalOpenerProvider(provider) {
        const remove = this._providers.push(provider);
        return { dispose: remove };
    }
    async getOpeners(targetUri, allowOptional, ctx, token) {
        const allOpeners = await this.getAllOpenersForUri(targetUri);
        if (allOpeners.size === 0) {
            return [];
        }
        // First see if we have a preferredOpener
        if (ctx.preferredOpenerId) {
            if (ctx.preferredOpenerId === defaultExternalUriOpenerId) {
                return [];
            }
            const preferredOpener = allOpeners.get(ctx.preferredOpenerId);
            if (preferredOpener) {
                // Skip the `canOpen` check here since the opener was specifically requested.
                return [preferredOpener];
            }
        }
        // Check to see if we have a configured opener
        const configuredOpener = this.getConfiguredOpenerForUri(allOpeners, targetUri);
        if (configuredOpener) {
            // Skip the `canOpen` check here since the opener was specifically requested.
            return configuredOpener === defaultExternalUriOpenerId ? [] : [configuredOpener];
        }
        // Then check to see if there is a valid opener
        const validOpeners = [];
        await Promise.all(Array.from(allOpeners.values()).map(async (opener) => {
            let priority;
            try {
                priority = await opener.canOpen(ctx.sourceUri, token);
            }
            catch (e) {
                this.logService.error(e);
                return;
            }
            switch (priority) {
                case languages.ExternalUriOpenerPriority.Option:
                case languages.ExternalUriOpenerPriority.Default:
                case languages.ExternalUriOpenerPriority.Preferred:
                    validOpeners.push({ opener, priority });
                    break;
            }
        }));
        if (validOpeners.length === 0) {
            return [];
        }
        // See if we have a preferred opener first
        const preferred = firstOrDefault(validOpeners.filter(x => x.priority === languages.ExternalUriOpenerPriority.Preferred));
        if (preferred) {
            return [preferred.opener];
        }
        // See if we only have optional openers, use the default opener
        if (!allowOptional && validOpeners.every(x => x.priority === languages.ExternalUriOpenerPriority.Option)) {
            return [];
        }
        return validOpeners.map(value => value.opener);
    }
    async openExternal(href, ctx, token) {
        const targetUri = typeof href === 'string' ? URI.parse(href) : href;
        const allOpeners = await this.getOpeners(targetUri, false, ctx, token);
        if (allOpeners.length === 0) {
            return false;
        }
        else if (allOpeners.length === 1) {
            return allOpeners[0].openExternalUri(targetUri, ctx, token);
        }
        // Otherwise prompt
        return this.showOpenerPrompt(allOpeners, targetUri, ctx, token);
    }
    async getOpener(targetUri, ctx, token) {
        const allOpeners = await this.getOpeners(targetUri, true, ctx, token);
        if (allOpeners.length >= 1) {
            return allOpeners[0];
        }
        return undefined;
    }
    async getAllOpenersForUri(targetUri) {
        const allOpeners = new Map();
        await Promise.all(Iterable.map(this._providers, async (provider) => {
            for await (const opener of provider.getOpeners(targetUri)) {
                allOpeners.set(opener.id, opener);
            }
        }));
        return allOpeners;
    }
    getConfiguredOpenerForUri(openers, targetUri) {
        const config = this.configurationService.getValue(externalUriOpenersSettingId) || {};
        for (const [uriGlob, id] of Object.entries(config)) {
            if (testUrlMatchesGlob(targetUri, uriGlob)) {
                if (id === defaultExternalUriOpenerId) {
                    return 'default';
                }
                const entry = openers.get(id);
                if (entry) {
                    return entry;
                }
            }
        }
        return undefined;
    }
    async showOpenerPrompt(openers, targetUri, ctx, token) {
        const items = openers.map((opener) => {
            return {
                label: opener.label,
                opener: opener
            };
        });
        items.push({
            label: isWeb
                ? nls.localize('selectOpenerDefaultLabel.web', 'Open in new browser window')
                : nls.localize('selectOpenerDefaultLabel', 'Open in default browser'),
            opener: undefined
        }, { type: 'separator' }, {
            label: nls.localize('selectOpenerConfigureTitle', "Configure default opener..."),
            opener: 'configureDefault'
        });
        const picked = await this.quickInputService.pick(items, {
            placeHolder: nls.localize('selectOpenerPlaceHolder', "How would you like to open: {0}", targetUri.toString())
        });
        if (!picked) {
            // Still cancel the default opener here since we prompted the user
            return true;
        }
        if (typeof picked.opener === 'undefined') {
            return false; // Fallback to default opener
        }
        else if (picked.opener === 'configureDefault') {
            await this.preferencesService.openUserSettings({
                jsonEditor: true,
                revealSetting: { key: externalUriOpenersSettingId, edit: true }
            });
            return true;
        }
        else {
            return picked.opener.openExternalUri(targetUri, ctx, token);
        }
    }
};
ExternalUriOpenerService = __decorate([
    __param(0, IOpenerService),
    __param(1, IConfigurationService),
    __param(2, ILogService),
    __param(3, IPreferencesService),
    __param(4, IQuickInputService)
], ExternalUriOpenerService);
export { ExternalUriOpenerService };
