import { IConfigurationValue } from 'vs/platform/configuration/common/configuration';
import { SettingsTarget } from 'vs/workbench/contrib/preferences/browser/preferencesWidgets';
import { ITOCEntry } from 'vs/workbench/contrib/preferences/browser/settingsLayout';
import { ISearchResult, ISetting, SettingValueType } from 'vs/workbench/services/preferences/common/preferences';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkbenchConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { IExtensionInfo } from 'vs/platform/configuration/common/configurationRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare const ONLINE_SERVICES_SETTING_TAG = "usesOnlineServices";
export interface ISettingsEditorViewState {
    settingsTarget: SettingsTarget;
    query?: string;
    tagFilters?: Set<string>;
    extensionFilters?: Set<string>;
    featureFilters?: Set<string>;
    idFilters?: Set<string>;
    languageFilter?: string;
    filterToCategory?: SettingsTreeGroupElement;
}
export declare abstract class SettingsTreeElement extends Disposable {
    id: string;
    parent?: SettingsTreeGroupElement;
    private _tabbable;
    protected readonly _onDidChangeTabbable: Emitter<void>;
    readonly onDidChangeTabbable: import("vs/base/common/event").Event<void>;
    constructor(_id: string);
    get tabbable(): boolean;
    set tabbable(value: boolean);
}
export declare type SettingsTreeGroupChild = (SettingsTreeGroupElement | SettingsTreeSettingElement | SettingsTreeNewExtensionsElement);
export declare class SettingsTreeGroupElement extends SettingsTreeElement {
    count?: number;
    label: string;
    level: number;
    isFirstGroup: boolean;
    private _childSettingKeys;
    private _children;
    get children(): SettingsTreeGroupChild[];
    set children(newChildren: SettingsTreeGroupChild[]);
    constructor(_id: string, count: number | undefined, label: string, level: number, isFirstGroup: boolean);
    /**
     * Returns whether this group contains the given child key (to a depth of 1 only)
     */
    containsSetting(key: string): boolean;
}
export declare class SettingsTreeNewExtensionsElement extends SettingsTreeElement {
    readonly extensionIds: string[];
    constructor(_id: string, extensionIds: string[]);
}
export declare class SettingsTreeSettingElement extends SettingsTreeElement {
    private readonly languageService;
    private static readonly MAX_DESC_LINES;
    setting: ISetting;
    private _displayCategory;
    private _displayLabel;
    /**
     * scopeValue || defaultValue, for rendering convenience.
     */
    value: any;
    /**
     * The value in the current settings scope.
     */
    scopeValue: any;
    /**
     * The default value
     */
    defaultValue?: any;
    /**
     * The source of the default value to display.
     * This value also accounts for extension-contributed language-specific default value overrides.
     */
    defaultValueSource: string | IExtensionInfo | undefined;
    /**
     * Whether the setting is configured in the selected scope.
     */
    isConfigured: boolean;
    /**
     * Whether the setting requires trusted target
     */
    isUntrusted: boolean;
    /**
     * Whether the setting is under a policy that blocks all changes.
     */
    hasPolicyValue: boolean;
    tags?: Set<string>;
    overriddenScopeList: string[];
    overriddenDefaultsLanguageList: string[];
    /**
     * For each language that contributes setting values or default overrides, we can see those values here.
     */
    languageOverrideValues: Map<string, IConfigurationValue<unknown>>;
    description: string;
    valueType: SettingValueType;
    constructor(setting: ISetting, parent: SettingsTreeGroupElement, inspectResult: IInspectResult, isWorkspaceTrusted: boolean, languageService: ILanguageService);
    get displayCategory(): string;
    get displayLabel(): string;
    private initLabels;
    update(inspectResult: IInspectResult, isWorkspaceTrusted: boolean): void;
    matchesAllTags(tagFilters?: Set<string>): boolean;
    matchesScope(scope: SettingsTarget, isRemote: boolean): boolean;
    matchesAnyExtension(extensionFilters?: Set<string>): boolean;
    matchesAnyFeature(featureFilters?: Set<string>): boolean;
    matchesAnyId(idFilters?: Set<string>): boolean;
    matchesAllLanguages(languageFilter?: string): boolean;
}
export declare class SettingsTreeModel {
    protected _viewState: ISettingsEditorViewState;
    private _isWorkspaceTrusted;
    private readonly _configurationService;
    private readonly _languageService;
    private readonly _userDataProfileService;
    protected _root: SettingsTreeGroupElement;
    private _treeElementsBySettingName;
    private _tocRoot;
    constructor(_viewState: ISettingsEditorViewState, _isWorkspaceTrusted: boolean, _configurationService: IWorkbenchConfigurationService, _languageService: ILanguageService, _userDataProfileService: IUserDataProfileService);
    get root(): SettingsTreeGroupElement;
    update(newTocRoot?: ITOCEntry<ISetting>): void;
    updateWorkspaceTrust(workspaceTrusted: boolean): void;
    private disposeChildren;
    private recursiveDispose;
    getElementsByName(name: string): SettingsTreeSettingElement[] | null;
    updateElementsByName(name: string): void;
    private updateRequireTrustedTargetElements;
    private getTargetToInspect;
    private updateSettings;
    private createSettingsTreeGroupElement;
    private getDepth;
    private createSettingsTreeSettingElement;
}
interface IInspectResult {
    isConfigured: boolean;
    inspected: IConfigurationValue<unknown>;
    targetSelector: 'applicationValue' | 'userLocalValue' | 'userRemoteValue' | 'workspaceValue' | 'workspaceFolderValue';
    inspectedLanguageOverrides: Map<string, IConfigurationValue<unknown>>;
    languageSelector: string | undefined;
}
export declare function inspectSetting(key: string, target: SettingsTarget, languageFilter: string | undefined, configurationService: IWorkbenchConfigurationService): IInspectResult;
export declare function settingKeyToDisplayFormat(key: string, groupId?: string, isLanguageTagSetting?: boolean): {
    category: string;
    label: string;
};
export declare function isExcludeSetting(setting: ISetting): boolean;
export declare const enum SearchResultIdx {
    Local = 0,
    Remote = 1,
    NewExtensions = 2
}
export declare class SearchResultModel extends SettingsTreeModel {
    private environmentService;
    private rawSearchResults;
    private cachedUniqueSearchResults;
    private newExtensionSearchResults;
    readonly id = "searchResultModel";
    constructor(viewState: ISettingsEditorViewState, isWorkspaceTrusted: boolean, configurationService: IWorkbenchConfigurationService, environmentService: IWorkbenchEnvironmentService, languageService: ILanguageService, userDataProfileService: IUserDataProfileService);
    getUniqueResults(): ISearchResult[];
    getRawResults(): ISearchResult[];
    setResult(order: SearchResultIdx, result: ISearchResult | null): void;
    updateChildren(): void;
    private getFlatSettings;
}
export interface IParsedQuery {
    tags: string[];
    query: string;
    extensionFilters: string[];
    idFilters: string[];
    featureFilters: string[];
    languageFilter: string | undefined;
}
export declare function parseQuery(query: string): IParsedQuery;
export {};
