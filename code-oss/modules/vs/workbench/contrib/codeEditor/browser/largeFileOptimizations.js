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
import * as path from 'vs/base/common/path';
import { Disposable } from 'vs/base/common/lifecycle';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
/**
 * Shows a message when opening a large file which has been memory optimized (and features disabled).
 */
let LargeFileOptimizationsWarner = class LargeFileOptimizationsWarner extends Disposable {
    _editor;
    _notificationService;
    _configurationService;
    static ID = 'editor.contrib.largeFileOptimizationsWarner';
    constructor(_editor, _notificationService, _configurationService) {
        super();
        this._editor = _editor;
        this._notificationService = _notificationService;
        this._configurationService = _configurationService;
        this._register(this._editor.onDidChangeModel((e) => {
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            if (model.isTooLargeForTokenization()) {
                const message = nls.localize({
                    key: 'largeFile',
                    comment: [
                        'Variable 0 will be a file name.'
                    ]
                }, "{0}: tokenization, wrapping and folding have been turned off for this large file in order to reduce memory usage and avoid freezing or crashing.", path.basename(model.uri.path));
                this._notificationService.prompt(Severity.Info, message, [
                    {
                        label: nls.localize('removeOptimizations', "Forcefully Enable Features"),
                        run: () => {
                            this._configurationService.updateValue(`editor.largeFileOptimizations`, false).then(() => {
                                this._notificationService.info(nls.localize('reopenFilePrompt', "Please reopen file in order for this setting to take effect."));
                            }, (err) => {
                                this._notificationService.error(err);
                            });
                        }
                    }
                ], { neverShowAgain: { id: 'editor.contrib.largeFileOptimizationsWarner' } });
            }
        }));
    }
};
LargeFileOptimizationsWarner = __decorate([
    __param(1, INotificationService),
    __param(2, IConfigurationService)
], LargeFileOptimizationsWarner);
export { LargeFileOptimizationsWarner };
registerEditorContribution(LargeFileOptimizationsWarner.ID, LargeFileOptimizationsWarner);
