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
import { Lazy } from 'vs/base/common/lazy';
import { Disposable } from 'vs/base/common/lifecycle';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { EditorAction, EditorCommand } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { applyCodeAction, ApplyCodeActionReason, codeActionCommandId, fixAllCommandId, organizeImportsCommandId, refactorCommandId, refactorPreviewCommandId, sourceActionCommandId } from 'vs/editor/contrib/codeAction/browser/codeAction';
import { CodeActionUi } from 'vs/editor/contrib/codeAction/browser/codeActionUi';
import { MessageController } from 'vs/editor/contrib/message/browser/messageController';
import * as nls from 'vs/nls';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IEditorProgressService } from 'vs/platform/progress/common/progress';
import { CodeActionModel, SUPPORTED_CODE_ACTIONS } from './codeActionModel';
import { CodeActionCommandArgs, CodeActionKind, CodeActionTriggerSource } from '../common/types';
function contextKeyForSupportedActions(kind) {
    return ContextKeyExpr.regex(SUPPORTED_CODE_ACTIONS.keys()[0], new RegExp('(\\s|^)' + escapeRegExpCharacters(kind.value) + '\\b'));
}
function refactorTrigger(editor, userArgs, preview, codeActionFrom) {
    const args = CodeActionCommandArgs.fromUser(userArgs, {
        kind: CodeActionKind.Refactor,
        apply: "never" /* CodeActionAutoApply.Never */
    });
    return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
        ? args.preferred
            ? nls.localize('editor.action.refactor.noneMessage.preferred.kind', "No preferred refactorings for '{0}' available", userArgs.kind)
            : nls.localize('editor.action.refactor.noneMessage.kind', "No refactorings for '{0}' available", userArgs.kind)
        : args.preferred
            ? nls.localize('editor.action.refactor.noneMessage.preferred', "No preferred refactorings available")
            : nls.localize('editor.action.refactor.noneMessage', "No refactorings available"), {
        include: CodeActionKind.Refactor.contains(args.kind) ? args.kind : CodeActionKind.None,
        onlyIncludePreferredActions: args.preferred
    }, args.apply, preview, codeActionFrom);
}
const argsSchema = {
    type: 'object',
    defaultSnippets: [{ body: { kind: '' } }],
    properties: {
        'kind': {
            type: 'string',
            description: nls.localize('args.schema.kind', "Kind of the code action to run."),
        },
        'apply': {
            type: 'string',
            description: nls.localize('args.schema.apply', "Controls when the returned actions are applied."),
            default: "ifSingle" /* CodeActionAutoApply.IfSingle */,
            enum: ["first" /* CodeActionAutoApply.First */, "ifSingle" /* CodeActionAutoApply.IfSingle */, "never" /* CodeActionAutoApply.Never */],
            enumDescriptions: [
                nls.localize('args.schema.apply.first', "Always apply the first returned code action."),
                nls.localize('args.schema.apply.ifSingle', "Apply the first returned code action if it is the only one."),
                nls.localize('args.schema.apply.never', "Do not apply the returned code actions."),
            ]
        },
        'preferred': {
            type: 'boolean',
            default: false,
            description: nls.localize('args.schema.preferred', "Controls if only preferred code actions should be returned."),
        }
    }
};
let CodeActionController = class CodeActionController extends Disposable {
    _instantiationService;
    static ID = 'editor.contrib.codeActionController';
    static get(editor) {
        return editor.getContribution(CodeActionController.ID);
    }
    _editor;
    _model;
    _ui;
    constructor(editor, markerService, contextKeyService, progressService, _instantiationService, languageFeaturesService) {
        super();
        this._instantiationService = _instantiationService;
        this._editor = editor;
        this._model = this._register(new CodeActionModel(this._editor, languageFeaturesService.codeActionProvider, markerService, contextKeyService, progressService));
        this._register(this._model.onDidChangeState(newState => this.update(newState)));
        this._ui = new Lazy(() => this._register(_instantiationService.createInstance(CodeActionUi, editor, QuickFixAction.Id, AutoFixAction.Id, {
            applyCodeAction: async (action, retrigger, preview) => {
                try {
                    await this._applyCodeAction(action, preview);
                }
                finally {
                    if (retrigger) {
                        this._trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.QuickFix, filter: {} });
                    }
                }
            }
        })));
    }
    update(newState) {
        this._ui.getValue().update(newState);
    }
    showCodeActions(trigger, actions, at) {
        return this._ui.getValue().showCodeActionList(trigger, actions, at, { includeDisabledActions: false, fromLightbulb: false });
    }
    manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply, preview) {
        if (!this._editor.hasModel()) {
            return;
        }
        MessageController.get(this._editor)?.closeMessage();
        const triggerPosition = this._editor.getPosition();
        this._trigger({ type: 1 /* CodeActionTriggerType.Invoke */, triggerAction, filter, autoApply, context: { notAvailableMessage, position: triggerPosition }, preview });
    }
    _trigger(trigger) {
        return this._model.trigger(trigger);
    }
    _applyCodeAction(action, preview) {
        return this._instantiationService.invokeFunction(applyCodeAction, action, ApplyCodeActionReason.FromCodeActions, { preview, editor: this._editor });
    }
};
CodeActionController = __decorate([
    __param(1, IMarkerService),
    __param(2, IContextKeyService),
    __param(3, IEditorProgressService),
    __param(4, IInstantiationService),
    __param(5, ILanguageFeaturesService)
], CodeActionController);
export { CodeActionController };
function triggerCodeActionsForEditorSelection(editor, notAvailableMessage, filter, autoApply, preview = false, triggerAction = CodeActionTriggerSource.Default) {
    if (editor.hasModel()) {
        const controller = CodeActionController.get(editor);
        controller?.manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply, preview);
    }
}
export class QuickFixAction extends EditorAction {
    static Id = 'editor.action.quickFix';
    constructor() {
        super({
            id: QuickFixAction.Id,
            label: nls.localize('quickfix.trigger.label', "Quick Fix..."),
            alias: 'Quick Fix...',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 84 /* KeyCode.Period */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(_accessor, editor) {
        return triggerCodeActionsForEditorSelection(editor, nls.localize('editor.action.quickFix.noneMessage', "No code actions available"), undefined, undefined, false, CodeActionTriggerSource.QuickFix);
    }
}
export class CodeActionCommand extends EditorCommand {
    constructor() {
        super({
            id: codeActionCommandId,
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
            description: {
                description: 'Trigger a code action',
                args: [{ name: 'args', schema: argsSchema, }]
            }
        });
    }
    runEditorCommand(_accessor, editor, userArgs) {
        const args = CodeActionCommandArgs.fromUser(userArgs, {
            kind: CodeActionKind.Empty,
            apply: "ifSingle" /* CodeActionAutoApply.IfSingle */,
        });
        return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
            ? args.preferred
                ? nls.localize('editor.action.codeAction.noneMessage.preferred.kind', "No preferred code actions for '{0}' available", userArgs.kind)
                : nls.localize('editor.action.codeAction.noneMessage.kind', "No code actions for '{0}' available", userArgs.kind)
            : args.preferred
                ? nls.localize('editor.action.codeAction.noneMessage.preferred', "No preferred code actions available")
                : nls.localize('editor.action.codeAction.noneMessage', "No code actions available"), {
            include: args.kind,
            includeSourceActions: true,
            onlyIncludePreferredActions: args.preferred,
        }, args.apply);
    }
}
export class RefactorAction extends EditorAction {
    constructor() {
        super({
            id: refactorCommandId,
            label: nls.localize('refactor.label', "Refactor..."),
            alias: 'Refactor...',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */,
                mac: {
                    primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */
                },
                weight: 100 /* KeybindingWeight.EditorContrib */
            },
            contextMenuOpts: {
                group: '1_modification',
                order: 2,
                when: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.Refactor)),
            },
            description: {
                description: 'Refactor...',
                args: [{ name: 'args', schema: argsSchema }]
            }
        });
    }
    run(_accessor, editor, userArgs) {
        return refactorTrigger(editor, userArgs, false, CodeActionTriggerSource.Refactor);
    }
}
export class RefactorPreview extends EditorAction {
    constructor() {
        super({
            id: refactorPreviewCommandId,
            label: nls.localize('refactor.preview.label', "Refactor with Preview..."),
            alias: 'Refactor Preview...',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
            description: {
                description: 'Refactor Preview...',
                args: [{ name: 'args', schema: argsSchema }]
            }
        });
    }
    run(_accessor, editor, userArgs) {
        return refactorTrigger(editor, userArgs, true, CodeActionTriggerSource.RefactorPreview);
    }
}
export class SourceAction extends EditorAction {
    constructor() {
        super({
            id: sourceActionCommandId,
            label: nls.localize('source.label', "Source Action..."),
            alias: 'Source Action...',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCodeActionsProvider),
            contextMenuOpts: {
                group: '1_modification',
                order: 2.1,
                when: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.Source)),
            },
            description: {
                description: 'Source Action...',
                args: [{ name: 'args', schema: argsSchema }]
            }
        });
    }
    run(_accessor, editor, userArgs) {
        const args = CodeActionCommandArgs.fromUser(userArgs, {
            kind: CodeActionKind.Source,
            apply: "never" /* CodeActionAutoApply.Never */
        });
        return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
            ? args.preferred
                ? nls.localize('editor.action.source.noneMessage.preferred.kind', "No preferred source actions for '{0}' available", userArgs.kind)
                : nls.localize('editor.action.source.noneMessage.kind', "No source actions for '{0}' available", userArgs.kind)
            : args.preferred
                ? nls.localize('editor.action.source.noneMessage.preferred', "No preferred source actions available")
                : nls.localize('editor.action.source.noneMessage', "No source actions available"), {
            include: CodeActionKind.Source.contains(args.kind) ? args.kind : CodeActionKind.None,
            includeSourceActions: true,
            onlyIncludePreferredActions: args.preferred,
        }, args.apply, undefined, CodeActionTriggerSource.SourceAction);
    }
}
export class OrganizeImportsAction extends EditorAction {
    constructor() {
        super({
            id: organizeImportsCommandId,
            label: nls.localize('organizeImports.label', "Organize Imports"),
            alias: 'Organize Imports',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.SourceOrganizeImports)),
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 45 /* KeyCode.KeyO */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            },
        });
    }
    run(_accessor, editor) {
        return triggerCodeActionsForEditorSelection(editor, nls.localize('editor.action.organize.noneMessage', "No organize imports action available"), { include: CodeActionKind.SourceOrganizeImports, includeSourceActions: true }, "ifSingle" /* CodeActionAutoApply.IfSingle */, undefined, CodeActionTriggerSource.OrganizeImports);
    }
}
export class FixAllAction extends EditorAction {
    constructor() {
        super({
            id: fixAllCommandId,
            label: nls.localize('fixAll.label', "Fix All"),
            alias: 'Fix All',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.SourceFixAll))
        });
    }
    run(_accessor, editor) {
        return triggerCodeActionsForEditorSelection(editor, nls.localize('fixAll.noneMessage', "No fix all action available"), { include: CodeActionKind.SourceFixAll, includeSourceActions: true }, "ifSingle" /* CodeActionAutoApply.IfSingle */, undefined, CodeActionTriggerSource.FixAll);
    }
}
export class AutoFixAction extends EditorAction {
    static Id = 'editor.action.autoFix';
    constructor() {
        super({
            id: AutoFixAction.Id,
            label: nls.localize('autoFix.label', "Auto Fix..."),
            alias: 'Auto Fix...',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, contextKeyForSupportedActions(CodeActionKind.QuickFix)),
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 84 /* KeyCode.Period */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 84 /* KeyCode.Period */
                },
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(_accessor, editor) {
        return triggerCodeActionsForEditorSelection(editor, nls.localize('editor.action.autoFix.noneMessage', "No auto fixes available"), {
            include: CodeActionKind.QuickFix,
            onlyIncludePreferredActions: true
        }, "ifSingle" /* CodeActionAutoApply.IfSingle */, undefined, CodeActionTriggerSource.AutoFix);
    }
}
