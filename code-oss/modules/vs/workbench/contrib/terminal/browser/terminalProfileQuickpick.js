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
import { Codicon } from 'vs/base/common/codicons';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { getUriClasses, getColorClass, getColorStyleElement } from 'vs/workbench/contrib/terminal/browser/terminalIcon';
import { configureTerminalProfileIcon } from 'vs/workbench/contrib/terminal/browser/terminalIcons';
import * as nls from 'vs/nls';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { getIconRegistry } from 'vs/platform/theme/common/iconRegistry';
import { basename } from 'vs/base/common/path';
let TerminalProfileQuickpick = class TerminalProfileQuickpick {
    _terminalProfileService;
    _terminalProfileResolverService;
    _configurationService;
    _quickInputService;
    _themeService;
    constructor(_terminalProfileService, _terminalProfileResolverService, _configurationService, _quickInputService, _themeService) {
        this._terminalProfileService = _terminalProfileService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._configurationService = _configurationService;
        this._quickInputService = _quickInputService;
        this._themeService = _themeService;
    }
    async showAndGetResult(type) {
        const platformKey = await this._terminalProfileService.getPlatformKey();
        const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
        const result = await this._createAndShow(type);
        const defaultProfileKey = `${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${platformKey}`;
        if (!result) {
            return;
        }
        if (type === 'setDefault') {
            if ('command' in result.profile) {
                return; // Should never happen
            }
            else if ('id' in result.profile) {
                // extension contributed profile
                await this._configurationService.updateValue(defaultProfileKey, result.profile.title, 2 /* ConfigurationTarget.USER */);
                return {
                    config: {
                        extensionIdentifier: result.profile.extensionIdentifier,
                        id: result.profile.id,
                        title: result.profile.title,
                        options: {
                            color: result.profile.color,
                            icon: result.profile.icon
                        }
                    },
                    keyMods: result.keyMods
                };
            }
            // Add the profile to settings if necessary
            if ('isAutoDetected' in result.profile) {
                const profilesConfig = await this._configurationService.getValue(profilesKey);
                if (typeof profilesConfig === 'object') {
                    const newProfile = {
                        path: result.profile.path
                    };
                    if (result.profile.args) {
                        newProfile.args = result.profile.args;
                    }
                    profilesConfig[result.profile.profileName] = newProfile;
                }
                await this._configurationService.updateValue(profilesKey, profilesConfig, 2 /* ConfigurationTarget.USER */);
            }
            // Set the default profile
            await this._configurationService.updateValue(defaultProfileKey, result.profileName, 2 /* ConfigurationTarget.USER */);
        }
        else if (type === 'createInstance') {
            if ('id' in result.profile) {
                return {
                    config: {
                        extensionIdentifier: result.profile.extensionIdentifier,
                        id: result.profile.id,
                        title: result.profile.title,
                        options: {
                            icon: result.profile.icon,
                            color: result.profile.color,
                        }
                    },
                    keyMods: result.keyMods
                };
            }
            else {
                return { config: result.profile, keyMods: result.keyMods };
            }
        }
        // for tests
        return 'profileName' in result.profile ? result.profile.profileName : result.profile.title;
    }
    async _createAndShow(type) {
        const platformKey = await this._terminalProfileService.getPlatformKey();
        const profiles = this._terminalProfileService.availableProfiles;
        const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
        const defaultProfileName = this._terminalProfileService.getDefaultProfileName();
        let keyMods;
        const options = {
            placeHolder: type === 'createInstance' ? nls.localize('terminal.integrated.selectProfileToCreate', "Select the terminal profile to create") : nls.localize('terminal.integrated.chooseDefaultProfile', "Select your default terminal profile"),
            onDidTriggerItemButton: async (context) => {
                if ('command' in context.item.profile) {
                    return;
                }
                if ('id' in context.item.profile) {
                    return;
                }
                const configProfiles = this._configurationService.getValue("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey);
                const existingProfiles = !!configProfiles ? Object.keys(configProfiles) : [];
                const name = await this._quickInputService.input({
                    prompt: nls.localize('enterTerminalProfileName', "Enter terminal profile name"),
                    value: context.item.profile.profileName,
                    validateInput: async (input) => {
                        if (existingProfiles.includes(input)) {
                            return nls.localize('terminalProfileAlreadyExists', "A terminal profile already exists with that name");
                        }
                        return undefined;
                    }
                });
                if (!name) {
                    return;
                }
                const newConfigValue = { ...configProfiles };
                newConfigValue[name] = {
                    path: context.item.profile.path,
                    args: context.item.profile.args
                };
                await this._configurationService.updateValue(profilesKey, newConfigValue, 2 /* ConfigurationTarget.USER */);
            },
            onKeyMods: mods => keyMods = mods
        };
        // Build quick pick items
        const quickPickItems = [];
        const configProfiles = profiles.filter(e => !e.isAutoDetected);
        const autoDetectedProfiles = profiles.filter(e => e.isAutoDetected);
        if (configProfiles.length > 0) {
            quickPickItems.push({ type: 'separator', label: nls.localize('terminalProfiles', "profiles") });
            quickPickItems.push(...this._sortProfileQuickPickItems(configProfiles.map(e => this._createProfileQuickPickItem(e)), defaultProfileName));
        }
        quickPickItems.push({ type: 'separator', label: nls.localize('ICreateContributedTerminalProfileOptions', "contributed") });
        const contributedProfiles = [];
        for (const contributed of this._terminalProfileService.contributedProfiles) {
            let icon;
            if (typeof contributed.icon === 'string') {
                if (contributed.icon.startsWith('$(')) {
                    icon = ThemeIcon.fromString(contributed.icon);
                }
                else {
                    icon = ThemeIcon.fromId(contributed.icon);
                }
            }
            if (!icon || !getIconRegistry().getIcon(icon.id)) {
                icon = this._terminalProfileResolverService.getDefaultIcon();
            }
            const uriClasses = getUriClasses(contributed, this._themeService.getColorTheme().type, true);
            const colorClass = getColorClass(contributed);
            const iconClasses = [];
            if (uriClasses) {
                iconClasses.push(...uriClasses);
            }
            if (colorClass) {
                iconClasses.push(colorClass);
            }
            contributedProfiles.push({
                label: `$(${icon.id}) ${contributed.title}`,
                profile: {
                    extensionIdentifier: contributed.extensionIdentifier,
                    title: contributed.title,
                    icon: contributed.icon,
                    id: contributed.id,
                    color: contributed.color
                },
                profileName: contributed.title,
                iconClasses
            });
        }
        if (contributedProfiles.length > 0) {
            quickPickItems.push(...this._sortProfileQuickPickItems(contributedProfiles, defaultProfileName));
        }
        if (autoDetectedProfiles.length > 0) {
            quickPickItems.push({ type: 'separator', label: nls.localize('terminalProfiles.detected', "detected") });
            quickPickItems.push(...this._sortProfileQuickPickItems(autoDetectedProfiles.map(e => this._createProfileQuickPickItem(e)), defaultProfileName));
        }
        const styleElement = getColorStyleElement(this._themeService.getColorTheme());
        document.body.appendChild(styleElement);
        const result = await this._quickInputService.pick(quickPickItems, options);
        document.body.removeChild(styleElement);
        if (!result) {
            return undefined;
        }
        if (keyMods) {
            result.keyMods = keyMods;
        }
        return result;
    }
    _createProfileQuickPickItem(profile) {
        const buttons = [{
                iconClass: ThemeIcon.asClassName(configureTerminalProfileIcon),
                tooltip: nls.localize('createQuickLaunchProfile', "Configure Terminal Profile")
            }];
        const icon = (profile.icon && ThemeIcon.isThemeIcon(profile.icon)) ? profile.icon : Codicon.terminal;
        const label = `$(${icon.id}) ${profile.profileName}`;
        const friendlyPath = profile.isFromPath ? basename(profile.path) : profile.path;
        const colorClass = getColorClass(profile);
        const iconClasses = [];
        if (colorClass) {
            iconClasses.push(colorClass);
        }
        if (profile.args) {
            if (typeof profile.args === 'string') {
                return { label, description: `${profile.path} ${profile.args}`, profile, profileName: profile.profileName, buttons, iconClasses };
            }
            const argsString = profile.args.map(e => {
                if (e.includes(' ')) {
                    return `"${e.replace(/"/g, '\\"')}"`;
                }
                return e;
            }).join(' ');
            return { label, description: `${friendlyPath} ${argsString}`, profile, profileName: profile.profileName, buttons, iconClasses };
        }
        return { label, description: friendlyPath, profile, profileName: profile.profileName, buttons, iconClasses };
    }
    _sortProfileQuickPickItems(items, defaultProfileName) {
        return items.sort((a, b) => {
            if (b.profileName === defaultProfileName) {
                return 1;
            }
            if (a.profileName === defaultProfileName) {
                return -1;
            }
            return a.profileName.localeCompare(b.profileName);
        });
    }
};
TerminalProfileQuickpick = __decorate([
    __param(0, ITerminalProfileService),
    __param(1, ITerminalProfileResolverService),
    __param(2, IConfigurationService),
    __param(3, IQuickInputService),
    __param(4, IThemeService)
], TerminalProfileQuickpick);
export { TerminalProfileQuickpick };
