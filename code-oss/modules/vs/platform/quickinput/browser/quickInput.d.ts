import { CancellationToken } from 'vs/base/common/cancellation';
import { IQuickInputOptions, QuickInputController } from 'vs/base/parts/quickinput/browser/quickInput';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IQuickAccessController } from 'vs/platform/quickinput/common/quickAccess';
import { IInputBox, IInputOptions, IKeyMods, IPickOptions, IQuickInputButton, IQuickInputService, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, QuickPickInput } from 'vs/platform/quickinput/common/quickInput';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
export interface IQuickInputControllerHost extends ILayoutService {
}
export declare class QuickInputService extends Themable implements IQuickInputService {
    private readonly instantiationService;
    protected readonly contextKeyService: IContextKeyService;
    private readonly accessibilityService;
    protected readonly layoutService: ILayoutService;
    readonly _serviceBrand: undefined;
    get backButton(): IQuickInputButton;
    private readonly _onShow;
    readonly onShow: import("vs/base/common/event").Event<void>;
    private readonly _onHide;
    readonly onHide: import("vs/base/common/event").Event<void>;
    private _controller;
    private get controller();
    private get hasController();
    private _quickAccess;
    get quickAccess(): IQuickAccessController;
    private readonly contexts;
    constructor(instantiationService: IInstantiationService, contextKeyService: IContextKeyService, themeService: IThemeService, accessibilityService: IAccessibilityService, layoutService: ILayoutService);
    protected createController(host?: IQuickInputControllerHost, options?: Partial<IQuickInputOptions>): QuickInputController;
    private setContextKey;
    private resetContextKeys;
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    createQuickPick<T extends IQuickPickItem>(): IQuickPick<T>;
    createInputBox(): IInputBox;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(keyMods?: IKeyMods): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
    protected updateStyles(): void;
    private computeStyles;
}
