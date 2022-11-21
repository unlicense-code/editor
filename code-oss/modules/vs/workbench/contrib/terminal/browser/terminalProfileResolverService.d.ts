import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IProcessEnvironment, OperatingSystem } from 'vs/base/common/platform';
import { IShellLaunchConfig, ITerminalProfile, TerminalIcon } from 'vs/platform/terminal/common/terminal';
import { IShellLaunchConfigResolveOptions, ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { URI } from 'vs/base/common/uri';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITerminalInstanceService } from 'vs/workbench/contrib/terminal/browser/terminal';
export interface IProfileContextProvider {
    getDefaultSystemShell: (remoteAuthority: string | undefined, os: OperatingSystem) => Promise<string>;
    getEnvironment: (remoteAuthority: string | undefined) => Promise<IProcessEnvironment>;
}
export declare abstract class BaseTerminalProfileResolverService implements ITerminalProfileResolverService {
    private readonly _context;
    private readonly _configurationService;
    private readonly _configurationResolverService;
    private readonly _historyService;
    private readonly _logService;
    private readonly _terminalProfileService;
    private readonly _workspaceContextService;
    private readonly _remoteAgentService;
    private readonly _storageService;
    private readonly _notificationService;
    _serviceBrand: undefined;
    private _primaryBackendOs;
    private readonly _iconRegistry;
    private _defaultProfileName;
    get defaultProfileName(): string | undefined;
    constructor(_context: IProfileContextProvider, _configurationService: IConfigurationService, _configurationResolverService: IConfigurationResolverService, _historyService: IHistoryService, _logService: ILogService, _terminalProfileService: ITerminalProfileService, _workspaceContextService: IWorkspaceContextService, _remoteAgentService: IRemoteAgentService, _storageService: IStorageService, _notificationService: INotificationService);
    private _refreshDefaultProfileName;
    resolveIcon(shellLaunchConfig: IShellLaunchConfig, os: OperatingSystem): void;
    getDefaultIcon(resource?: URI): TerminalIcon & ThemeIcon;
    resolveShellLaunchConfig(shellLaunchConfig: IShellLaunchConfig, options: IShellLaunchConfigResolveOptions): Promise<void>;
    getDefaultShell(options: IShellLaunchConfigResolveOptions): Promise<string>;
    getDefaultShellArgs(options: IShellLaunchConfigResolveOptions): Promise<string | string[]>;
    getDefaultProfile(options: IShellLaunchConfigResolveOptions): Promise<ITerminalProfile>;
    getEnvironment(remoteAuthority: string | undefined): Promise<IProcessEnvironment>;
    private _getCustomIcon;
    private _getUnresolvedDefaultProfile;
    private _setIconForAutomation;
    private _getUnresolvedRealDefaultProfile;
    private _getUnresolvedShellSettingDefaultProfile;
    private _getUnresolvedFallbackDefaultProfile;
    private _getUnresolvedAutomationShellProfile;
    private _resolveProfile;
    private _resolveVariables;
    private _getOsKey;
    private _guessProfileIcon;
    private _isValidShell;
    private _isValidShellArgs;
    createProfileFromShellAndShellArgs(shell?: unknown, shellArgs?: unknown): Promise<ITerminalProfile | string>;
    private _isValidAutomationProfile;
    showProfileMigrationNotification(): Promise<void>;
}
export declare class BrowserTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService: IConfigurationResolverService, configurationService: IConfigurationService, historyService: IHistoryService, logService: ILogService, terminalInstanceService: ITerminalInstanceService, terminalProfileService: ITerminalProfileService, workspaceContextService: IWorkspaceContextService, remoteAgentService: IRemoteAgentService, storageService: IStorageService, notificationService: INotificationService);
}
