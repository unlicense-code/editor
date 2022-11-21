import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IShellLaunchConfig } from 'vs/platform/terminal/common/terminal';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IDeserializedTerminalEditorInput, ITerminalEditorService, ITerminalInstance, ITerminalInstanceService, TerminalEditorLocation } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalEditorInput } from 'vs/workbench/contrib/terminal/browser/terminalEditorInput';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export declare class TerminalEditorService extends Disposable implements ITerminalEditorService {
    private readonly _editorService;
    private readonly _editorGroupsService;
    private readonly _terminalInstanceService;
    private readonly _instantiationService;
    private readonly _environmentService;
    _serviceBrand: undefined;
    instances: ITerminalInstance[];
    private _activeInstanceIndex;
    private _isShuttingDown;
    private _activeOpenEditorRequest?;
    private _terminalEditorActive;
    private _editorInputs;
    private _instanceDisposables;
    private readonly _onDidDisposeInstance;
    readonly onDidDisposeInstance: import("vs/base/common/event").Event<ITerminalInstance>;
    private readonly _onDidFocusInstance;
    readonly onDidFocusInstance: import("vs/base/common/event").Event<ITerminalInstance>;
    private readonly _onDidChangeInstanceCapability;
    readonly onDidChangeInstanceCapability: import("vs/base/common/event").Event<ITerminalInstance>;
    private readonly _onDidChangeActiveInstance;
    readonly onDidChangeActiveInstance: import("vs/base/common/event").Event<ITerminalInstance | undefined>;
    private readonly _onDidChangeInstances;
    readonly onDidChangeInstances: import("vs/base/common/event").Event<void>;
    constructor(_editorService: IEditorService, _editorGroupsService: IEditorGroupsService, _terminalInstanceService: ITerminalInstanceService, _instantiationService: IInstantiationService, lifecycleService: ILifecycleService, _environmentService: IWorkbenchEnvironmentService, contextKeyService: IContextKeyService);
    private _getActiveTerminalEditors;
    get activeInstance(): ITerminalInstance | undefined;
    setActiveInstance(instance: ITerminalInstance): void;
    focusActiveInstance(): Promise<void>;
    private _setActiveInstance;
    openEditor(instance: ITerminalInstance, editorOptions?: TerminalEditorLocation): Promise<void>;
    resolveResource(instanceOrUri: ITerminalInstance | URI, isFutureSplit?: boolean): URI;
    getInputFromResource(resource: URI): TerminalEditorInput;
    private _registerInstance;
    getInstanceFromResource(resource?: URI): ITerminalInstance | undefined;
    splitInstance(instanceToSplit: ITerminalInstance, shellLaunchConfig?: IShellLaunchConfig): ITerminalInstance;
    reviveInput(deserializedInput: IDeserializedTerminalEditorInput): EditorInput;
    detachActiveEditorInstance(): ITerminalInstance;
    detachInstance(instance: ITerminalInstance): void;
    revealActiveEditor(preserveFocus?: boolean): Promise<void>;
}
