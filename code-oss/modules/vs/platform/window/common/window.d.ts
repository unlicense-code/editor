import { IStringDictionary } from 'vs/base/common/collections';
import { PerformanceMark } from 'vs/base/common/performance';
import { URI, UriComponents, UriDto } from 'vs/base/common/uri';
import { ISandboxConfiguration } from 'vs/base/parts/sandbox/common/sandboxTypes';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { FileType } from 'vs/platform/files/common/files';
import { LogLevel } from 'vs/platform/log/common/log';
import { PolicyDefinition, PolicyValue } from 'vs/platform/policy/common/policy';
import { IPartsSplash } from 'vs/platform/theme/common/themeService';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IAnyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export declare const WindowMinimumSize: {
    WIDTH: number;
    WIDTH_WITH_VERTICAL_PANEL: number;
    HEIGHT: number;
};
export interface IBaseOpenWindowsOptions {
    /**
     * Whether to reuse the window or open a new one.
     */
    readonly forceReuseWindow?: boolean;
    /**
     * The remote authority to use when windows are opened with either
     * - no workspace (empty window)
     * - a workspace that is neither `file://` nor `vscode-remote://`
     * Use 'null' for a local window.
     * If not set, defaults to the remote authority of the current window.
     */
    readonly remoteAuthority?: string | null;
}
export interface IOpenWindowOptions extends IBaseOpenWindowsOptions {
    readonly forceNewWindow?: boolean;
    readonly preferNewWindow?: boolean;
    readonly noRecentEntry?: boolean;
    readonly addMode?: boolean;
    readonly diffMode?: boolean;
    readonly mergeMode?: boolean;
    readonly gotoLineMode?: boolean;
    readonly waitMarkerFileURI?: URI;
}
export interface IAddFoldersRequest {
    readonly foldersToAdd: UriComponents[];
}
export interface IOpenedWindow {
    readonly id: number;
    readonly workspace?: IAnyWorkspaceIdentifier;
    readonly title: string;
    readonly filename?: string;
    readonly dirty: boolean;
}
export interface IOpenEmptyWindowOptions extends IBaseOpenWindowsOptions {
}
export declare type IWindowOpenable = IWorkspaceToOpen | IFolderToOpen | IFileToOpen;
export interface IBaseWindowOpenable {
    label?: string;
}
export interface IWorkspaceToOpen extends IBaseWindowOpenable {
    readonly workspaceUri: URI;
}
export interface IFolderToOpen extends IBaseWindowOpenable {
    readonly folderUri: URI;
}
export interface IFileToOpen extends IBaseWindowOpenable {
    readonly fileUri: URI;
}
export declare function isWorkspaceToOpen(uriToOpen: IWindowOpenable): uriToOpen is IWorkspaceToOpen;
export declare function isFolderToOpen(uriToOpen: IWindowOpenable): uriToOpen is IFolderToOpen;
export declare function isFileToOpen(uriToOpen: IWindowOpenable): uriToOpen is IFileToOpen;
export declare type MenuBarVisibility = 'classic' | 'visible' | 'toggle' | 'hidden' | 'compact';
export declare function getMenuBarVisibility(configurationService: IConfigurationService): MenuBarVisibility;
export interface IWindowsConfiguration {
    readonly window: IWindowSettings;
}
export interface IWindowSettings {
    readonly openFilesInNewWindow: 'on' | 'off' | 'default';
    readonly openFoldersInNewWindow: 'on' | 'off' | 'default';
    readonly openWithoutArgumentsInNewWindow: 'on' | 'off';
    readonly restoreWindows: 'preserve' | 'all' | 'folders' | 'one' | 'none';
    readonly restoreFullscreen: boolean;
    readonly zoomLevel: number;
    readonly titleBarStyle: 'native' | 'custom';
    readonly autoDetectHighContrast: boolean;
    readonly autoDetectColorScheme: boolean;
    readonly menuBarVisibility: MenuBarVisibility;
    readonly newWindowDimensions: 'default' | 'inherit' | 'offset' | 'maximized' | 'fullscreen';
    readonly nativeTabs: boolean;
    readonly nativeFullScreen: boolean;
    readonly enableMenuBarMnemonics: boolean;
    readonly closeWhenEmpty: boolean;
    readonly clickThroughInactive: boolean;
    readonly experimental?: {
        useSandbox: boolean;
    };
}
export declare function getTitleBarStyle(configurationService: IConfigurationService): 'native' | 'custom';
export declare function useWindowControlsOverlay(configurationService: IConfigurationService): boolean;
export interface IPath<T = IEditorOptions> extends IPathData<T> {
    /**
     * The file path to open within the instance
     */
    fileUri?: URI;
}
export interface IPathData<T = IEditorOptions> {
    /**
     * The file path to open within the instance
     */
    readonly fileUri?: UriComponents;
    /**
     * Optional editor options to apply in the file
     */
    readonly options?: T;
    /**
     * A hint that the file exists. if true, the
     * file exists, if false it does not. with
     * `undefined` the state is unknown.
     */
    readonly exists?: boolean;
    /**
     * A hint about the file type of this path.
     * with `undefined` the type is unknown.
     */
    readonly type?: FileType;
    /**
     * Specifies if the file should be only be opened
     * if it exists.
     */
    readonly openOnlyIfExists?: boolean;
}
export interface IPathsToWaitFor extends IPathsToWaitForData {
    paths: IPath[];
    waitMarkerFileUri: URI;
}
interface IPathsToWaitForData {
    readonly paths: IPathData[];
    readonly waitMarkerFileUri: UriComponents;
}
export interface IOpenFileRequest {
    readonly filesToOpenOrCreate?: IPathData[];
    readonly filesToDiff?: IPathData[];
    readonly filesToMerge?: IPathData[];
}
/**
 * Additional context for the request on native only.
 */
