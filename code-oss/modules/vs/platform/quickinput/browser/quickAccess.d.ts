import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IQuickAccessController, IQuickAccessOptions } from 'vs/platform/quickinput/common/quickAccess';
import { IQuickInputService, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
export declare class QuickAccessController extends Disposable implements IQuickAccessController {
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly registry;
    private readonly mapProviderToDescriptor;
    private readonly lastAcceptedPickerValues;
    private visibleQuickAccess;
    constructor(quickInputService: IQuickInputService, instantiationService: IInstantiationService);
    pick(value?: string, options?: IQuickAccessOptions): Promise<IQuickPickItem[] | undefined>;
    show(value?: string, options?: IQuickAccessOptions): void;
    private doShowOrPick;
    private adjustValueSelection;
    private registerPickerListeners;
    private getOrInstantiateProvider;
}
