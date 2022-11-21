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
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
import { dispose } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { listErrorForeground, listWarningForeground } from 'vs/platform/theme/common/colorRegistry';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
class MarkersDecorationsProvider {
    _markerService;
    label = localize('label', "Problems");
    onDidChange;
    constructor(_markerService) {
        this._markerService = _markerService;
        this.onDidChange = _markerService.onMarkerChanged;
    }
    provideDecorations(resource) {
        const markers = this._markerService.read({
            resource,
            severities: MarkerSeverity.Error | MarkerSeverity.Warning
        });
        let first;
        for (const marker of markers) {
            if (!first || marker.severity > first.severity) {
                first = marker;
            }
        }
        if (!first) {
            return undefined;
        }
        return {
            weight: 100 * first.severity,
            bubble: true,
            tooltip: markers.length === 1 ? localize('tooltip.1', "1 problem in this file") : localize('tooltip.N', "{0} problems in this file", markers.length),
            letter: markers.length < 10 ? markers.length.toString() : '9+',
            color: first.severity === MarkerSeverity.Error ? listErrorForeground : listWarningForeground,
        };
    }
}
let MarkersFileDecorations = class MarkersFileDecorations {
    _markerService;
    _decorationsService;
    _configurationService;
    _disposables;
    _provider;
    _enabled;
    constructor(_markerService, _decorationsService, _configurationService) {
        this._markerService = _markerService;
        this._decorationsService = _decorationsService;
        this._configurationService = _configurationService;
        //
        this._disposables = [
            this._configurationService.onDidChangeConfiguration(this._updateEnablement, this),
        ];
        this._updateEnablement();
    }
    dispose() {
        dispose(this._provider);
        dispose(this._disposables);
    }
    _updateEnablement() {
        const value = this._configurationService.getValue('problems');
        if (value.decorations.enabled === this._enabled) {
            return;
        }
        this._enabled = value.decorations.enabled;
        if (this._enabled) {
            const provider = new MarkersDecorationsProvider(this._markerService);
            this._provider = this._decorationsService.registerDecorationsProvider(provider);
        }
        else if (this._provider) {
            this._enabled = value.decorations.enabled;
            this._provider.dispose();
        }
    }
};
MarkersFileDecorations = __decorate([
    __param(0, IMarkerService),
    __param(1, IDecorationsService),
    __param(2, IConfigurationService)
], MarkersFileDecorations);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    'id': 'problems',
    'order': 101,
    'type': 'object',
    'properties': {
        'problems.decorations.enabled': {
            'description': localize('markers.showOnFile', "Show Errors & Warnings on files and folder."),
            'type': 'boolean',
            'default': true
        }
    }
});
// register file decorations
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(MarkersFileDecorations, 3 /* LifecyclePhase.Restored */);