export interface INativeOpenFileRequest extends IOpenFileRequest {
    readonly termProgram?: string;
    readonly filesToWait?: IPathsToWaitForData;
}
export interface INativeRunActionInWindowRequest {
    readonly id: string;
    readonly from: 'menu' | 'touchbar' | 'mouse';
    readonly args?: any[];
}
export interface INativeRunKeybindingInWindowRequest {
    readonly userSettingsLabel: string;
}
export interface IColorScheme {
    readonly dark: boolean;
    readonly highContrast: boolean;
}
export interface IWindowConfiguration {
    remoteAuthority?: string;
    filesToOpenOrCreate?: IPath[];
    filesToDiff?: IPath[];
    filesToMerge?: IPath[];
}
export interface IOSConfiguration {
    readonly release: string;
    readonly hostname: string;
}
export interface INativeWindowConfiguration extends IWindowConfiguration, NativeParsedArgs, ISandboxConfiguration {
    mainPid: number;
    machineId: string;
    execPath: string;
    backupPath?: string;
    profiles: {
        all: readonly UriDto<IUserDataProfile>[];
        profile: UriDto<IUserDataProfile>;
    };
    homeDir: string;
    tmpDir: string;
    userDataDir: string;
    partsSplash?: IPartsSplash;
    workspace?: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier;
    isInitialStartup?: boolean;
    logLevel: LogLevel;
    fullscreen?: boolean;
    maximized?: boolean;
    accessibilitySupport?: boolean;
    colorScheme: IColorScheme;
    autoDetectHighContrast?: boolean;
    autoDetectColorScheme?: boolean;
    perfMarks: PerformanceMark[];
    filesToWait?: IPathsToWaitFor;
    os: IOSConfiguration;
    policiesData?: IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }>;
}
/**
 * According to Electron docs: `scale := 1.2 ^ level`.
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
 */
export declare function zoomLevelToZoomFactor(zoomLevel?: number): number;
export {};
