import { Event } from 'vs/base/common/event';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWindowOpenable, IOpenWindowOptions, IOpenEmptyWindowOptions, IWorkspaceToOpen, IFolderToOpen } from 'vs/platform/window/common/window';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
import { Disposable } from 'vs/base/common/lifecycle';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { BrowserLifecycleService } from 'vs/workbench/services/lifecycle/browser/lifecycleService';
import { ILogService } from 'vs/platform/log/common/log';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
/**
 * A workspace to open in the workbench can either be:
 * - a workspace file with 0-N folders (via `workspaceUri`)
 * - a single folder (via `folderUri`)
 * - empty (via `undefined`)
 */
export declare type IWorkspace = IWorkspaceToOpen | IFolderToOpen | undefined;
export interface IWorkspaceProvider {
    /**
     * The initial workspace to open.
     */
    readonly workspace: IWorkspace;
    /**
     * Arbitrary payload from the `IWorkspaceProvider.open` call.
     */
    readonly payload?: object;
    /**
     * Return `true` if the provided [workspace](#IWorkspaceProvider.workspace) is trusted, `false` if not trusted, `undefined` if unknown.
     */
    readonly trusted: boolean | undefined;
    /**
     * Asks to open a workspace in the current or a new window.
     *
     * @param workspace the workspace to open.
     * @param options optional options for the workspace to open.
     * - `reuse`: whether to open inside the current window or a new window
     * - `payload`: arbitrary payload that should be made available
     * to the opening window via the `IWorkspaceProvider.payload` property.
     * @param payload optional payload to send to the workspace to open.
     *
     * @returns true if successfully opened, false otherwise.
     */
    open(workspace: IWorkspace, options?: {
        reuse?: boolean;
        payload?: object;
    }): Promise<boolean>;
}
export declare class BrowserHostService extends Disposable implements IHostService {
    private readonly layoutService;
    private readonly configurationService;
    private readonly fileService;
    private readonly labelService;
    private readonly environmentService;
    private readonly instantiationService;
    private readonly lifecycleService;
    private readonly logService;
    private readonly dialogService;
    private readonly contextService;
    private readonly userDataProfileService;
    readonly _serviceBrand: undefined;
    private workspaceProvider;
    private shutdownReason;
    constructor(layoutService: ILayoutService, configurationService: IConfigurationService, fileService: IFileService, labelService: ILabelService, environmentService: IBrowserWorkbenchEnvironmentService, instantiationService: IInstantiationService, lifecycleService: BrowserLifecycleService, logService: ILogService, dialogService: IDialogService, contextService: IWorkspaceContextService, userDataProfileService: IUserDataProfileService);
    private registerListeners;
    private onBeforeShutdown;
    private updateShutdownReasonFromEvent;
    get onDidChangeFocus(): Event<boolean>;
    get hasFocus(): boolean;
    hadLastFocus(): Promise<boolean>;
    focus(): Promise<void>;
    openWindow(options?: IOpenEmptyWindowOptions): Promise<void>;
    openWindow(toOpen: IWindowOpenable[], options?: IOpenWindowOptions): Promise<void>;
    private doOpenWindow;
    private withServices;
    private preservePayload;
    private getRecentLabel;
    private shouldReuse;
    private doOpenEmptyWindow;
    private doOpen;
    toggleFullScreen(): Promise<void>;
    restart(): Promise<void>;
    reload(): Promise<void>;
    close(): Promise<void>;
    private handleExpectedShutdown;
}
