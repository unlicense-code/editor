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
import { Emitter } from 'vs/base/common/event';
import { ILogService } from 'vs/platform/log/common/log';
import { TimelinePaneId } from './timeline';
import { IViewsService } from 'vs/workbench/common/views';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export const TimelineHasProviderContext = new RawContextKey('timelineHasProvider', false);
let TimelineService = class TimelineService {
    logService;
    viewsService;
    configurationService;
    contextKeyService;
    _onDidChangeProviders = new Emitter();
    onDidChangeProviders = this._onDidChangeProviders.event;
    _onDidChangeTimeline = new Emitter();
    onDidChangeTimeline = this._onDidChangeTimeline.event;
    _onDidChangeUri = new Emitter();
    onDidChangeUri = this._onDidChangeUri.event;
    hasProviderContext;
    providers = new Map();
    providerSubscriptions = new Map();
    constructor(logService, viewsService, configurationService, contextKeyService) {
        this.logService = logService;
        this.viewsService = viewsService;
        this.configurationService = configurationService;
        this.contextKeyService = contextKeyService;
        this.hasProviderContext = TimelineHasProviderContext.bindTo(this.contextKeyService);
        this.updateHasProviderContext();
    }
    getSources() {
        return [...this.providers.values()].map(p => ({ id: p.id, label: p.label }));
    }
    getTimeline(id, uri, options, tokenSource) {
        this.logService.trace(`TimelineService#getTimeline(${id}): uri=${uri.toString()}`);
        const provider = this.providers.get(id);
        if (provider === undefined) {
            return undefined;
        }
        if (typeof provider.scheme === 'string') {
            if (provider.scheme !== '*' && provider.scheme !== uri.scheme) {
                return undefined;
            }
        }
        else if (!provider.scheme.includes(uri.scheme)) {
            return undefined;
        }
        return {
            result: provider.provideTimeline(uri, options, tokenSource.token)
                .then(result => {
                if (result === undefined) {
                    return undefined;
                }
                result.items = result.items.map(item => ({ ...item, source: provider.id }));
                result.items.sort((a, b) => (b.timestamp - a.timestamp) || b.source.localeCompare(a.source, undefined, { numeric: true, sensitivity: 'base' }));
                return result;
            }),
            options: options,
            source: provider.id,
            tokenSource: tokenSource,
            uri: uri
        };
    }
    registerTimelineProvider(provider) {
        this.logService.trace(`TimelineService#registerTimelineProvider: id=${provider.id}`);
        const id = provider.id;
        const existing = this.providers.get(id);
        if (existing) {
            // For now to deal with https://github.com/microsoft/vscode/issues/89553 allow any overwritting here (still will be blocked in the Extension Host)
            // TODO@eamodio: Ultimately will need to figure out a way to unregister providers when the Extension Host restarts/crashes
            // throw new Error(`Timeline Provider ${id} already exists.`);
            try {
                existing?.dispose();
            }
            catch { }
        }
        this.providers.set(id, provider);
        this.updateHasProviderContext();
        if (provider.onDidChange) {
            this.providerSubscriptions.set(id, provider.onDidChange(e => this._onDidChangeTimeline.fire(e)));
        }
        this._onDidChangeProviders.fire({ added: [id] });
        return {
            dispose: () => {
                this.providers.delete(id);
                this._onDidChangeProviders.fire({ removed: [id] });
            }
        };
    }
    unregisterTimelineProvider(id) {
        this.logService.trace(`TimelineService#unregisterTimelineProvider: id=${id}`);
        if (!this.providers.has(id)) {
            return;
        }
        this.providers.delete(id);
        this.providerSubscriptions.delete(id);
        this.updateHasProviderContext();
        this._onDidChangeProviders.fire({ removed: [id] });
    }
    setUri(uri) {
        this.viewsService.openView(TimelinePaneId, true);
        this._onDidChangeUri.fire(uri);
    }
    updateHasProviderContext() {
        this.hasProviderContext.set(this.providers.size !== 0);
    }
};
TimelineService = __decorate([
    __param(0, ILogService),
    __param(1, IViewsService),
    __param(2, IConfigurationService),
    __param(3, IContextKeyService)
], TimelineService);
export { TimelineService };
