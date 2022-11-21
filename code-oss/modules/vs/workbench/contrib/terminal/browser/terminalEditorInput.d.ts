import { URI } from 'vs/base/common/uri';
import { EditorInputCapabilities, IEditorIdentifier, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorInput, IEditorCloseHandler } from 'vs/workbench/common/editor/editorInput';
import { ITerminalInstance, ITerminalInstanceService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IShellLaunchConfig } from 'vs/platform/terminal/common/terminal';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ConfirmResult, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { Emitter } from 'vs/base/common/event';
export declare class TerminalEditorInput extends EditorInput implements IEditorCloseHandler {
    readonly resource: URI;
    private _terminalInstance;
    private readonly _themeService;
    private readonly _terminalInstanceService;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _lifecycleService;
    private readonly _dialogService;
    static readonly ID = "workbench.editors.terminal";
    readonly closeHandler: this;
    private _isDetached;
    private _isShuttingDown;
    private _isReverted;
    private _copyLaunchConfig?;
    private _terminalEditorFocusContextKey;
    private _group;
    protected readonly _onDidRequestAttach: Emitter<ITerminalInstance>;
    readonly onDidRequestAttach: import("vs/base/common/event").Event<ITerminalInstance>;
    setGroup(group: IEditorGroup | undefined): void;
    get group(): IEditorGroup | undefined;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    setTerminalInstance(instance: ITerminalInstance): void;
    copy(): EditorInput;
    /**
     * Sets the launch config to use for the next call to EditorInput.copy, which will be used when
     * the editor's split command is run.
     */
    setCopyLaunchConfig(launchConfig: IShellLaunchConfig): void;
    /**
     * Returns the terminal instance for this input if it has not yet been detached from the input.
     */
    get terminalInstance(): ITerminalInstance | undefined;
    showConfirm(): boolean;
    confirm(terminals: ReadonlyArray<IEditorIdentifier>): Promise<ConfirmResult>;
    revert(): Promise<void>;
    constructor(resource: URI, _terminalInstance: ITerminalInstance | undefined, _themeService: IThemeService, _terminalInstanceService: ITerminalInstanceService, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _lifecycleService: ILifecycleService, _contextKeyService: IContextKeyService, _dialogService: IDialogService);
    private _setupInstanceListeners;
    getName(): string;
    getLabelExtraClasses(): string[];
    /**
     * Detach the instance from the input such that when the input is disposed it will not dispose
     * of the terminal instance/process.
     */
    detachInstance(): void;
    getDescription(): string | undefined;
    toUntyped(): IUntypedEditorInput;
}
