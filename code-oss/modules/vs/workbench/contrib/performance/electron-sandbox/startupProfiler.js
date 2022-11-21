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
import { localize } from 'vs/nls';
import { dirname, basename } from 'vs/base/common/resources';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { PerfviewInput } from 'vs/workbench/contrib/performance/browser/perfviewEditor';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { URI } from 'vs/base/common/uri';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProductService } from 'vs/platform/product/common/productService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
let StartupProfiler = class StartupProfiler {
    _dialogService;
    _environmentService;
    _textModelResolverService;
    _clipboardService;
    _openerService;
    _nativeHostService;
    _productService;
    _fileService;
    _labelService;
    constructor(_dialogService, _environmentService, _textModelResolverService, _clipboardService, lifecycleService, extensionService, _openerService, _nativeHostService, _productService, _fileService, _labelService) {
        this._dialogService = _dialogService;
        this._environmentService = _environmentService;
        this._textModelResolverService = _textModelResolverService;
        this._clipboardService = _clipboardService;
        this._openerService = _openerService;
        this._nativeHostService = _nativeHostService;
        this._productService = _productService;
        this._fileService = _fileService;
        this._labelService = _labelService;
        // wait for everything to be ready
        Promise.all([
            lifecycleService.when(4 /* LifecyclePhase.Eventually */),
            extensionService.whenInstalledExtensionsRegistered()
        ]).then(() => {
            this._stopProfiling();
        });
    }
    _stopProfiling() {
        if (!this._environmentService.args['prof-startup-prefix']) {
            return;
        }
        const profileFilenamePrefix = URI.file(this._environmentService.args['prof-startup-prefix']);
        const dir = dirname(profileFilenamePrefix);
        const prefix = basename(profileFilenamePrefix);
        const removeArgs = ['--prof-startup'];
        const markerFile = this._fileService.readFile(profileFilenamePrefix).then(value => removeArgs.push(...value.toString().split('|')))
            .then(() => this._fileService.del(profileFilenamePrefix, { recursive: true })) // (1) delete the file to tell the main process to stop profiling
            .then(() => new Promise(resolve => {
            const check = () => {
                this._fileService.exists(profileFilenamePrefix).then(exists => {
                    if (exists) {
                        resolve();
                    }
                    else {
                        setTimeout(check, 500);
                    }
                });
            };
            check();
        }))
            .then(() => this._fileService.del(profileFilenamePrefix, { recursive: true })); // (3) finally delete the file again
        markerFile.then(() => {
            return this._fileService.resolve(dir).then(stat => {
                return (stat.children ? stat.children.filter(value => value.resource.path.includes(prefix)) : []).map(stat => stat.resource);
            });
        }).then(files => {
            const profileFiles = files.reduce((prev, cur) => `${prev}${this._labelService.getUriLabel(cur)}\n`, '\n');
            return this._dialogService.confirm({
                type: 'info',
                message: localize('prof.message', "Successfully created profiles."),
                detail: localize('prof.detail', "Please create an issue and manually attach the following files:\n{0}", profileFiles),
                primaryButton: localize('prof.restartAndFileIssue', "&&Create Issue and Restart"),
                secondaryButton: localize('prof.restart', "&&Restart")
            }).then(res => {
                if (res.confirmed) {
                    Promise.all([
                        this._nativeHostService.showItemInFolder(files[0].fsPath),
                        this._createPerfIssue(files.map(file => basename(file)))
                    ]).then(() => {
                        // keep window stable until restart is selected
                        return this._dialogService.confirm({
                            type: 'info',
                            message: localize('prof.thanks', "Thanks for helping us."),
                            detail: localize('prof.detail.restart', "A final restart is required to continue to use '{0}'. Again, thank you for your contribution.", this._productService.nameLong),
                            primaryButton: localize('prof.restart.button', "&&Restart"),
                            secondaryButton: undefined
                        }).then(() => {
                            // now we are ready to restart
                            this._nativeHostService.relaunch({ removeArgs });
                        });
                    });
                }
                else {
                    // simply restart
                    this._nativeHostService.relaunch({ removeArgs });
                }
            });
        });
    }
    async _createPerfIssue(files) {
        const reportIssueUrl = this._productService.reportIssueUrl;
        if (!reportIssueUrl) {
            return;
        }
        const ref = await this._textModelResolverService.createModelReference(PerfviewInput.Uri);
        try {
            await this._clipboardService.writeText(ref.object.textEditorModel.getValue());
        }
        finally {
            ref.dispose();
        }
        const body = `
1. :warning: We have copied additional data to your clipboard. Make sure to **paste** here. :warning:
1. :warning: Make sure to **attach** these files from your *home*-directory: :warning:\n${files.map(file => `-\`${file}\``).join('\n')}
`;
        const baseUrl = reportIssueUrl;
        const queryStringPrefix = baseUrl.indexOf('?') === -1 ? '?' : '&';
        this._openerService.open(URI.parse(`${baseUrl}${queryStringPrefix}body=${encodeURIComponent(body)}`));
    }
};
StartupProfiler = __decorate([
    __param(0, IDialogService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, ITextModelService),
    __param(3, IClipboardService),
    __param(4, ILifecycleService),
    __param(5, IExtensionService),
    __param(6, IOpenerService),
    __param(7, INativeHostService),
    __param(8, IProductService),
    __param(9, IFileService),
    __param(10, ILabelService)
], StartupProfiler);
export { StartupProfiler };
