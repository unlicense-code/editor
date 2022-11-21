import { Disposable } from 'vs/base/common/lifecycle';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class DefineKeybindingController extends Disposable implements IEditorContribution {
    private _editor;
    private readonly _instantiationService;
    private readonly _userDataProfileService;
    static readonly ID = "editor.contrib.defineKeybinding";
    static get(editor: ICodeEditor): DefineKeybindingController | null;
    private _keybindingWidgetRenderer?;
    private _keybindingDecorationRenderer?;
    constructor(_editor: ICodeEditor, _instantiationService: IInstantiationService, _userDataProfileService: IUserDataProfileService);
    get keybindingWidgetRenderer(): KeybindingWidgetRenderer | undefined;
    dispose(): void;
    private _update;
    private _createKeybindingWidgetRenderer;
    private _disposeKeybindingWidgetRenderer;
    private _createKeybindingDecorationRenderer;
    private _disposeKeybindingDecorationRenderer;
}
export declare class KeybindingWidgetRenderer extends Disposable {
    private _editor;
    private readonly _instantiationService;
    private _launchWidget;
    private _defineWidget;
    constructor(_editor: ICodeEditor, _instantiationService: IInstantiationService);
    showDefineKeybindingWidget(): void;
    private _onAccepted;
}
export declare class KeybindingEditorDecorationsRenderer extends Disposable {
    private _editor;
    private readonly _keybindingService;
    private _updateDecorations;
    private readonly _dec;
    constructor(_editor: ICodeEditor, _keybindingService: IKeybindingService);
    private _updateDecorationsNow;
    private _getDecorationForEntry;
    static _userSettingsFuzzyEquals(a: string, b: string): boolean;
    private static _userBindingEquals;
    private _createDecoration;
}
