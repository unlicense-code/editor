import 'vs/workbench/browser/style';
import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { WillShutdownEvent } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { Layout } from 'vs/workbench/browser/layout';
export interface IWorkbenchOptions {
    /**
     * Extra classes to be added to the workbench container.
     */
    extraClasses?: string[];
}
export declare class Workbench extends Layout {
    private readonly options;
    private readonly serviceCollection;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<WillShutdownEvent>;
    private readonly _onDidShutdown;
    readonly onDidShutdown: Event<void>;
    constructor(parent: HTMLElement, options: IWorkbenchOptions | undefined, serviceCollection: ServiceCollection, logService: ILogService);
    private registerErrorHandler;
    private previousUnexpectedError;
    private handleUnexpectedError;
    startup(): IInstantiationService;
    private initServices;
    private registerListeners;
    private fontAliasing;
    private setFontAliasing;
    private restoreFontInfo;
    private storeFontInfo;
    private renderWorkbench;
    private createPart;
    private createNotificationsHandlers;
    private restore;
}
