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
import * as nls from 'vs/nls';
import { registerDiffEditorContribution } from 'vs/editor/browser/editorExtensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { FloatingClickWidget } from 'vs/workbench/browser/codeeditor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { EmbeddedDiffEditorWidget } from 'vs/editor/browser/widget/embeddedCodeEditorWidget';
var WidgetState;
(function (WidgetState) {
    WidgetState[WidgetState["Hidden"] = 0] = "Hidden";
    WidgetState[WidgetState["HintWhitespace"] = 1] = "HintWhitespace";
})(WidgetState || (WidgetState = {}));
let DiffEditorHelperContribution = class DiffEditorHelperContribution extends Disposable {
    _diffEditor;
    _instantiationService;
    _configurationService;
    _notificationService;
    static ID = 'editor.contrib.diffEditorHelper';
    _helperWidget;
    _helperWidgetListener;
    _state;
    constructor(_diffEditor, _instantiationService, _configurationService, _notificationService) {
        super();
        this._diffEditor = _diffEditor;
        this._instantiationService = _instantiationService;
        this._configurationService = _configurationService;
        this._notificationService = _notificationService;
        this._helperWidget = null;
        this._helperWidgetListener = null;
        this._state = 0 /* WidgetState.Hidden */;
        if (!(this._diffEditor instanceof EmbeddedDiffEditorWidget)) {
            this._register(this._diffEditor.onDidUpdateDiff(() => {
                const diffComputationResult = this._diffEditor.getDiffComputationResult();
                this._setState(this._deduceState(diffComputationResult));
                if (diffComputationResult && diffComputationResult.quitEarly) {
                    this._notificationService.prompt(Severity.Warning, nls.localize('hintTimeout', "The diff algorithm was stopped early (after {0} ms.)", this._diffEditor.maxComputationTime), [{
                            label: nls.localize('removeTimeout', "Remove Limit"),
                            run: () => {
                                this._configurationService.updateValue('diffEditor.maxComputationTime', 0);
                            }
                        }], {});
                }
            }));
        }
    }
    _deduceState(diffComputationResult) {
        if (!diffComputationResult) {
            return 0 /* WidgetState.Hidden */;
        }
        if (this._diffEditor.ignoreTrimWhitespace && diffComputationResult.changes.length === 0 && !diffComputationResult.identical) {
            return 1 /* WidgetState.HintWhitespace */;
        }
        return 0 /* WidgetState.Hidden */;
    }
    _setState(newState) {
        if (this._state === newState) {
            return;
        }
        this._state = newState;
        if (this._helperWidgetListener) {
            this._helperWidgetListener.dispose();
            this._helperWidgetListener = null;
        }
        if (this._helperWidget) {
            this._helperWidget.dispose();
            this._helperWidget = null;
        }
        if (this._state === 1 /* WidgetState.HintWhitespace */) {
            this._helperWidget = this._instantiationService.createInstance(FloatingClickWidget, this._diffEditor.getModifiedEditor(), nls.localize('hintWhitespace', "Show Whitespace Differences"), null);
            this._helperWidgetListener = this._helperWidget.onClick(() => this._onDidClickHelperWidget());
            this._helperWidget.render();
        }
    }
    _onDidClickHelperWidget() {
        if (this._state === 1 /* WidgetState.HintWhitespace */) {
            this._configurationService.updateValue('diffEditor.ignoreTrimWhitespace', false);
        }
    }
    dispose() {
        super.dispose();
    }
};
DiffEditorHelperContribution = __decorate([
    __param(1, IInstantiationService),
    __param(2, IConfigurationService),
    __param(3, INotificationService)
], DiffEditorHelperContribution);
registerDiffEditorContribution(DiffEditorHelperContribution.ID, DiffEditorHelperContribution);
