import 'vs/workbench/workbench.common.main';
import 'vs/workbench/electron-sandbox/desktop.main';
import 'vs/workbench/electron-sandbox/desktop.contribution';
import 'vs/workbench/electron-sandbox/parts/dialogs/dialog.contribution';
import 'vs/workbench/services/textfile/electron-sandbox/nativeTextFileService';
import 'vs/workbench/services/dialogs/electron-sandbox/fileDialogService';
import 'vs/workbench/services/workspaces/electron-sandbox/workspacesService';
import 'vs/workbench/services/textMate/browser/nativeTextMateService';
import 'vs/workbench/services/menubar/electron-sandbox/menubarService';
import 'vs/workbench/services/issue/electron-sandbox/issueService';
import 'vs/workbench/services/update/electron-sandbox/updateService';
import 'vs/workbench/services/url/electron-sandbox/urlService';
import 'vs/workbench/services/lifecycle/electron-sandbox/lifecycleService';
import 'vs/workbench/services/title/electron-sandbox/titleService';
import 'vs/workbench/services/host/electron-sandbox/nativeHostService';
import 'vs/workbench/services/request/electron-sandbox/requestService';
import 'vs/workbench/services/clipboard/electron-sandbox/clipboardService';
import 'vs/workbench/services/contextmenu/electron-sandbox/contextmenuService';
import 'vs/workbench/services/workspaces/electron-sandbox/workspaceEditingService';
import 'vs/workbench/services/configurationResolver/electron-sandbox/configurationResolverService';
import 'vs/workbench/services/accessibility/electron-sandbox/accessibilityService';
import 'vs/workbench/services/path/electron-sandbox/pathService';
import 'vs/workbench/services/themes/electron-sandbox/nativeHostColorSchemeService';
import 'vs/workbench/services/extensionManagement/electron-sandbox/extensionManagementService';
import 'vs/workbench/services/extensionManagement/electron-sandbox/extensionUrlTrustService';
import 'vs/workbench/services/credentials/electron-sandbox/credentialsService';
import 'vs/workbench/services/encryption/electron-sandbox/encryptionService';
import 'vs/workbench/services/localization/electron-sandbox/languagePackService';
import 'vs/workbench/services/telemetry/electron-sandbox/telemetryService';
import 'vs/workbench/services/extensions/electron-sandbox/extensionHostStarter';
import 'vs/platform/extensionResourceLoader/electron-sandbox/extensionResourceLoaderService';
import 'vs/platform/extensionManagement/electron-sandbox/extensionsScannerService';
import 'vs/workbench/services/extensionManagement/electron-sandbox/extensionManagementServerService';
import 'vs/workbench/services/extensionManagement/electron-sandbox/extensionTipsService';
import 'vs/workbench/services/userDataSync/electron-sandbox/userDataSyncMachinesService';
import 'vs/workbench/services/userDataSync/electron-sandbox/userDataSyncService';
import 'vs/workbench/services/userDataSync/electron-sandbox/userDataSyncAccountService';
import 'vs/workbench/services/userDataSync/electron-sandbox/userDataSyncStoreManagementService';
import 'vs/workbench/services/userDataSync/electron-sandbox/userDataAutoSyncService';
import 'vs/workbench/services/timer/electron-sandbox/timerService';
import 'vs/workbench/services/environment/electron-sandbox/shellEnvironmentService';
import 'vs/workbench/services/integrity/electron-sandbox/integrityService';
import 'vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService';
import 'vs/workbench/services/checksum/electron-sandbox/checksumService';
import 'vs/platform/remote/electron-sandbox/sharedProcessTunnelService';
import 'vs/workbench/services/tunnel/electron-sandbox/tunnelService';
import 'vs/platform/diagnostics/electron-sandbox/diagnosticsService';
import 'vs/platform/profiling/electron-sandbox/profilingService';
import 'vs/platform/telemetry/electron-sandbox/customEndpointTelemetryService';
import 'vs/platform/remoteTunnel/electron-sandbox/remoteTunnelService';
import 'vs/workbench/services/files/electron-sandbox/elevatedFileService';
import 'vs/workbench/services/search/electron-sandbox/searchService';
import 'vs/workbench/services/workingCopy/electron-sandbox/workingCopyHistoryService';
import 'vs/workbench/services/userDataSync/browser/userDataSyncEnablementService';
import 'vs/workbench/services/extensions/electron-sandbox/sandboxExtensionService';
import 'vs/platform/userDataProfile/electron-sandbox/userDataProfileStorageService';
import 'vs/workbench/contrib/logs/electron-sandbox/logs.contribution';
import 'vs/workbench/contrib/localization/electron-sandbox/localization.contribution';
import 'vs/workbench/contrib/files/electron-sandbox/files.contribution';
import 'vs/workbench/contrib/files/electron-sandbox/fileActions.contribution';
import 'vs/workbench/contrib/codeEditor/electron-sandbox/codeEditor.contribution';
import 'vs/workbench/contrib/debug/electron-sandbox/extensionHostDebugService';
import 'vs/workbench/contrib/extensions/electron-sandbox/extensions.contribution';
import 'vs/workbench/contrib/issue/electron-sandbox/issue.contribution';
import 'vs/workbench/contrib/remote/electron-sandbox/remote.contribution';
import 'vs/workbench/contrib/configExporter/electron-sandbox/configurationExportHelper.contribution';
import 'vs/workbench/contrib/terminal/electron-sandbox/terminal.contribution';
import 'vs/workbench/contrib/themes/browser/themes.test.contribution';
import 'vs/workbench/contrib/userDataSync/electron-sandbox/userDataSync.contribution';
import 'vs/workbench/contrib/tags/electron-sandbox/workspaceTagsService';
import 'vs/workbench/contrib/tags/electron-sandbox/tags.contribution';
import 'vs/workbench/contrib/performance/electron-sandbox/performance.contribution';
import 'vs/workbench/contrib/tasks/electron-sandbox/taskService';
import 'vs/workbench/contrib/externalTerminal/electron-sandbox/externalTerminal.contribution';
import 'vs/workbench/contrib/webview/electron-sandbox/webview.contribution';
import 'vs/workbench/contrib/splash/electron-sandbox/splash.contribution';
import 'vs/workbench/contrib/localHistory/electron-sandbox/localHistory.contribution';
import 'vs/workbench/contrib/mergeEditor/electron-sandbox/mergeEditor.contribution';
import 'vs/workbench/contrib/remoteTunnel/electron-sandbox/remoteTunnel.contribution';
export { main } from 'vs/workbench/electron-sandbox/desktop.main';
