import { SerializedError } from 'vs/base/common/errors';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainThreadExtensionServiceShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtensionService, MissingExtensionDependency, ExtensionActivationReason } from 'vs/workbench/services/extensions/common/extensions';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { UriComponents } from 'vs/base/common/uri';
export declare class MainThreadExtensionService implements MainThreadExtensionServiceShape {
    private readonly _extensionService;
    private readonly _notificationService;
    private readonly _extensionsWorkbenchService;
    private readonly _hostService;
    private readonly _extensionEnablementService;
    private readonly _timerService;
    private readonly _commandService;
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    private readonly _extensionHostKind;
    private readonly _internalExtensionService;
    constructor(extHostContext: IExtHostContext, _extensionService: IExtensionService, _notificationService: INotificationService, _extensionsWorkbenchService: IExtensionsWorkbenchService, _hostService: IHostService, _extensionEnablementService: IWorkbenchExtensionEnablementService, _timerService: ITimerService, _commandService: ICommandService, _environmentService: IWorkbenchEnvironmentService);
    dispose(): void;
    $getExtension(extensionId: string): Promise<Readonly<import("vs/platform/extensions/common/extensions").IRelaxedExtensionDescription> | undefined>;
    $activateExtension(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    $onWillActivateExtension(extensionId: ExtensionIdentifier): Promise<void>;
    $onDidActivateExtension(extensionId: ExtensionIdentifier, codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number, activationReason: ExtensionActivationReason): void;
    $onExtensionRuntimeError(extensionId: ExtensionIdentifier, data: SerializedError): void;
    $onExtensionActivationError(extensionId: ExtensionIdentifier, data: SerializedError, missingExtensionDependency: MissingExtensionDependency | null): Promise<void>;
    private _handleMissingInstalledDependency;
    private _handleMissingNotInstalledDependency;
    $setPerformanceMarks(marks: PerformanceMark[]): Promise<void>;
    $asBrowserUri(uri: UriComponents): Promise<UriComponents>;
}
