/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as DOM from 'vs/base/browser/dom';
import { setupCustomHover } from 'vs/base/browser/ui/iconLabel/iconLabelHover';
import { SimpleIconLabel } from 'vs/base/browser/ui/iconLabel/simpleIconLabel';
import { MutableDisposable } from 'vs/base/common/lifecycle';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { localize } from 'vs/nls';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { getIgnoredSettings } from 'vs/platform/userDataSync/common/settingsMerge';
import { getDefaultIgnoredSettings, IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { MODIFIED_INDICATOR_USE_INLINE_ONLY, POLICY_SETTING_TAG } from 'vs/workbench/contrib/preferences/common/preferences';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
const $ = DOM.$;
/**
 * Renders the indicators next to a setting, such as "Also Modified In".
 */
let SettingsTreeIndicatorsLabel = class SettingsTreeIndicatorsLabel {
    userDataSyncEnablementService;
    languageService;
    userDataProfilesService;
    commandService;
    indicatorsContainerElement;
    hoverDelegate;
    workspaceTrustIndicator;
    scopeOverridesIndicator;
    syncIgnoredIndicator;
    defaultOverrideIndicator;
    profilesEnabled;
    constructor(container, configurationService, hoverService, userDataSyncEnablementService, languageService, userDataProfilesService, commandService) {
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.languageService = languageService;
        this.userDataProfilesService = userDataProfilesService;
        this.commandService = commandService;
        this.indicatorsContainerElement = DOM.append(container, $('.misc-label'));
        this.indicatorsContainerElement.style.display = 'inline';
        this.hoverDelegate = {
            showHover: (options, focus) => {
                return hoverService.showHover(options, focus);
            },
            onDidHideHover: () => { },
            delay: configurationService.getValue('workbench.hover.delay'),
            placement: 'element'
        };
        this.profilesEnabled = this.userDataProfilesService.isEnabled();
        this.workspaceTrustIndicator = this.createWorkspaceTrustIndicator();
        this.scopeOverridesIndicator = this.createScopeOverridesIndicator();
        this.syncIgnoredIndicator = this.createSyncIgnoredIndicator();
        this.defaultOverrideIndicator = this.createDefaultOverrideIndicator();
    }
    createWorkspaceTrustIndicator() {
        const workspaceTrustElement = $('span.setting-indicator.setting-item-workspace-trust');
        const workspaceTrustLabel = new SimpleIconLabel(workspaceTrustElement);
        workspaceTrustLabel.text = '$(warning) ' + localize('workspaceUntrustedLabel', "Setting value not applied");
        const contentFallback = localize('trustLabel', "The setting value can only be applied in a trusted workspace.");
        const contentMarkdownString = contentFallback + ` [${localize('manageWorkspaceTrust', "Manage Workspace Trust")}](manage-workspace-trust).`;
        const content = {
            markdown: {
                value: contentMarkdownString,
                isTrusted: false,
                supportHtml: false
            },
            markdownNotSupportedFallback: contentFallback
        };
        const hover = new MutableDisposable();
        const options = {
            linkHandler: (url) => {
                this.commandService.executeCommand('workbench.trust.manage');
                hover.value?.hide();
            }
        };
        hover.value = setupCustomHover(this.hoverDelegate, workspaceTrustElement, content, options);
        return {
            element: workspaceTrustElement,
            label: workspaceTrustLabel,
            hover
        };
    }
    createScopeOverridesIndicator() {
        // Don't add .setting-indicator class here, because it gets conditionally added later.
        const otherOverridesElement = $('span.setting-item-overrides');
        const otherOverridesLabel = new SimpleIconLabel(otherOverridesElement);
        return {
            element: otherOverridesElement,
            label: otherOverridesLabel,
            hover: new MutableDisposable()
        };
    }
    createSyncIgnoredIndicator() {
        const syncIgnoredElement = $('span.setting-indicator.setting-item-ignored');
        const syncIgnoredLabel = new SimpleIconLabel(syncIgnoredElement);
        syncIgnoredLabel.text = localize('extensionSyncIgnoredLabel', 'Not synced');
        const syncIgnoredHoverContent = localize('syncIgnoredTitle', "This setting is ignored during sync");
        const hover = new MutableDisposable();
        hover.value = setupCustomHover(this.hoverDelegate, syncIgnoredElement, syncIgnoredHoverContent);
        return {
            element: syncIgnoredElement,
            label: syncIgnoredLabel,
            hover
        };
    }
    createDefaultOverrideIndicator() {
        const defaultOverrideIndicator = $('span.setting-indicator.setting-item-default-overridden');
        const defaultOverrideLabel = new SimpleIconLabel(defaultOverrideIndicator);
        defaultOverrideLabel.text = localize('defaultOverriddenLabel', "Default value changed");
        return {
            element: defaultOverrideIndicator,
            label: defaultOverrideLabel,
            hover: new MutableDisposable()
        };
    }
    render() {
        const indicatorsToShow = [this.workspaceTrustIndicator, this.scopeOverridesIndicator, this.syncIgnoredIndicator, this.defaultOverrideIndicator].filter(indicator => {
            return indicator.element.style.display !== 'none';
        });
        this.indicatorsContainerElement.innerText = '';
        this.indicatorsContainerElement.style.display = 'none';
        if (indicatorsToShow.length) {
            this.indicatorsContainerElement.style.display = 'inline';
            DOM.append(this.indicatorsContainerElement, $('span', undefined, '('));
            for (let i = 0; i < indicatorsToShow.length - 1; i++) {
                DOM.append(this.indicatorsContainerElement, indicatorsToShow[i].element);
                DOM.append(this.indicatorsContainerElement, $('span.comma', undefined, ' • '));
            }
            DOM.append(this.indicatorsContainerElement, indicatorsToShow[indicatorsToShow.length - 1].element);
            DOM.append(this.indicatorsContainerElement, $('span', undefined, ')'));
        }
    }
    updateWorkspaceTrust(element) {
        this.workspaceTrustIndicator.element.style.display = element.isUntrusted ? 'inline' : 'none';
        this.render();
    }
    updateSyncIgnored(element, ignoredSettings) {
        this.syncIgnoredIndicator.element.style.display = this.userDataSyncEnablementService.isEnabled()
            && ignoredSettings.includes(element.setting.key) ? 'inline' : 'none';
        this.render();
    }
    getInlineScopeDisplayText(completeScope) {
        const [scope, language] = completeScope.split(':');
        const localizedScope = scope === 'user' ?
            localize('user', "User") : scope === 'workspace' ?
            localize('workspace', "Workspace") : localize('remote', "Remote");
        if (language) {
            return `${this.languageService.getLanguageName(language)} > ${localizedScope}`;
        }
        return localizedScope;
    }
    dispose() {
        const indicators = [this.workspaceTrustIndicator, this.scopeOverridesIndicator,
            this.syncIgnoredIndicator, this.defaultOverrideIndicator];
        for (const indicator of indicators) {
            indicator.hover.dispose();
        }
    }
    updateScopeOverrides(element, elementDisposables, onDidClickOverrideElement, onApplyFilter) {
        this.scopeOverridesIndicator.element.innerText = '';
        this.scopeOverridesIndicator.element.style.display = 'none';
        if (element.hasPolicyValue) {
            // If the setting falls under a policy, then no matter what the user sets, the policy value takes effect.
            this.scopeOverridesIndicator.element.style.display = 'inline';
            this.scopeOverridesIndicator.element.classList.add('setting-indicator');
            this.scopeOverridesIndicator.label.text = '$(warning) ' + localize('policyLabelText', "Setting value not applied");
            const contentFallback = localize('policyDescription', "This setting is managed by your organization and its applied value cannot be changed.");
            const contentMarkdownString = contentFallback + ` [${localize('policyFilterLink', "View policy settings")}](policy-settings).`;
            const content = {
                markdown: {
                    value: contentMarkdownString,
                    isTrusted: false,
                    supportHtml: false
                },
                markdownNotSupportedFallback: contentFallback
            };
            const options = {
                linkHandler: _ => {
                    onApplyFilter.fire(`@${POLICY_SETTING_TAG}`);
                    this.scopeOverridesIndicator.hover.value?.hide();
                }
            };
            this.scopeOverridesIndicator.hover.value = setupCustomHover(this.hoverDelegate, this.scopeOverridesIndicator.element, content, options);
        }
        else if (this.profilesEnabled && element.matchesScope(1 /* ConfigurationTarget.APPLICATION */, false)) {
            // If the setting is an application-scoped setting, there are no overrides so we can use this
            // indicator to display that information instead.
            this.scopeOverridesIndicator.element.style.display = 'inline';
            this.scopeOverridesIndicator.element.classList.add('setting-indicator');
            const applicationSettingText = localize('applicationSetting', "Applies to all profiles");
            this.scopeOverridesIndicator.label.text = applicationSettingText;
            const content = localize('applicationSettingDescription', "The setting is not specific to the current profile, and will retain its value when switching profiles.");
            this.scopeOverridesIndicator.hover.value = setupCustomHover(this.hoverDelegate, this.scopeOverridesIndicator.element, content);
        }
        else if (element.overriddenScopeList.length || element.overriddenDefaultsLanguageList.length) {
            if ((MODIFIED_INDICATOR_USE_INLINE_ONLY && element.overriddenScopeList.length) ||
                (element.overriddenScopeList.length === 1 && !element.overriddenDefaultsLanguageList.length)) {
                // This branch renders some info inline!
                // Render inline if we have the flag and there are scope overrides to render,
                // or if there is only one scope override to render and no language overrides.
                this.scopeOverridesIndicator.element.style.display = 'inline';
                this.scopeOverridesIndicator.element.classList.remove('setting-indicator');
                this.scopeOverridesIndicator.hover.value = undefined;
                // Just show all the text in the label.
                const prefaceText = element.isConfigured ?
                    localize('alsoConfiguredIn', "Also modified in") :
                    localize('configuredIn', "Modified in");
                this.scopeOverridesIndicator.label.text = `${prefaceText} `;
                for (let i = 0; i < element.overriddenScopeList.length; i++) {
                    const overriddenScope = element.overriddenScopeList[i];
                    const view = DOM.append(this.scopeOverridesIndicator.element, $('a.modified-scope', undefined, this.getInlineScopeDisplayText(overriddenScope)));
                    if (i !== element.overriddenScopeList.length - 1) {
                        DOM.append(this.scopeOverridesIndicator.element, $('span.comma', undefined, ', '));
                    }
                    elementDisposables.add(DOM.addStandardDisposableListener(view, DOM.EventType.CLICK, (e) => {
                        const [scope, language] = overriddenScope.split(':');
                        onDidClickOverrideElement.fire({
                            settingKey: element.setting.key,
                            scope: scope,
                            language
                        });
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                }
            }
            else if (!MODIFIED_INDICATOR_USE_INLINE_ONLY) {
                // Even if the check above fails, we want to
                // show the text in a custom hover only if
                // the feature flag isn't on.
                this.scopeOverridesIndicator.element.style.display = 'inline';
                this.scopeOverridesIndicator.element.classList.add('setting-indicator');
                const scopeOverridesLabelText = element.isConfigured ?
                    localize('alsoConfiguredElsewhere', "Also modified elsewhere") :
                    localize('configuredElsewhere', "Modified elsewhere");
                this.scopeOverridesIndicator.label.text = scopeOverridesLabelText;
                let contentMarkdownString = '';
                let contentFallback = '';
                if (element.overriddenScopeList.length) {
                    const prefaceText = element.isConfigured ?
                        localize('alsoModifiedInScopes', "The setting has also been modified in the following scopes:") :
                        localize('modifiedInScopes', "The setting has been modified in the following scopes:");
                    contentMarkdownString = prefaceText;
                    contentFallback = prefaceText;
                    for (const scope of element.overriddenScopeList) {
                        const scopeDisplayText = this.getInlineScopeDisplayText(scope);
                        contentMarkdownString += `\n- [${scopeDisplayText}](${encodeURIComponent(scope)} "${getAccessibleScopeDisplayText(scope, this.languageService)}")`;
                        contentFallback += `\n• ${scopeDisplayText}`;
                    }
                }
                if (element.overriddenDefaultsLanguageList.length) {
                    if (contentMarkdownString) {
                        contentMarkdownString += `\n\n`;
                        contentFallback += `\n\n`;
                    }
                    const prefaceText = localize('hasDefaultOverridesForLanguages', "The following languages have default overrides:");
                    contentMarkdownString += prefaceText;
                    contentFallback += prefaceText;
                    for (const language of element.overriddenDefaultsLanguageList) {
                        const scopeDisplayText = this.languageService.getLanguageName(language);
                        contentMarkdownString += `\n- [${scopeDisplayText}](${encodeURIComponent(`default:${language}`)} "${scopeDisplayText}")`;
                        contentFallback += `\n• ${scopeDisplayText}`;
                    }
                }
                const content = {
                    markdown: {
                        value: contentMarkdownString,
                        isTrusted: false,
                        supportHtml: false
                    },
                    markdownNotSupportedFallback: contentFallback
                };
                const options = {
                    linkHandler: (url) => {
                        const [scope, language] = decodeURIComponent(url).split(':');
                        onDidClickOverrideElement.fire({
                            settingKey: element.setting.key,
                            scope: scope,
                            language
                        });
                        this.scopeOverridesIndicator.hover.value?.hide();
                    }
                };
                this.scopeOverridesIndicator.hover.value = setupCustomHover(this.hoverDelegate, this.scopeOverridesIndicator.element, content, options);
            }
        }
        this.render();
    }
    updateDefaultOverrideIndicator(element) {
        this.defaultOverrideIndicator.element.style.display = 'none';
        const sourceToDisplay = getDefaultValueSourceToDisplay(element);
        if (sourceToDisplay !== undefined) {
            this.defaultOverrideIndicator.element.style.display = 'inline';
            const defaultOverrideHoverContent = localize('defaultOverriddenDetails', "Default setting value overridden by {0}", sourceToDisplay);
            this.defaultOverrideIndicator.hover.value = setupCustomHover(this.hoverDelegate, this.defaultOverrideIndicator.element, defaultOverrideHoverContent);
        }
        this.render();
    }
};
SettingsTreeIndicatorsLabel = __decorate([
    __param(1, IConfigurationService),
    __param(2, IHoverService),
    __param(3, IUserDataSyncEnablementService),
    __param(4, ILanguageService),
    __param(5, IUserDataProfilesService),
    __param(6, ICommandService)
], SettingsTreeIndicatorsLabel);
export { SettingsTreeIndicatorsLabel };
function getDefaultValueSourceToDisplay(element) {
    let sourceToDisplay;
    const defaultValueSource = element.defaultValueSource;
    if (defaultValueSource) {
        if (typeof defaultValueSource !== 'string') {
            sourceToDisplay = defaultValueSource.displayName ?? defaultValueSource.id;
        }
        else if (typeof defaultValueSource === 'string') {
            sourceToDisplay = defaultValueSource;
        }
    }
    return sourceToDisplay;
}
function getAccessibleScopeDisplayText(completeScope, languageService) {
    const [scope, language] = completeScope.split(':');
    const localizedScope = scope === 'user' ?
        localize('user', "User") : scope === 'workspace' ?
        localize('workspace', "Workspace") : localize('remote', "Remote");
    if (language) {
        return localize('modifiedInScopeForLanguage', "The {0} scope for {1}", localizedScope, languageService.getLanguageName(language));
    }
    return localizedScope;
}
function getAccessibleScopeDisplayMidSentenceText(completeScope, languageService) {
    const [scope, language] = completeScope.split(':');
    const localizedScope = scope === 'user' ?
        localize('user', "User") : scope === 'workspace' ?
        localize('workspace', "Workspace") : localize('remote', "Remote");
    if (language) {
        return localize('modifiedInScopeForLanguageMidSentence', "the {0} scope for {1}", localizedScope.toLowerCase(), languageService.getLanguageName(language));
    }
    return localizedScope;
}
export function getIndicatorsLabelAriaLabel(element, configurationService, userDataProfilesService, languageService) {
    const ariaLabelSections = [];
    // Add workspace trust text
    if (element.isUntrusted) {
        ariaLabelSections.push(localize('workspaceUntrustedAriaLabel', "Workspace untrusted; setting value not applied"));
    }
    const profilesEnabled = userDataProfilesService.isEnabled();
    if (element.hasPolicyValue) {
        ariaLabelSections.push(localize('policyDescriptionAccessible', "Managed by organization policy; setting value not applied"));
    }
    else if (profilesEnabled && element.matchesScope(1 /* ConfigurationTarget.APPLICATION */, false)) {
        ariaLabelSections.push(localize('applicationSettingDescriptionAccessible', "Setting value retained when switching profiles"));
    }
    else {
        // Add other overrides text
        const otherOverridesStart = element.isConfigured ?
            localize('alsoConfiguredIn', "Also modified in") :
            localize('configuredIn', "Modified in");
        const otherOverridesList = element.overriddenScopeList
            .map(scope => getAccessibleScopeDisplayMidSentenceText(scope, languageService)).join(', ');
        if (element.overriddenScopeList.length) {
            ariaLabelSections.push(`${otherOverridesStart} ${otherOverridesList}`);
        }
    }
    // Add sync ignored text
    const ignoredSettings = getIgnoredSettings(getDefaultIgnoredSettings(), configurationService);
    if (ignoredSettings.includes(element.setting.key)) {
        ariaLabelSections.push(localize('syncIgnoredAriaLabel', "Setting ignored during sync"));
    }
    // Add default override indicator text
    const sourceToDisplay = getDefaultValueSourceToDisplay(element);
    if (sourceToDisplay !== undefined) {
        ariaLabelSections.push(localize('defaultOverriddenDetailsAriaLabel', "{0} overrides the default value", sourceToDisplay));
    }
    // Add text about default values being overridden in other languages
    const otherLanguageOverridesList = element.overriddenDefaultsLanguageList
        .map(language => languageService.getLanguageName(language)).join(', ');
    if (element.overriddenDefaultsLanguageList.length) {
        const otherLanguageOverridesText = localize('defaultOverriddenLanguagesList', "Language-specific default values exist for {0}", otherLanguageOverridesList);
        ariaLabelSections.push(otherLanguageOverridesText);
    }
    const ariaLabel = ariaLabelSections.join('. ');
    return ariaLabel;
}
