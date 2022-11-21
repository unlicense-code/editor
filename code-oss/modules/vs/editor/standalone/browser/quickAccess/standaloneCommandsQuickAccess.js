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
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/platform/quickinput/common/quickAccess';
import { QuickCommandNLS } from 'vs/editor/common/standaloneStrings';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { AbstractEditorCommandsQuickAccessProvider } from 'vs/editor/contrib/quickAccess/browser/commandsQuickAccess';
import { withNullAsUndefined } from 'vs/base/common/types';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { EditorAction, registerEditorAction } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
let StandaloneCommandsQuickAccessProvider = class StandaloneCommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
    codeEditorService;
    get activeTextEditorControl() { return withNullAsUndefined(this.codeEditorService.getFocusedCodeEditor()); }
    constructor(instantiationService, codeEditorService, keybindingService, commandService, telemetryService, dialogService) {
        super({ showAlias: false }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
        this.codeEditorService = codeEditorService;
    }
    async getCommandPicks() {
        return this.getCodeEditorCommandPicks();
    }
};
StandaloneCommandsQuickAccessProvider = __decorate([
    __param(0, IInstantiationService),
    __param(1, ICodeEditorService),
    __param(2, IKeybindingService),
    __param(3, ICommandService),
    __param(4, ITelemetryService),
    __param(5, IDialogService)
], StandaloneCommandsQuickAccessProvider);
export { StandaloneCommandsQuickAccessProvider };
export class GotoLineAction extends EditorAction {
    static ID = 'editor.action.quickCommand';
    constructor() {
        super({
            id: GotoLineAction.ID,
            label: QuickCommandNLS.quickCommandActionLabel,
            alias: 'Command Palette',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.focus,
                primary: 59 /* KeyCode.F1 */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            },
            contextMenuOpts: {
                group: 'z_commands',
                order: 1
            }
        });
    }
    run(accessor) {
        accessor.get(IQuickInputService).quickAccess.show(StandaloneCommandsQuickAccessProvider.PREFIX);
    }
}
registerEditorAction(GotoLineAction);
Registry.as(Extensions.Quickaccess).registerQuickAccessProvider({
    ctor: StandaloneCommandsQuickAccessProvider,
    prefix: StandaloneCommandsQuickAccessProvider.PREFIX,
    helpEntries: [{ description: QuickCommandNLS.quickCommandHelp, commandId: GotoLineAction.ID }]
});
