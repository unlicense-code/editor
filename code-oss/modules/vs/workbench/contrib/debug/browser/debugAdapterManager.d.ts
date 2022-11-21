import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModel } from 'vs/editor/common/model';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IAdapterDescriptor, IAdapterManager, IConfig, IDebugAdapter, IDebugAdapterDescriptorFactory, IDebugAdapterFactory, IDebugSession } from 'vs/workbench/contrib/debug/common/debug';
import { Debugger } from 'vs/workbench/contrib/debug/common/debugger';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export interface IAdapterManagerDelegate {
    onDidNewSession: Event<IDebugSession>;
}
export declare class AdapterManager extends Disposable implements IAdapterManager {
    private readonly editorService;
    private readonly configurationService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly commandService;
    private readonly extensionService;
    private readonly contextKeyService;
    private readonly languageService;
    private readonly dialogService;
    private readonly lifecycleService;
    private debuggers;
    private adapterDescriptorFactories;
    private debugAdapterFactories;
    private debuggersAvailable;
    private debugExtensionsAvailable;
    private readonly _onDidRegisterDebugger;
    private readonly _onDidDebuggersExtPointRead;
    private breakpointContributions;
    private debuggerWhenKeys;
    /** Extensions that were already active before any debugger activation events */
    private earlyActivatedExtensions;
    private usedDebugTypes;
    constructor(delegate: IAdapterManagerDelegate, editorService: IEditorService, configurationService: IConfigurationService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, commandService: ICommandService, extensionService: IExtensionService, contextKeyService: IContextKeyService, languageService: ILanguageService, dialogService: IDialogService, lifecycleService: ILifecycleService);
    private registerListeners;
    private updateDebugAdapterSchema;
    registerDebugAdapterFactory(debugTypes: string[], debugAdapterLauncher: IDebugAdapterFactory): IDisposable;
    hasEnabledDebuggers(): boolean;
    createDebugAdapter(session: IDebugSession): IDebugAdapter | undefined;
    substituteVariables(debugType: string, folder: IWorkspaceFolder | undefined, config: IConfig): Promise<IConfig>;
    runInTerminal(debugType: string, args: DebugProtocol.RunInTerminalRequestArguments, sessionId: string): Promise<number | undefined>;
    registerDebugAdapterDescriptorFactory(debugAdapterProvider: IDebugAdapterDescriptorFactory): IDisposable;
    unregisterDebugAdapterDescriptorFactory(debugAdapterProvider: IDebugAdapterDescriptorFactory): void;
    getDebugAdapterDescriptor(session: IDebugSession): Promise<IAdapterDescriptor | undefined>;
    getDebuggerLabel(type: string): string | undefined;
    get onDidRegisterDebugger(): Event<void>;
    get onDidDebuggersExtPointRead(): Event<void>;
    canSetBreakpointsIn(model: ITextModel): boolean;
    getDebugger(type: string): Debugger | undefined;
    getEnabledDebugger(type: string): Debugger | undefined;
    someDebuggerInterestedInLanguage(languageId: string): boolean;
    guessDebugger(gettingConfigurations: boolean): Promise<Debugger | undefined>;
    private initExtensionActivationsIfNeeded;
    activateDebuggers(activationEvent: string, debugType?: string): Promise<void>;
}
