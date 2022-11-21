import { ISandboxConfiguration } from 'vs/base/parts/sandbox/common/sandboxTypes';
export interface WindowStyles {
    backgroundColor?: string;
    color?: string;
}
export interface WindowData {
    styles: WindowStyles;
    zoomLevel: number;
}
export declare const enum IssueType {
    Bug = 0,
    PerformanceIssue = 1,
    FeatureRequest = 2
}
export interface IssueReporterStyles extends WindowStyles {
    textLinkColor?: string;
    textLinkActiveForeground?: string;
    inputBackground?: string;
    inputForeground?: string;
    inputBorder?: string;
    inputErrorBorder?: string;
    inputErrorBackground?: string;
    inputErrorForeground?: string;
    inputActiveBorder?: string;
    buttonBackground?: string;
    buttonForeground?: string;
    buttonHoverBackground?: string;
    sliderBackgroundColor?: string;
    sliderHoverColor?: string;
    sliderActiveColor?: string;
}
export interface IssueReporterExtensionData {
    name: string;
    publisher: string | undefined;
    version: string;
    id: string;
    isTheme: boolean;
    isBuiltin: boolean;
    displayName: string | undefined;
    repositoryUrl: string | undefined;
    bugsUrl: string | undefined;
}
export interface IssueReporterData extends WindowData {
    styles: IssueReporterStyles;
    enabledExtensions: IssueReporterExtensionData[];
    issueType?: IssueType;
    extensionId?: string;
    experiments?: string;
    restrictedMode: boolean;
    isUnsupported: boolean;
    isSandboxed: boolean;
    githubAccessToken: string;
    readonly issueTitle?: string;
    readonly issueBody?: string;
}
export interface ISettingSearchResult {
    extensionId: string;
    key: string;
    score: number;
}
export interface ProcessExplorerStyles extends WindowStyles {
    listHoverBackground?: string;
    listHoverForeground?: string;
    listFocusBackground?: string;
    listFocusForeground?: string;
    listFocusOutline?: string;
    listActiveSelectionBackground?: string;
    listActiveSelectionForeground?: string;
    listHoverOutline?: string;
    scrollbarShadowColor?: string;
    scrollbarSliderBackgroundColor?: string;
    scrollbarSliderHoverBackgroundColor?: string;
    scrollbarSliderActiveBackgroundColor?: string;
}
export interface ProcessExplorerData extends WindowData {
    pid: number;
    styles: ProcessExplorerStyles;
    platform: string;
    applicationName: string;
}
export interface ICommonIssueService {
    readonly _serviceBrand: undefined;
    openReporter(data: IssueReporterData): Promise<void>;
    openProcessExplorer(data: ProcessExplorerData): Promise<void>;
    getSystemStatus(): Promise<string>;
}
export interface IssueReporterWindowConfiguration extends ISandboxConfiguration {
    disableExtensions: boolean;
    data: IssueReporterData;
    os: {
        type: string;
        arch: string;
        release: string;
    };
}
export interface ProcessExplorerWindowConfiguration extends ISandboxConfiguration {
    data: ProcessExplorerData;
}
