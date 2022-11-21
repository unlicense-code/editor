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
import { DisposableStore } from 'vs/base/common/lifecycle';
import { Selection } from 'vs/editor/common/core/selection';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { CodeActionKind } from 'vs/editor/contrib/codeAction/common/types';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ApplyFileSnippetAction } from 'vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets';
import { getSurroundableSnippets, SurroundWithSnippetEditorAction } from 'vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet';
import { ISnippetsService } from './snippets';
let SurroundWithSnippetCodeActionProvider = class SurroundWithSnippetCodeActionProvider {
    _snippetService;
    static _MAX_CODE_ACTIONS = 4;
    static _overflowCommandCodeAction = {
        kind: CodeActionKind.SurroundWith.value,
        title: SurroundWithSnippetEditorAction.options.title.value,
        command: {
            id: SurroundWithSnippetEditorAction.options.id,
            title: SurroundWithSnippetEditorAction.options.title.value,
        },
    };
    constructor(_snippetService) {
        this._snippetService = _snippetService;
    }
    async provideCodeActions(model, range) {
        if (range.isEmpty()) {
            return undefined;
        }
        const position = Selection.isISelection(range) ? range.getPosition() : range.getStartPosition();
        const snippets = await getSurroundableSnippets(this._snippetService, model, position, false);
        if (!snippets.length) {
            return undefined;
        }
        const actions = [];
        for (const snippet of snippets) {
            if (actions.length >= SurroundWithSnippetCodeActionProvider._MAX_CODE_ACTIONS) {
                actions.push(SurroundWithSnippetCodeActionProvider._overflowCommandCodeAction);
                break;
            }
            actions.push({
                title: localize('codeAction', "Surround With: {0}", snippet.name),
                kind: CodeActionKind.SurroundWith.value,
                edit: asWorkspaceEdit(model, range, snippet)
            });
        }
        return {
            actions,
            dispose() { }
        };
    }
};
SurroundWithSnippetCodeActionProvider = __decorate([
    __param(0, ISnippetsService)
], SurroundWithSnippetCodeActionProvider);
let FileTemplateCodeActionProvider = class FileTemplateCodeActionProvider {
    _snippetService;
    static _MAX_CODE_ACTIONS = 4;
    static _overflowCommandCodeAction = {
        title: localize('overflow.start.title', 'Start with Snippet'),
        kind: CodeActionKind.SurroundWith.value,
        command: {
            id: ApplyFileSnippetAction.Id,
            title: ''
        }
    };
    providedCodeActionKinds = [CodeActionKind.SurroundWith.value];
    constructor(_snippetService) {
        this._snippetService = _snippetService;
    }
    async provideCodeActions(model) {
        if (model.getValueLength() !== 0) {
            return undefined;
        }
        const snippets = await this._snippetService.getSnippets(model.getLanguageId(), { fileTemplateSnippets: true, includeNoPrefixSnippets: true });
        const actions = [];
        for (const snippet of snippets) {
            if (actions.length >= FileTemplateCodeActionProvider._MAX_CODE_ACTIONS) {
                actions.push(FileTemplateCodeActionProvider._overflowCommandCodeAction);
                break;
            }
            actions.push({
                title: localize('title', 'Start with: {0}', snippet.name),
                kind: CodeActionKind.SurroundWith.value,
                edit: asWorkspaceEdit(model, model.getFullModelRange(), snippet)
            });
        }
        return {
            actions,
            dispose() { }
        };
    }
};
FileTemplateCodeActionProvider = __decorate([
    __param(0, ISnippetsService)
], FileTemplateCodeActionProvider);
function asWorkspaceEdit(model, range, snippet) {
    return {
        edits: [{
                versionId: model.getVersionId(),
                resource: model.uri,
                textEdit: {
                    range,
                    text: snippet.body,
                    insertAsSnippet: true,
                }
            }]
    };
}
let SnippetCodeActions = class SnippetCodeActions {
    _store = new DisposableStore();
    constructor(instantiationService, languageFeaturesService, configService) {
        const setting = 'editor.snippets.codeActions.enabled';
        const sessionStore = new DisposableStore();
        const update = () => {
            sessionStore.clear();
            if (configService.getValue(setting)) {
                sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(SurroundWithSnippetCodeActionProvider)));
                sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(FileTemplateCodeActionProvider)));
            }
        };
        update();
        this._store.add(configService.onDidChangeConfiguration(e => e.affectsConfiguration(setting) && update()));
        this._store.add(sessionStore);
    }
    dispose() {
        this._store.dispose();
    }
};
SnippetCodeActions = __decorate([
    __param(0, IInstantiationService),
    __param(1, ILanguageFeaturesService),
    __param(2, IConfigurationService)
], SnippetCodeActions);
export { SnippetCodeActions };
