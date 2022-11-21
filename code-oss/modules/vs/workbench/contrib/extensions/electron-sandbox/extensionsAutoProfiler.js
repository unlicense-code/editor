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
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ILogService } from 'vs/platform/log/common/log';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { onUnexpectedError } from 'vs/base/common/errors';
import { joinPath } from 'vs/base/common/resources';
import { IExtensionHostProfileService } from 'vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { localize } from 'vs/nls';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { RuntimeExtensionsInput } from 'vs/workbench/contrib/extensions/common/runtimeExtensionsInput';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { createSlowExtensionAction } from 'vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions';
import { ExtensionHostProfiler } from 'vs/workbench/services/extensions/electron-sandbox/extensionHostProfiler';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IFileService } from 'vs/platform/files/common/files';
import { VSBuffer } from 'vs/base/common/buffer';
import { timeout } from 'vs/base/common/async';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { generateUuid } from 'vs/base/common/uuid';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProfileAnalysisWorkerService } from 'vs/platform/profiling/electron-sandbox/profileAnalysisWorkerService';
let ExtensionsAutoProfiler = class ExtensionsAutoProfiler {
    _extensionService;
    _extensionProfileService;
    _telemetryService;
    _logService;
    _notificationService;
    _editorService;
    _instantiationService;
    _environmentServie;
    _profileAnalysisService;
    _configService;
    _fileService;
    _blame = new Set();
    _session;
    _unresponsiveListener;
    _perfBaseline = -1;
    constructor(_extensionService, _extensionProfileService, _telemetryService, _logService, _notificationService, _editorService, _instantiationService, _environmentServie, _profileAnalysisService, _configService, _fileService, timerService) {
        this._extensionService = _extensionService;
        this._extensionProfileService = _extensionProfileService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._notificationService = _notificationService;
        this._editorService = _editorService;
        this._instantiationService = _instantiationService;
        this._environmentServie = _environmentServie;
        this._profileAnalysisService = _profileAnalysisService;
        this._configService = _configService;
        this._fileService = _fileService;
        timerService.perfBaseline.then(value => {
            if (value < 0) {
                return; // too slow for profiling
            }
            this._perfBaseline = value;
            this._unresponsiveListener = _extensionService.onDidChangeResponsiveChange(this._onDidChangeResponsiveChange, this);
        });
    }
    dispose() {
        this._unresponsiveListener?.dispose();
        this._session?.dispose(true);
    }
    async _onDidChangeResponsiveChange(event) {
        if (event.extensionHostKind !== 1 /* ExtensionHostKind.LocalProcess */) {
            return;
        }
        const port = await this._extensionService.getInspectPort(event.extensionHostId, true);
        if (!port) {
            return;
        }
        if (event.isResponsive && this._session) {
            // stop profiling when responsive again
            this._session.cancel();
            this._logService.info('UNRESPONSIVE extension host: received responsive event and cancelling profiling session');
        }
        else if (!event.isResponsive && !this._session) {
            // start profiling if not yet profiling
            const cts = new CancellationTokenSource();
            this._session = cts;
            let session;
            try {
                session = await this._instantiationService.createInstance(ExtensionHostProfiler, port).start();
            }
            catch (err) {
                this._session = undefined;
                // fail silent as this is often
                // caused by another party being
                // connected already
                return;
            }
            this._logService.info('UNRESPONSIVE extension host: starting to profile NOW');
            // wait 5 seconds or until responsive again
            try {
                await timeout(5e3, cts.token);
            }
            catch {
                // can throw cancellation error. that is
                // OK, we stop profiling and analyse the
                // profile anyways
            }
            try {
                // stop profiling and analyse results
                this._processCpuProfile(await session.stop());
            }
            catch (err) {
                onUnexpectedError(err);
            }
            finally {
                this._session = undefined;
            }
        }
    }
    async _processCpuProfile(profile) {
        // get all extensions
        await this._extensionService.whenInstalledExtensionsRegistered();
        // send heavy samples iff enabled
        if (this._configService.getValue('application.experimental.rendererProfiling')) {
            const searchTree = TernarySearchTree.forUris();
            searchTree.fill(this._extensionService.extensions.map(e => [e.extensionLocation, e]));
            await this._profileAnalysisService.analyseBottomUp(profile.data, url => searchTree.findSubstr(URI.parse(url))?.identifier.value ?? '<<not-found>>', this._perfBaseline);
        }
        // analyse profile by extension-category
        const categories = this._extensionService.extensions
            .filter(e => e.extensionLocation.scheme === Schemas.file)
            .map(e => [e.extensionLocation, ExtensionIdentifier.toKey(e.identifier)]);
        const data = await this._profileAnalysisService.analyseByLocation(profile.data, categories);
        //
        let overall = 0;
        let top = '';
        let topAggregated = -1;
        for (const [category, aggregated] of data) {
            overall += aggregated;
            if (aggregated > topAggregated) {
                topAggregated = aggregated;
                top = category;
            }
        }
        const topPercentage = topAggregated / (overall / 100);
        // associate extensions to profile node
        const extension = await this._extensionService.getExtension(top);
        if (!extension) {
            // not an extension => idle, gc, self?
            return;
        }
        const sessionId = generateUuid();
        // print message to log
        const path = joinPath(this._environmentServie.tmpDir, `exthost-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
        await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(profile.data)));
        this._logService.warn(`UNRESPONSIVE extension host: '${top}' took ${topPercentage}% of ${topAggregated / 1e3}ms, saved PROFILE here: '${path}'`);
        this._telemetryService.publicLog2('exthostunresponsive', {
            sessionId,
            duration: overall,
            data: data.map(tuple => tuple[0]).flat(),
            id: ExtensionIdentifier.toKey(extension.identifier),
        });
        // add to running extensions view
        this._extensionProfileService.setUnresponsiveProfile(extension.identifier, profile);
        // prompt: when really slow/greedy
        if (!(topPercentage >= 95 && topAggregated >= 5e6)) {
            return;
        }
        const action = await this._instantiationService.invokeFunction(createSlowExtensionAction, extension, profile);
        if (!action) {
            // cannot report issues against this extension...
            return;
        }
        // only blame once per extension, don't blame too often
        if (this._blame.has(ExtensionIdentifier.toKey(extension.identifier)) || this._blame.size >= 3) {
            return;
        }
        this._blame.add(ExtensionIdentifier.toKey(extension.identifier));
        // user-facing message when very bad...
        this._notificationService.prompt(Severity.Warning, localize('unresponsive-exthost', "The extension '{0}' took a very long time to complete its last operation and it has prevented other extensions from running.", extension.displayName || extension.name), [{
                label: localize('show', 'Show Extensions'),
                run: () => this._editorService.openEditor(RuntimeExtensionsInput.instance, { pinned: true })
            },
            action
        ], { silent: true });
    }
};
ExtensionsAutoProfiler = __decorate([
    __param(0, IExtensionService),
    __param(1, IExtensionHostProfileService),
    __param(2, ITelemetryService),
    __param(3, ILogService),
    __param(4, INotificationService),
    __param(5, IEditorService),
    __param(6, IInstantiationService),
    __param(7, INativeWorkbenchEnvironmentService),
    __param(8, IProfileAnalysisWorkerService),
    __param(9, IConfigurationService),
    __param(10, IFileService),
    __param(11, ITimerService)
], ExtensionsAutoProfiler);
export { ExtensionsAutoProfiler };
