import { Emitter } from 'vs/base/common/event';
import { IDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { SettingsTreeSettingElement } from 'vs/workbench/contrib/preferences/browser/settingsTreeModels';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
declare type ScopeString = 'workspace' | 'user' | 'remote';
export interface ISettingOverrideClickEvent {
    scope: ScopeString;
    language: string;
    settingKey: string;
}
/**
 * Renders the indicators next to a setting, such as "Also Modified In".
 */
export declare class SettingsTreeIndicatorsLabel implements IDisposable {
    private readonly userDataSyncEnablementService;
    private readonly languageService;
    private readonly userDataProfilesService;
    private readonly commandService;
    private indicatorsContainerElement;
    private hoverDelegate;
    private workspaceTrustIndicator;
    private scopeOverridesIndicator;
    private syncIgnoredIndicator;
    private defaultOverrideIndicator;
    private profilesEnabled;
    constructor(container: HTMLElement, configurationService: IConfigurationService, hoverService: IHoverService, userDataSyncEnablementService: IUserDataSyncEnablementService, languageService: ILanguageService, userDataProfilesService: IUserDataProfilesService, commandService: ICommandService);
    private createWorkspaceTrustIndicator;
    private createScopeOverridesIndicator;
    private createSyncIgnoredIndicator;
    private createDefaultOverrideIndicator;
    private render;
    updateWorkspaceTrust(element: SettingsTreeSettingElement): void;
    updateSyncIgnored(element: SettingsTreeSettingElement, ignoredSettings: string[]): void;
    private getInlineScopeDisplayText;
    dispose(): void;
    updateScopeOverrides(element: SettingsTreeSettingElement, elementDisposables: DisposableStore, onDidClickOverrideElement: Emitter<ISettingOverrideClickEvent>, onApplyFilter: Emitter<string>): void;
    updateDefaultOverrideIndicator(element: SettingsTreeSettingElement): void;
}
export declare function getIndicatorsLabelAriaLabel(element: SettingsTreeSettingElement, configurationService: IConfigurationService, userDataProfilesService: IUserDataProfilesService, languageService: ILanguageService): string;
export {};
