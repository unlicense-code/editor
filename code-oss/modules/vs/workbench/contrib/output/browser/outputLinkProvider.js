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
import { RunOnceScheduler } from 'vs/base/common/async';
import { IModelService } from 'vs/editor/common/services/model';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { OUTPUT_MODE_ID, LOG_MODE_ID } from 'vs/workbench/services/output/common/output';
import { createWebWorker } from 'vs/editor/browser/services/webWorker';
import { dispose } from 'vs/base/common/lifecycle';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
let OutputLinkProvider = class OutputLinkProvider {
    contextService;
    modelService;
    languageConfigurationService;
    languageFeaturesService;
    static DISPOSE_WORKER_TIME = 3 * 60 * 1000; // dispose worker after 3 minutes of inactivity
    worker;
    disposeWorkerScheduler;
    linkProviderRegistration;
    constructor(contextService, modelService, languageConfigurationService, languageFeaturesService) {
        this.contextService = contextService;
        this.modelService = modelService;
        this.languageConfigurationService = languageConfigurationService;
        this.languageFeaturesService = languageFeaturesService;
        this.disposeWorkerScheduler = new RunOnceScheduler(() => this.disposeWorker(), OutputLinkProvider.DISPOSE_WORKER_TIME);
        this.registerListeners();
        this.updateLinkProviderWorker();
    }
    registerListeners() {
        this.contextService.onDidChangeWorkspaceFolders(() => this.updateLinkProviderWorker());
    }
    updateLinkProviderWorker() {
        // Setup link provider depending on folders being opened or not
        const folders = this.contextService.getWorkspace().folders;
        if (folders.length > 0) {
            if (!this.linkProviderRegistration) {
                this.linkProviderRegistration = this.languageFeaturesService.linkProvider.register([{ language: OUTPUT_MODE_ID, scheme: '*' }, { language: LOG_MODE_ID, scheme: '*' }], {
                    provideLinks: async (model) => {
                        const links = await this.provideLinks(model.uri);
                        return links && { links };
                    }
                });
            }
        }
        else {
            dispose(this.linkProviderRegistration);
            this.linkProviderRegistration = undefined;
        }
        // Dispose worker to recreate with folders on next provideLinks request
        this.disposeWorker();
        this.disposeWorkerScheduler.cancel();
    }
    getOrCreateWorker() {
        this.disposeWorkerScheduler.schedule();
        if (!this.worker) {
            const createData = {
                workspaceFolders: this.contextService.getWorkspace().folders.map(folder => folder.uri.toString())
            };
            this.worker = createWebWorker(this.modelService, this.languageConfigurationService, {
                moduleId: 'vs/workbench/contrib/output/common/outputLinkComputer',
                createData,
                label: 'outputLinkComputer'
            });
        }
        return this.worker;
    }
    async provideLinks(modelUri) {
        const linkComputer = await this.getOrCreateWorker().withSyncedResources([modelUri]);
        return linkComputer.computeLinks(modelUri.toString());
    }
    disposeWorker() {
        if (this.worker) {
            this.worker.dispose();
            this.worker = undefined;
        }
    }
};
OutputLinkProvider = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IModelService),
    __param(2, ILanguageConfigurationService),
    __param(3, ILanguageFeaturesService)
], OutputLinkProvider);
export { OutputLinkProvider };
