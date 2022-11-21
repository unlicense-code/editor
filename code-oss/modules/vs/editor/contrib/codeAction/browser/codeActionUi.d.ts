import { IAnchor } from 'vs/base/browser/ui/contextview/contextview';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IPosition } from 'vs/editor/common/core/position';
import { IActionShowOptions, IActionWidgetService } from 'vs/platform/actionWidget/browser/actionWidget';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CodeActionItem, CodeActionSet, CodeActionTrigger } from '../common/types';
import { CodeActionsState } from './codeActionModel';
export declare class CodeActionUi extends Disposable {
    #private;
    private readonly _editor;
    private readonly delegate;
    private readonly _configurationService;
    readonly instantiationService: IInstantiationService;
    private readonly _actionWidgetService;
    private readonly _lightBulbWidget;
    private readonly _activeCodeActions;
    constructor(_editor: ICodeEditor, quickFixActionId: string, preferredFixActionId: string, delegate: {
        applyCodeAction: (action: CodeActionItem, regtriggerAfterApply: boolean, preview: boolean) => Promise<void>;
    }, _configurationService: IConfigurationService, instantiationService: IInstantiationService, _actionWidgetService: IActionWidgetService);
    dispose(): void;
    update(newState: CodeActionsState.State): Promise<void>;
    private getInvalidActionThatWouldHaveBeenApplied;
    private tryGetValidActionToApply;
    showCodeActionList(trigger: CodeActionTrigger, actions: CodeActionSet, at: IAnchor | IPosition, options: IActionShowOptions): Promise<void>;
    private toCoords;
    private shouldShowHeaders;
}
