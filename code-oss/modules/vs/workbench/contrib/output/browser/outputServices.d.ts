import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IOutputChannel, IOutputService, OutputChannelUpdateMode, IOutputChannelDescriptor } from 'vs/workbench/services/output/common/output';
import { ITextModelService, ITextModelContentProvider } from 'vs/editor/common/services/resolverService';
import { ITextModel } from 'vs/editor/common/model';
import { ILogService } from 'vs/platform/log/common/log';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IOutputChannelModel } from 'vs/workbench/contrib/output/common/outputChannelModel';
import { IViewsService } from 'vs/workbench/common/views';
import { IOutputChannelModelService } from 'vs/workbench/contrib/output/common/outputChannelModelService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
declare class OutputChannel extends Disposable implements IOutputChannel {
    readonly outputChannelDescriptor: IOutputChannelDescriptor;
    scrollLock: boolean;
    readonly model: IOutputChannelModel;
    readonly id: string;
    readonly label: string;
    readonly uri: URI;
    constructor(outputChannelDescriptor: IOutputChannelDescriptor, outputChannelModelService: IOutputChannelModelService, languageService: ILanguageService);
    append(output: string): void;
    update(mode: OutputChannelUpdateMode, till?: number): void;
    clear(): void;
    replace(value: string): void;
}
export declare class OutputService extends Disposable implements IOutputService, ITextModelContentProvider {
    private readonly storageService;
    private readonly instantiationService;
    private readonly logService;
    private readonly lifecycleService;
    private readonly viewsService;
    readonly _serviceBrand: undefined;
    private channels;
    private activeChannelIdInStorage;
    private activeChannel?;
    private readonly _onActiveOutputChannel;
    readonly onActiveOutputChannel: Event<string>;
    private readonly activeOutputChannelContext;
    private readonly activeLogOutputChannelContext;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, textModelResolverService: ITextModelService, logService: ILogService, lifecycleService: ILifecycleService, viewsService: IViewsService, contextKeyService: IContextKeyService);
    provideTextContent(resource: URI): Promise<ITextModel> | null;
    showChannel(id: string, preserveFocus?: boolean): Promise<void>;
    getChannel(id: string): OutputChannel | undefined;
    getChannelDescriptor(id: string): IOutputChannelDescriptor | undefined;
    getChannelDescriptors(): IOutputChannelDescriptor[];
    getActiveChannel(): IOutputChannel | undefined;
    private onDidRegisterChannel;
    private createChannel;
    private instantiateChannel;
    private setActiveChannel;
}
export declare class LogContentProvider {
    private readonly outputService;
    private readonly outputChannelModelService;
    private readonly languageService;
    private channelModels;
    constructor(outputService: IOutputService, outputChannelModelService: IOutputChannelModelService, languageService: ILanguageService);
    provideTextContent(resource: URI): Promise<ITextModel> | null;
    private getChannelModel;
}
export {};
