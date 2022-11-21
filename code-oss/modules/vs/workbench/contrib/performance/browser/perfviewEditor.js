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
import { URI } from 'vs/base/common/uri';
import { TextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ILifecycleService, StartupKindToString } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IModelService } from 'vs/editor/common/services/model';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { dispose } from 'vs/base/common/lifecycle';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { writeTransientState } from 'vs/workbench/contrib/codeEditor/browser/toggleWordWrap';
import { LoaderStats } from 'vs/base/common/amd';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ByteSize, IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
import { isWeb } from 'vs/base/common/platform';
let PerfviewContrib = class PerfviewContrib {
    _registration;
    constructor(instaService, textModelResolverService) {
        this._registration = textModelResolverService.registerTextModelContentProvider('perf', instaService.createInstance(PerfModelContentProvider));
    }
    dispose() {
        this._registration.dispose();
    }
};
PerfviewContrib = __decorate([
    __param(0, IInstantiationService),
    __param(1, ITextModelService)
], PerfviewContrib);
export { PerfviewContrib };
let PerfviewInput = class PerfviewInput extends TextResourceEditorInput {
    static Id = 'PerfviewInput';
    static Uri = URI.from({ scheme: 'perf', path: 'Startup Performance' });
    get typeId() {
        return PerfviewInput.Id;
    }
    constructor(textModelResolverService, textFileService, editorService, fileService, labelService) {
        super(PerfviewInput.Uri, localize('name', "Startup Performance"), undefined, undefined, undefined, textModelResolverService, textFileService, editorService, fileService, labelService);
    }
};
PerfviewInput = __decorate([
    __param(0, ITextModelService),
    __param(1, ITextFileService),
    __param(2, IEditorService),
    __param(3, IFileService),
    __param(4, ILabelService)
], PerfviewInput);
export { PerfviewInput };
let PerfModelContentProvider = class PerfModelContentProvider {
    _modelService;
    _languageService;
    _editorService;
    _lifecycleService;
    _timerService;
    _extensionService;
    _productService;
    _model;
    _modelDisposables = [];
    constructor(_modelService, _languageService, _editorService, _lifecycleService, _timerService, _extensionService, _productService) {
        this._modelService = _modelService;
        this._languageService = _languageService;
        this._editorService = _editorService;
        this._lifecycleService = _lifecycleService;
        this._timerService = _timerService;
        this._extensionService = _extensionService;
        this._productService = _productService;
    }
    provideTextContent(resource) {
        if (!this._model || this._model.isDisposed()) {
            dispose(this._modelDisposables);
            const langId = this._languageService.createById('markdown');
            this._model = this._modelService.getModel(resource) || this._modelService.createModel('Loading...', langId, resource);
            this._modelDisposables.push(langId.onDidChange(e => {
                this._model?.setMode(e);
            }));
            this._modelDisposables.push(this._extensionService.onDidChangeExtensionsStatus(this._updateModel, this));
            writeTransientState(this._model, { wordWrapOverride: 'off' }, this._editorService);
        }
        this._updateModel();
        return Promise.resolve(this._model);
    }
    _updateModel() {
        Promise.all([
            this._timerService.whenReady(),
            this._lifecycleService.when(4 /* LifecyclePhase.Eventually */),
            this._extensionService.whenInstalledExtensionsRegistered()
        ]).then(() => {
            if (this._model && !this._model.isDisposed()) {
                const stats = LoaderStats.get();
                const md = new MarkdownBuilder();
                this._addSummary(md);
                md.blank();
                this._addSummaryTable(md, stats);
                md.blank();
                this._addExtensionsTable(md);
                md.blank();
                this._addRawPerfMarks(md);
                md.blank();
                // this._addLoaderStats(md, stats);
                // md.blank();
                this._addCachedDataStats(md);
                this._model.setValue(md.value);
            }
        });
    }
    _addSummary(md) {
        const metrics = this._timerService.startupMetrics;
        md.heading(2, 'System Info');
        md.li(`${this._productService.nameShort}: ${this._productService.version} (${this._productService.commit || '0000000'})`);
        md.li(`OS: ${metrics.platform}(${metrics.release})`);
        if (metrics.cpus) {
            md.li(`CPUs: ${metrics.cpus.model}(${metrics.cpus.count} x ${metrics.cpus.speed})`);
        }
        if (typeof metrics.totalmem === 'number' && typeof metrics.freemem === 'number') {
            md.li(`Memory(System): ${(metrics.totalmem / (ByteSize.GB)).toFixed(2)} GB(${(metrics.freemem / (ByteSize.GB)).toFixed(2)}GB free)`);
        }
        if (metrics.meminfo) {
            md.li(`Memory(Process): ${(metrics.meminfo.workingSetSize / ByteSize.KB).toFixed(2)} MB working set(${(metrics.meminfo.privateBytes / ByteSize.KB).toFixed(2)}MB private, ${(metrics.meminfo.sharedBytes / ByteSize.KB).toFixed(2)}MB shared)`);
        }
        md.li(`VM(likelihood): ${metrics.isVMLikelyhood}%`);
        md.li(`Initial Startup: ${metrics.initialStartup}`);
        md.li(`Has ${metrics.windowCount - 1} other windows`);
        md.li(`Screen Reader Active: ${metrics.hasAccessibilitySupport}`);
        md.li(`Empty Workspace: ${metrics.emptyWorkbench}`);
    }
    _addSummaryTable(md, stats) {
        const metrics = this._timerService.startupMetrics;
        const table = [];
        table.push(['start => app.isReady', metrics.timers.ellapsedAppReady, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['nls:start => nls:end', metrics.timers.ellapsedNlsGeneration, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['require(main.bundle.js)', metrics.timers.ellapsedLoadMainBundle, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['start crash reporter', metrics.timers.ellapsedCrashReporter, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['serve main IPC handle', metrics.timers.ellapsedMainServer, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['create window', metrics.timers.ellapsedWindowCreate, '[main]', `initial startup: ${metrics.initialStartup}, ${metrics.initialStartup ? `state: ${metrics.timers.ellapsedWindowRestoreState}ms, widget: ${metrics.timers.ellapsedBrowserWindowCreate}ms, show: ${metrics.timers.ellapsedWindowMaximize}ms` : ''}`]);
        table.push(['app.isReady => window.loadUrl()', metrics.timers.ellapsedWindowLoad, '[main]', `initial startup: ${metrics.initialStartup}`]);
        table.push(['window.loadUrl() => begin to require(workbench.desktop.main.js)', metrics.timers.ellapsedWindowLoadToRequire, '[main->renderer]', StartupKindToString(metrics.windowKind)]);
        table.push(['require(workbench.desktop.main.js)', metrics.timers.ellapsedRequire, '[renderer]', `cached data: ${(metrics.didUseCachedData ? 'YES' : 'NO')}${stats ? `, node_modules took ${stats.nodeRequireTotal}ms` : ''}`]);
        table.push(['wait for window config', metrics.timers.ellapsedWaitForWindowConfig, '[renderer]', undefined]);
        table.push(['init storage (global & workspace)', metrics.timers.ellapsedStorageInit, '[renderer]', undefined]);
        table.push(['init workspace service', metrics.timers.ellapsedWorkspaceServiceInit, '[renderer]', undefined]);
        if (isWeb) {
            table.push(['init settings and global state from settings sync service', metrics.timers.ellapsedRequiredUserDataInit, '[renderer]', undefined]);
            table.push(['init keybindings, snippets & extensions from settings sync service', metrics.timers.ellapsedOtherUserDataInit, '[renderer]', undefined]);
        }
        table.push(['register extensions & spawn extension host', metrics.timers.ellapsedExtensions, '[renderer]', undefined]);
        table.push(['restore viewlet', metrics.timers.ellapsedViewletRestore, '[renderer]', metrics.viewletId]);
        table.push(['restore panel', metrics.timers.ellapsedPanelRestore, '[renderer]', metrics.panelId]);
        table.push(['restore & resolve visible editors', metrics.timers.ellapsedEditorRestore, '[renderer]', `${metrics.editorIds.length}: ${metrics.editorIds.join(', ')}`]);
        table.push(['overall workbench load', metrics.timers.ellapsedWorkbench, '[renderer]', undefined]);
        table.push(['workbench ready', metrics.ellapsed, '[main->renderer]', undefined]);
        table.push(['renderer ready', metrics.timers.ellapsedRenderer, '[renderer]', undefined]);
        table.push(['shared process connection ready', metrics.timers.ellapsedSharedProcesConnected, '[renderer->sharedprocess]', undefined]);
        table.push(['extensions registered', metrics.timers.ellapsedExtensionsReady, '[renderer]', undefined]);
        md.heading(2, 'Performance Marks');
        md.table(['What', 'Duration', 'Process', 'Info'], table);
    }
    _addExtensionsTable(md) {
        const eager = [];
        const normal = [];
        const extensionsStatus = this._extensionService.getExtensionsStatus();
        for (const id in extensionsStatus) {
            const { activationTimes: times } = extensionsStatus[id];
            if (!times) {
                continue;
            }
            if (times.activationReason.startup) {
                eager.push([id, times.activationReason.startup, times.codeLoadingTime, times.activateCallTime, times.activateResolvedTime, times.activationReason.activationEvent, times.activationReason.extensionId.value]);
            }
            else {
                normal.push([id, times.activationReason.startup, times.codeLoadingTime, times.activateCallTime, times.activateResolvedTime, times.activationReason.activationEvent, times.activationReason.extensionId.value]);
            }
        }
        const table = eager.concat(normal);
        if (table.length > 0) {
            md.heading(2, 'Extension Activation Stats');
            md.table(['Extension', 'Eager', 'Load Code', 'Call Activate', 'Finish Activate', 'Event', 'By'], table);
        }
    }
    _addRawPerfMarks(md) {
        for (const [source, marks] of this._timerService.getPerformanceMarks()) {
            md.heading(2, `Raw Perf Marks: ${source}`);
            md.value += '```\n';
            md.value += `Name\tTimestamp\tDelta\tTotal\n`;
            let lastStartTime = -1;
            let total = 0;
            for (const { name, startTime } of marks) {
                const delta = lastStartTime !== -1 ? startTime - lastStartTime : 0;
                total += delta;
                md.value += `${name}\t${startTime}\t${delta}\t${total}\n`;
                lastStartTime = startTime;
            }
            md.value += '```\n';
        }
    }
    // private _addLoaderStats(md: MarkdownBuilder, stats: LoaderStats): void {
    // 	md.heading(2, 'Loader Stats');
    // 	md.heading(3, 'Load AMD-module');
    // 	md.table(['Module', 'Duration'], stats.amdLoad);
    // 	md.blank();
    // 	md.heading(3, 'Load commonjs-module');
    // 	md.table(['Module', 'Duration'], stats.nodeRequire);
    // 	md.blank();
    // 	md.heading(3, 'Invoke AMD-module factory');
    // 	md.table(['Module', 'Duration'], stats.amdInvoke);
    // 	md.blank();
    // 	md.heading(3, 'Invoke commonjs-module');
    // 	md.table(['Module', 'Duration'], stats.nodeEval);
    // }
    _addCachedDataStats(md) {
        const map = new Map();
        map.set(63 /* LoaderEventType.CachedDataCreated */, []);
        map.set(60 /* LoaderEventType.CachedDataFound */, []);
        map.set(61 /* LoaderEventType.CachedDataMissed */, []);
        map.set(62 /* LoaderEventType.CachedDataRejected */, []);
        if (typeof require.getStats === 'function') {
            for (const stat of require.getStats()) {
                if (map.has(stat.type)) {
                    map.get(stat.type).push(stat.detail);
                }
            }
        }
        const printLists = (arr) => {
            if (arr) {
                arr.sort();
                for (const e of arr) {
                    md.li(`${e}`);
                }
                md.blank();
            }
        };
        md.heading(2, 'Node Cached Data Stats');
        md.blank();
        md.heading(3, 'cached data used');
        printLists(map.get(60 /* LoaderEventType.CachedDataFound */));
        md.heading(3, 'cached data missed');
        printLists(map.get(61 /* LoaderEventType.CachedDataMissed */));
        md.heading(3, 'cached data rejected');
        printLists(map.get(62 /* LoaderEventType.CachedDataRejected */));
        md.heading(3, 'cached data created (lazy, might need refreshes)');
        printLists(map.get(63 /* LoaderEventType.CachedDataCreated */));
    }
};
PerfModelContentProvider = __decorate([
    __param(0, IModelService),
    __param(1, ILanguageService),
    __param(2, ICodeEditorService),
    __param(3, ILifecycleService),
    __param(4, ITimerService),
    __param(5, IExtensionService),
    __param(6, IProductService)
], PerfModelContentProvider);
class MarkdownBuilder {
    value = '';
    heading(level, value) {
        this.value += `${'#'.repeat(level)} ${value}\n\n`;
        return this;
    }
    blank() {
        this.value += '\n';
        return this;
    }
    li(value) {
        this.value += `* ${value}\n`;
        return this;
    }
    table(header, rows) {
        this.value += LoaderStats.toMarkdownTable(header, rows);
    }
}
