import 'vs/workbench/workbench.common.main';
import 'vs/workbench/browser/parts/dialogs/dialog.web.contribution';
import 'vs/workbench/browser/web.main';
import 'vs/workbench/services/integrity/browser/integrityService';
import 'vs/workbench/services/textMate/browser/browserTextMateService';
import 'vs/workbench/services/search/browser/searchService';
import 'vs/workbench/services/textfile/browser/browserTextFileService';
import 'vs/workbench/services/keybinding/browser/keyboardLayoutService';
import 'vs/workbench/services/extensions/browser/extensionService';
import 'vs/workbench/services/extensionManagement/browser/webExtensionsScannerService';
import 'vs/workbench/services/extensionManagement/common/extensionManagementServerService';
import 'vs/workbench/services/extensionManagement/browser/extensionUrlTrustService';
import 'vs/workbench/services/telemetry/browser/telemetryService';
import 'vs/workbench/services/credentials/browser/credentialsService';
import 'vs/workbench/services/url/browser/urlService';
import 'vs/workbench/services/update/browser/updateService';
import 'vs/workbench/services/workspaces/browser/workspacesService';
import 'vs/workbench/services/workspaces/browser/workspaceEditingService';
import 'vs/workbench/services/dialogs/browser/fileDialogService';
import 'vs/workbench/services/host/browser/browserHostService';
import 'vs/workbench/services/lifecycle/browser/lifecycleService';
import 'vs/workbench/services/clipboard/browser/clipboardService';
import 'vs/workbench/services/path/browser/pathService';
import 'vs/workbench/services/themes/browser/browserHostColorSchemeService';
import 'vs/workbench/services/encryption/browser/encryptionService';
import 'vs/workbench/services/workingCopy/browser/workingCopyBackupService';
import 'vs/workbench/services/tunnel/browser/tunnelService';
import 'vs/workbench/services/files/browser/elevatedFileService';
import 'vs/workbench/services/workingCopy/browser/workingCopyHistoryService';
import 'vs/workbench/services/userDataSync/browser/webUserDataSyncEnablementService';
import 'vs/workbench/services/userDataProfile/browser/userDataProfileStorageService';
import 'vs/workbench/services/configurationResolver/browser/configurationResolverService';
import 'vs/platform/extensionResourceLoader/browser/extensionResourceLoaderService';
import { LogLevel } from 'vs/platform/log/common/log';
import 'vs/workbench/contrib/logs/browser/logs.contribution';
import 'vs/workbench/contrib/files/browser/files.web.contribution';
import 'vs/workbench/contrib/localization/browser/localization.contribution';
import 'vs/workbench/contrib/performance/browser/performance.web.contribution';
import 'vs/workbench/contrib/preferences/browser/keyboardLayoutPicker';
import 'vs/workbench/contrib/debug/browser/extensionHostDebugService';
import 'vs/workbench/contrib/welcomeBanner/browser/welcomeBanner.contribution';
import 'vs/workbench/contrib/webview/browser/webview.web.contribution';
import 'vs/workbench/contrib/extensions/browser/extensions.web.contribution';
import 'vs/workbench/contrib/terminal/browser/terminal.web.contribution';
import 'vs/workbench/contrib/externalTerminal/browser/externalTerminal.contribution';
import 'vs/workbench/contrib/terminal/browser/terminalInstanceService';
import 'vs/workbench/contrib/tasks/browser/taskService';
import 'vs/workbench/contrib/tags/browser/workspaceTagsService';
import 'vs/workbench/contrib/issue/browser/issue.web.contribution';
import 'vs/workbench/contrib/splash/browser/splash.contribution';
import 'vs/workbench/contrib/offline/browser/offline.contribution';
import { create, commands, env, window, workspace, logger } from 'vs/workbench/browser/web.factory';
import { Menu } from 'vs/workbench/browser/web.api';
import { URI } from 'vs/base/common/uri';
import { Event, Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { GroupOrientation } from 'vs/workbench/services/editor/common/editorGroupsService';
export { create, URI, Event, Emitter, Disposable, GroupOrientation, LogLevel, env, window, workspace, commands, logger, Menu };
