import { IStringDictionary } from 'vs/base/common/collections';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, IReference } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IRange } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { ITextEditorModel } from 'vs/editor/common/services/resolverService';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { IFilterMetadata, IFilterResult, IGroupFilter, IKeybindingsEditorModel, ISearchResultGroup, ISetting, ISettingMatch, ISettingMatcher, ISettingsEditorModel, ISettingsGroup } from 'vs/workbench/services/preferences/common/preferences';
export declare const nullRange: IRange;
export declare function isNullRange(range: IRange): boolean;
export declare abstract class AbstractSettingsModel extends EditorModel {
    protected _currentResultGroups: Map<string, ISearchResultGroup>;
    updateResultGroup(id: string, resultGroup: ISearchResultGroup | undefined): IFilterResult | undefined;
    /**
     * Remove duplicates between result groups, preferring results in earlier groups
     */
    private removeDuplicateResults;
    private compareTwoNullableNumbers;
    filterSettings(filter: string, groupFilter: IGroupFilter, settingMatcher: ISettingMatcher): ISettingMatch[];
    getPreference(key: string): ISetting | undefined;
    protected collectMetadata(groups: ISearchResultGroup[]): IStringDictionary<IFilterMetadata>;
    protected get filterGroups(): ISettingsGroup[];
    abstract settingsGroups: ISettingsGroup[];
    abstract findValueMatches(filter: string, setting: ISetting): IRange[];
    protected abstract update(): IFilterResult | undefined;
}
export declare class SettingsEditorModel extends AbstractSettingsModel implements ISettingsEditorModel {
    private _configurationTarget;
    private _settingsGroups;
    protected settingsModel: ITextModel;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    constructor(reference: IReference<ITextEditorModel>, _configurationTarget: ConfigurationTarget);
    get uri(): URI;
    get configurationTarget(): ConfigurationTarget;
    get settingsGroups(): ISettingsGroup[];
    get content(): string;
    findValueMatches(filter: string, setting: ISetting): IRange[];
    protected isSettingsProperty(property: string, previousParents: string[]): boolean;
    protected parse(): void;
    protected update(): IFilterResult | undefined;
}
export declare class Settings2EditorModel extends AbstractSettingsModel implements ISettingsEditorModel {
    private _defaultSettings;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    private dirty;
    constructor(_defaultSettings: DefaultSettings, configurationService: IConfigurationService);
    protected get filterGroups(): ISettingsGroup[];
    get settingsGroups(): ISettingsGroup[];
    findValueMatches(filter: string, setting: ISetting): IRange[];
    protected update(): IFilterResult;
}
export declare class WorkspaceConfigurationEditorModel extends SettingsEditorModel {
    private _configurationGroups;
    get configurationGroups(): ISettingsGroup[];
    protected parse(): void;
    protected isSettingsProperty(property: string, previousParents: string[]): boolean;
}
export declare class DefaultSettings extends Disposable {
    private _mostCommonlyUsedSettingsKeys;
    readonly target: ConfigurationTarget;
    private _allSettingsGroups;
    private _content;
    private _contentWithoutMostCommonlyUsed;
    private _settingsByName;
    readonly _onDidChange: Emitter<void>;
    readonly onDidChange: Event<void>;
    constructor(_mostCommonlyUsedSettingsKeys: string[], target: ConfigurationTarget);
    getContent(forceUpdate?: boolean): string;
    getContentWithoutMostCommonlyUsed(forceUpdate?: boolean): string;
    getSettingsGroups(forceUpdate?: boolean): ISettingsGroup[];
    private initialize;
    private parse;
    getRegisteredGroups(): ISettingsGroup[];
    private sortGroups;
    private initAllSettingsMap;
    private getMostCommonlyUsedSettings;
    private parseConfig;
    private removeEmptySettingsGroups;
    private parseSettings;
    private parseOverrideSettings;
    private matchesScope;
    private compareConfigurationNodes;
    private toContent;
}
export declare class DefaultSettingsEditorModel extends AbstractSettingsModel implements ISettingsEditorModel {
    private _uri;
    private readonly defaultSettings;
    private _model;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    constructor(_uri: URI, reference: IReference<ITextEditorModel>, defaultSettings: DefaultSettings);
    get uri(): URI;
    get target(): ConfigurationTarget;
    get settingsGroups(): ISettingsGroup[];
    protected get filterGroups(): ISettingsGroup[];
    protected update(): IFilterResult | undefined;
    /**
     * Translate the ISearchResultGroups to text, and write it to the editor model
     */
    private writeResultGroups;
    private writeSettingsGroupToBuilder;
    private copySetting;
    findValueMatches(filter: string, setting: ISetting): IRange[];
    getPreference(key: string): ISetting | undefined;
    private getGroup;
}
export declare class DefaultRawSettingsEditorModel extends Disposable {
    private defaultSettings;
    private _content;
    constructor(defaultSettings: DefaultSettings);
    get content(): string;
}
export declare function defaultKeybindingsContents(keybindingService: IKeybindingService): string;
export declare class DefaultKeybindingsEditorModel implements IKeybindingsEditorModel<any> {
    private _uri;
    private readonly keybindingService;
    private _content;
    constructor(_uri: URI, keybindingService: IKeybindingService);
    get uri(): URI;
    get content(): string;
    getPreference(): any;
    dispose(): void;
}
