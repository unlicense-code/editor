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
import 'vs/css!./media/releasenoteseditor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { onUnexpectedError } from 'vs/base/common/errors';
import { escapeMarkdownSyntaxTokens } from 'vs/base/common/htmlContent';
import { KeybindingParser } from 'vs/base/common/keybindingParser';
import { OS } from 'vs/base/common/platform';
import { escape } from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { generateUuid } from 'vs/base/common/uuid';
import { TokenizationRegistry } from 'vs/editor/common/languages';
import { generateTokensCSSForColorMap } from 'vs/editor/common/languages/supports/tokenization';
import { ILanguageService } from 'vs/editor/common/languages/language';
import * as nls from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { asTextOrError, IRequestService } from 'vs/platform/request/common/request';
import { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument } from 'vs/workbench/contrib/markdown/browser/markdownDocumentRenderer';
import { IWebviewWorkbenchService } from 'vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ACTIVE_GROUP, IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { getTelemetryLevel, supportsTelemetry } from 'vs/platform/telemetry/common/telemetryUtils';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
let ReleaseNotesManager = class ReleaseNotesManager {
    _environmentService;
    _keybindingService;
    _languageService;
    _openerService;
    _requestService;
    _configurationService;
    _editorService;
    _editorGroupService;
    _webviewWorkbenchService;
    _extensionService;
    _productService;
    _releaseNotesCache = new Map();
    _currentReleaseNotes = undefined;
    _lastText;
    constructor(_environmentService, _keybindingService, _languageService, _openerService, _requestService, _configurationService, _editorService, _editorGroupService, _webviewWorkbenchService, _extensionService, _productService) {
        this._environmentService = _environmentService;
        this._keybindingService = _keybindingService;
        this._languageService = _languageService;
        this._openerService = _openerService;
        this._requestService = _requestService;
        this._configurationService = _configurationService;
        this._editorService = _editorService;
        this._editorGroupService = _editorGroupService;
        this._webviewWorkbenchService = _webviewWorkbenchService;
        this._extensionService = _extensionService;
        this._productService = _productService;
        TokenizationRegistry.onDidChange(async () => {
            if (!this._currentReleaseNotes || !this._lastText) {
                return;
            }
            const html = await this.renderBody(this._lastText);
            if (this._currentReleaseNotes) {
                this._currentReleaseNotes.webview.html = html;
            }
        });
    }
    async show(version) {
        const releaseNoteText = await this.loadReleaseNotes(version);
        this._lastText = releaseNoteText;
        const html = await this.renderBody(releaseNoteText);
        const title = nls.localize('releaseNotesInputName', "Release Notes: {0}", version);
        const activeEditorPane = this._editorService.activeEditorPane;
        if (this._currentReleaseNotes) {
            this._currentReleaseNotes.setName(title);
            this._currentReleaseNotes.webview.html = html;
            this._webviewWorkbenchService.revealWebview(this._currentReleaseNotes, activeEditorPane ? activeEditorPane.group : this._editorGroupService.activeGroup, false);
        }
        else {
            this._currentReleaseNotes = this._webviewWorkbenchService.openWebview({
                id: generateUuid(),
                options: {
                    tryRestoreScrollPosition: true,
                    enableFindWidget: true,
                },
                contentOptions: {
                    localResourceRoots: []
                },
                extension: undefined
            }, 'releaseNotes', title, { group: ACTIVE_GROUP, preserveFocus: false });
            this._currentReleaseNotes.webview.onDidClickLink(uri => this.onDidClickLink(URI.parse(uri)));
            this._currentReleaseNotes.onWillDispose(() => { this._currentReleaseNotes = undefined; });
            this._currentReleaseNotes.webview.html = html;
        }
        return true;
    }
    async loadReleaseNotes(version) {
        const match = /^(\d+\.\d+)\./.exec(version);
        if (!match) {
            throw new Error('not found');
        }
        const versionLabel = match[1].replace(/\./g, '_');
        const baseUrl = 'https://code.visualstudio.com/raw';
        const url = `${baseUrl}/v${versionLabel}.md`;
        const unassigned = nls.localize('unassigned', "unassigned");
        const escapeMdHtml = (text) => {
            return escape(text).replace(/\\/g, '\\\\');
        };
        const patchKeybindings = (text) => {
            const kb = (match, kb) => {
                const keybinding = this._keybindingService.lookupKeybinding(kb);
                if (!keybinding) {
                    return unassigned;
                }
                return keybinding.getLabel() || unassigned;
            };
            const kbstyle = (match, kb) => {
                const keybinding = KeybindingParser.parseKeybinding(kb, OS);
                if (!keybinding) {
                    return unassigned;
                }
                const resolvedKeybindings = this._keybindingService.resolveKeybinding(keybinding);
                if (resolvedKeybindings.length === 0) {
                    return unassigned;
                }
                return resolvedKeybindings[0].getLabel() || unassigned;
            };
            const kbCode = (match, binding) => {
                const resolved = kb(match, binding);
                return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
            };
            const kbstyleCode = (match, binding) => {
                const resolved = kbstyle(match, binding);
                return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
            };
            return text
                .replace(/`kb\(([a-z.\d\-]+)\)`/gi, kbCode)
                .replace(/`kbstyle\(([^\)]+)\)`/gi, kbstyleCode)
                .replace(/kb\(([a-z.\d\-]+)\)/gi, (match, binding) => escapeMarkdownSyntaxTokens(kb(match, binding)))
                .replace(/kbstyle\(([^\)]+)\)/gi, (match, binding) => escapeMarkdownSyntaxTokens(kbstyle(match, binding)));
        };
        const fetchReleaseNotes = async () => {
            let text;
            try {
                text = await asTextOrError(await this._requestService.request({ url }, CancellationToken.None));
            }
            catch {
                throw new Error('Failed to fetch release notes');
            }
            if (!text || !/^#\s/.test(text)) { // release notes always starts with `#` followed by whitespace
                throw new Error('Invalid release notes');
            }
            return patchKeybindings(text);
        };
        if (!this._releaseNotesCache.has(version)) {
            this._releaseNotesCache.set(version, (async () => {
                try {
                    return await fetchReleaseNotes();
                }
                catch (err) {
                    this._releaseNotesCache.delete(version);
                    throw err;
                }
            })());
        }
        return this._releaseNotesCache.get(version);
    }
    onDidClickLink(uri) {
        this.addGAParameters(uri, 'ReleaseNotes')
            .then(updated => this._openerService.open(updated))
            .then(undefined, onUnexpectedError);
    }
    async addGAParameters(uri, origin, experiment = '1') {
        if (supportsTelemetry(this._productService, this._environmentService) && getTelemetryLevel(this._configurationService) === 3 /* TelemetryLevel.USAGE */) {
            if (uri.scheme === 'https' && uri.authority === 'code.visualstudio.com') {
                return uri.with({ query: `${uri.query ? uri.query + '&' : ''}utm_source=VsCode&utm_medium=${encodeURIComponent(origin)}&utm_content=${encodeURIComponent(experiment)}` });
            }
        }
        return uri;
    }
    async renderBody(text) {
        const nonce = generateUuid();
        const content = await renderMarkdownDocument(text, this._extensionService, this._languageService, false);
        const colorMap = TokenizationRegistry.getColorMap();
        const css = colorMap ? generateTokensCSSForColorMap(colorMap) : '';
        return `<!DOCTYPE html>
		<html>
			<head>
				<base href="https://code.visualstudio.com/raw/">
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${nonce}' https://code.visualstudio.com;">
				<style nonce="${nonce}">
					${DEFAULT_MARKDOWN_STYLES}
					${css}
				</style>
			</head>
			<body>${content}</body>
		</html>`;
    }
};
ReleaseNotesManager = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IKeybindingService),
    __param(2, ILanguageService),
    __param(3, IOpenerService),
    __param(4, IRequestService),
    __param(5, IConfigurationService),
    __param(6, IEditorService),
    __param(7, IEditorGroupsService),
    __param(8, IWebviewWorkbenchService),
    __param(9, IExtensionService),
    __param(10, IProductService)
], ReleaseNotesManager);
export { ReleaseNotesManager };
