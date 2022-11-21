import { SystemInfo } from 'vs/platform/diagnostics/common/diagnostics';
import { ISettingSearchResult, IssueReporterExtensionData, IssueType } from 'vs/platform/issue/common/issue';
export interface IssueReporterData {
    issueType: IssueType;
    issueDescription?: string;
    versionInfo?: any;
    systemInfo?: SystemInfo;
    processInfo?: any;
    workspaceInfo?: any;
    includeSystemInfo: boolean;
    includeWorkspaceInfo: boolean;
    includeProcessInfo: boolean;
    includeExtensions: boolean;
    includeExperiments: boolean;
    numberOfThemeExtesions?: number;
    allExtensions: IssueReporterExtensionData[];
    enabledNonThemeExtesions?: IssueReporterExtensionData[];
    extensionsDisabled?: boolean;
    fileOnExtension?: boolean;
    fileOnMarketplace?: boolean;
    selectedExtension?: IssueReporterExtensionData;
    actualSearchResults?: ISettingSearchResult[];
    query?: string;
    filterResultCount?: number;
    experimentInfo?: string;
    restrictedMode?: boolean;
    isUnsupported?: boolean;
    isSandboxed?: boolean;
}
export declare class IssueReporterModel {
    private readonly _data;
    constructor(initialData?: Partial<IssueReporterData>);
    getData(): IssueReporterData;
    update(newData: Partial<IssueReporterData>): void;
    serialize(): string;
    private getRemoteOSes;
    fileOnExtension(): boolean | undefined;
    private getExtensionVersion;
    private getIssueTypeTitle;
    private getInfos;
    private generateSystemInfoMd;
    private generateProcessInfoMd;
    private generateWorkspaceInfoMd;
    private generateExperimentsInfoMd;
    private generateExtensionsMd;
}
