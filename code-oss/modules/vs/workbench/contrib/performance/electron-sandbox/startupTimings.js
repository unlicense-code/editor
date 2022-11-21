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
import { timeout } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { isCodeEditor } from 'vs/editor/browser/editorBrowser';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ILifecycleService, StartupKindToString } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUpdateService } from 'vs/platform/update/common/update';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import * as files from 'vs/workbench/contrib/files/common/files';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
import { IFileService } from 'vs/platform/files/common/files';
import { URI } from 'vs/base/common/uri';
import { VSBuffer } from 'vs/base/common/buffer';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let StartupTimings = class StartupTimings {
    _fileService;
    _timerService;
    _nativeHostService;
    _editorService;
    _paneCompositeService;
    _telemetryService;
    _lifecycleService;
    _updateService;
    _environmentService;
    _productService;
    _workspaceTrustService;
    constructor(_fileService, _timerService, _nativeHostService, _editorService, _paneCompositeService, _telemetryService, _lifecycleService, _updateService, _environmentService, _productService, _workspaceTrustService) {
        this._fileService = _fileService;
        this._timerService = _timerService;
        this._nativeHostService = _nativeHostService;
        this._editorService = _editorService;
        this._paneCompositeService = _paneCompositeService;
        this._telemetryService = _telemetryService;
        this._lifecycleService = _lifecycleService;
        this._updateService = _updateService;
        this._environmentService = _environmentService;
        this._productService = _productService;
        this._workspaceTrustService = _workspaceTrustService;
        this._report().catch(onUnexpectedError);
    }
    async _report() {
        const standardStartupError = await this._isStandardStartup();
        this._appendStartupTimes(standardStartupError).catch(onUnexpectedError);
    }
    async _appendStartupTimes(standardStartupError) {
        const appendTo = this._environmentService.args['prof-append-timers'];
        if (!appendTo) {
            // nothing to do
            return;
        }
        const { sessionId } = await this._telemetryService.getTelemetryInfo();
        Promise.all([
            this._timerService.whenReady(),
            timeout(15000), // wait: cached data creation, telemetry sending
        ]).then(async () => {
            const uri = URI.file(appendTo);
            const chunks = [];
            if (await this._fileService.exists(uri)) {
                chunks.push((await this._fileService.readFile(uri)).value);
            }
            chunks.push(VSBuffer.fromString(`${this._timerService.startupMetrics.ellapsed}\t${this._productService.nameShort}\t${(this._productService.commit || '').slice(0, 10) || '0000000000'}\t${sessionId}\t${standardStartupError === undefined ? 'standard_start' : 'NO_standard_start : ' + standardStartupError}\n`));
            await this._fileService.writeFile(uri, VSBuffer.concat(chunks));
        }).then(() => {
            this._nativeHostService.exit(0);
        }).catch(err => {
            console.error(err);
            this._nativeHostService.exit(0);
        });
    }
    async _isStandardStartup() {
        // check for standard startup:
        // * new window (no reload)
        // * workspace is trusted
        // * just one window
        // * explorer viewlet visible
        // * one text editor (not multiple, not webview, welcome etc...)
        // * cached data present (not rejected, not created)
        if (this._lifecycleService.startupKind !== 1 /* StartupKind.NewWindow */) {
            return StartupKindToString(this._lifecycleService.startupKind);
        }
        if (!this._workspaceTrustService.isWorkspaceTrusted()) {
            return 'Workspace not trusted';
        }
        const windowCount = await this._nativeHostService.getWindowCount();
        if (windowCount !== 1) {
            return 'Expected window count : 1, Actual : ' + windowCount;
        }
        const activeViewlet = this._paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
        if (!activeViewlet || activeViewlet.getId() !== files.VIEWLET_ID) {
            return 'Explorer viewlet not visible';
        }
        const visibleEditorPanes = this._editorService.visibleEditorPanes;
        if (visibleEditorPanes.length !== 1) {
            return 'Expected text editor count : 1, Actual : ' + visibleEditorPanes.length;
        }
        if (!isCodeEditor(visibleEditorPanes[0].getControl())) {
            return 'Active editor is not a text editor';
        }
        const activePanel = this._paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
        if (activePanel) {
            return 'Current active panel : ' + this._paneCompositeService.getPaneComposite(activePanel.getId(), 1 /* ViewContainerLocation.Panel */)?.name;
        }
        if (!await this._updateService.isLatestVersion()) {
            return 'Not on latest version, updates available';
        }
        return undefined;
    }
};
StartupTimings = __decorate([
    __param(0, IFileService),
    __param(1, ITimerService),
    __param(2, INativeHostService),
    __param(3, IEditorService),
    __param(4, IPaneCompositePartService),
    __param(5, ITelemetryService),
    __param(6, ILifecycleService),
    __param(7, IUpdateService),
    __param(8, INativeWorkbenchEnvironmentService),
    __param(9, IProductService),
    __param(10, IWorkspaceTrustManagementService)
], StartupTimings);
export { StartupTimings };
