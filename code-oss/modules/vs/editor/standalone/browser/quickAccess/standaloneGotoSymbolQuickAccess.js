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
import 'vs/base/browser/ui/codicons/codiconStyles'; // The codicon symbol styles are defined here and must be loaded
import 'vs/editor/contrib/symbolIcons/browser/symbolIcons'; // The codicon symbol colors are defined here and must be loaded to get colors
import { AbstractGotoSymbolQuickAccessProvider } from 'vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/platform/quickinput/common/quickAccess';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { withNullAsUndefined } from 'vs/base/common/types';
import { QuickOutlineNLS } from 'vs/editor/common/standaloneStrings';
import { Event } from 'vs/base/common/event';
import { EditorAction, registerEditorAction } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IOutlineModelService } from 'vs/editor/contrib/documentSymbols/browser/outlineModel';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
let StandaloneGotoSymbolQuickAccessProvider = class StandaloneGotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    editorService;
    onDidActiveTextEditorControlChange = Event.None;
    constructor(editorService, languageFeaturesService, outlineModelService) {
        super(languageFeaturesService, outlineModelService);
        this.editorService = editorService;
    }
    get activeTextEditorControl() {
        return withNullAsUndefined(this.editorService.getFocusedCodeEditor());
    }
};
StandaloneGotoSymbolQuickAccessProvider = __decorate([
    __param(0, ICodeEditorService),
    __param(1, ILanguageFeaturesService),
    __param(2, IOutlineModelService)
], StandaloneGotoSymbolQuickAccessProvider);
export { StandaloneGotoSymbolQuickAccessProvider };
export class GotoSymbolAction extends EditorAction {
    static ID = 'editor.action.quickOutline';
    constructor() {
        super({
            id: GotoSymbolAction.ID,
            label: QuickOutlineNLS.quickOutlineActionLabel,
            alias: 'Go to Symbol...',
            precondition: EditorContextKeys.hasDocumentSymbolProvider,
            kbOpts: {
                kbExpr: EditorContextKeys.focus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            },
            contextMenuOpts: {
                group: 'navigation',
                order: 3
            }
        });
    }
    run(accessor) {
        accessor.get(IQuickInputService).quickAccess.show(AbstractGotoSymbolQuickAccessProvider.PREFIX);
    }
}
registerEditorAction(GotoSymbolAction);
Registry.as(Extensions.Quickaccess).registerQuickAccessProvider({
    ctor: StandaloneGotoSymbolQuickAccessProvider,
    prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX,
    helpEntries: [
        { description: QuickOutlineNLS.quickOutlineActionLabel, prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX, commandId: GotoSymbolAction.ID },
        { description: QuickOutlineNLS.quickOutlineByCategoryActionLabel, prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY }
    ]
});
