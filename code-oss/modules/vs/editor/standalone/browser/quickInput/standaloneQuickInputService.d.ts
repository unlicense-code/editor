import 'vs/css!./standaloneQuickInput';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IQuickInputService, IQuickInputButton, IQuickPickItem, IQuickPick, IInputBox, IQuickNavigateConfiguration, IPickOptions, QuickPickInput, IInputOptions } from 'vs/platform/quickinput/common/quickInput';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IQuickAccessController } from 'vs/platform/quickinput/common/quickAccess';
export declare class StandaloneQuickInputService implements IQuickInputService {
    private readonly instantiationService;
    private readonly codeEditorService;
    readonly _serviceBrand: undefined;
    private mapEditorToService;
    private get activeService();
    get quickAccess(): IQuickAccessController;
    get backButton(): IQuickInputButton;
    get onShow(): import("../../../../workbench/workbench.web.main").Event<void>;
    get onHide(): import("../../../../workbench/workbench.web.main").Event<void>;
    constructor(instantiationService: IInstantiationService, codeEditorService: ICodeEditorService);
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    input(options?: IInputOptions | undefined, token?: CancellationToken | undefined): Promise<string | undefined>;
    createQuickPick<T extends IQuickPickItem>(): IQuickPick<T>;
    createInputBox(): IInputBox;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration | undefined): void;
    accept(): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
}
export declare class QuickInputEditorContribution implements IEditorContribution {
    private editor;
    static readonly ID = "editor.controller.quickInput";
    static get(editor: ICodeEditor): QuickInputEditorContribution | null;
    readonly widget: QuickInputEditorWidget;
    constructor(editor: ICodeEditor);
    dispose(): void;
}
export declare class QuickInputEditorWidget implements IOverlayWidget {
    private codeEditor;
    private static readonly ID;
    private domNode;
    constructor(codeEditor: ICodeEditor);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    dispose(): void;
}
