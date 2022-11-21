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
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import Severity from 'vs/base/common/severity';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { listErrorForeground, listWarningForeground } from 'vs/platform/theme/common/colorRegistry';
import { spinningLoading } from 'vs/platform/theme/common/iconRegistry';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
/**
 * The set of _internal_ terminal statuses, other components building on the terminal should put
 * their statuses within their component.
 */
export var TerminalStatus;
(function (TerminalStatus) {
    TerminalStatus["Bell"] = "bell";
    TerminalStatus["Disconnected"] = "disconnected";
    TerminalStatus["RelaunchNeeded"] = "relaunch-needed";
    TerminalStatus["ShellIntegrationAttentionNeeded"] = "shell-integration-attention-needed";
})(TerminalStatus || (TerminalStatus = {}));
let TerminalStatusList = class TerminalStatusList extends Disposable {
    _configurationService;
    _statuses = new Map();
    _statusTimeouts = new Map();
    _onDidAddStatus = this._register(new Emitter());
    get onDidAddStatus() { return this._onDidAddStatus.event; }
    _onDidRemoveStatus = this._register(new Emitter());
    get onDidRemoveStatus() { return this._onDidRemoveStatus.event; }
    _onDidChangePrimaryStatus = this._register(new Emitter());
    get onDidChangePrimaryStatus() { return this._onDidChangePrimaryStatus.event; }
    constructor(_configurationService) {
        super();
        this._configurationService = _configurationService;
    }
    get primary() {
        let result;
        for (const s of this._statuses.values()) {
            if (!result || s.severity >= result.severity) {
                result = s;
            }
        }
        return result;
    }
    get statuses() { return Array.from(this._statuses.values()); }
    add(status, duration) {
        status = this._applyAnimationSetting(status);
        const outTimeout = this._statusTimeouts.get(status.id);
        if (outTimeout) {
            window.clearTimeout(outTimeout);
            this._statusTimeouts.delete(status.id);
        }
        if (duration && duration > 0) {
            const timeout = window.setTimeout(() => this.remove(status), duration);
            this._statusTimeouts.set(status.id, timeout);
        }
        if (!this._statuses.has(status.id)) {
            const oldPrimary = this.primary;
            this._statuses.set(status.id, status);
            this._onDidAddStatus.fire(status);
            const newPrimary = this.primary;
            if (oldPrimary !== newPrimary) {
                this._onDidChangePrimaryStatus.fire(newPrimary);
            }
        }
    }
    remove(statusOrId) {
        const status = typeof statusOrId === 'string' ? this._statuses.get(statusOrId) : statusOrId;
        // Verify the status is the same as the one passed in
        if (status && this._statuses.get(status.id)) {
            const wasPrimary = this.primary?.id === status.id;
            this._statuses.delete(status.id);
            this._onDidRemoveStatus.fire(status);
            if (wasPrimary) {
                this._onDidChangePrimaryStatus.fire(this.primary);
            }
        }
    }
    toggle(status, value) {
        if (value) {
            this.add(status);
        }
        else {
            this.remove(status);
        }
    }
    _applyAnimationSetting(status) {
        if (!status.icon || ThemeIcon.getModifier(status.icon) !== 'spin' || this._configurationService.getValue("terminal.integrated.tabs.enableAnimation" /* TerminalSettingId.TabsEnableAnimation */)) {
            return status;
        }
        let icon;
        // Loading without animation is just a curved line that doesn't mean anything
        if (status.icon.id === spinningLoading.id) {
            icon = Codicon.play;
        }
        else {
            icon = ThemeIcon.modify(status.icon, undefined);
        }
        // Clone the status when changing the icon so that setting changes are applied without a
        // reload being needed
        return {
            ...status,
            icon
        };
    }
};
TerminalStatusList = __decorate([
    __param(0, IConfigurationService)
], TerminalStatusList);
export { TerminalStatusList };
export function getColorForSeverity(severity) {
    switch (severity) {
        case Severity.Error:
            return listErrorForeground;
        case Severity.Warning:
            return listWarningForeground;
        default:
            return '';
    }
}
