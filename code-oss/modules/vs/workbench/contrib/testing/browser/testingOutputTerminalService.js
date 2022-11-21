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
import { DeferredPromise } from 'vs/base/common/async';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { listenStream } from 'vs/base/common/stream';
import { isDefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { IViewsService } from 'vs/workbench/common/views';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TERMINAL_VIEW_ID } from 'vs/workbench/contrib/terminal/common/terminal';
import { testingViewIcon } from 'vs/workbench/contrib/testing/browser/icons';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { getMarkId } from 'vs/workbench/contrib/testing/common/testTypes';
const friendlyDate = (date) => {
    const d = new Date(date);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
};
const getTitle = (result) => {
    return result
        ? localize('testOutputTerminalTitleWithDate', 'Test Output at {0}', friendlyDate(result.completedAt ?? Date.now()))
        : genericTitle;
};
const genericTitle = localize('testOutputTerminalTitle', 'Test Output');
export const ITestingOutputTerminalService = createDecorator('ITestingOutputTerminalService');
let TestingOutputTerminalService = class TestingOutputTerminalService {
    terminalService;
    terminalGroupService;
    terminalEditorService;
    viewsService;
    _serviceBrand;
    outputTerminals = new WeakMap();
    constructor(terminalService, terminalGroupService, terminalEditorService, resultService, viewsService) {
        this.terminalService = terminalService;
        this.terminalGroupService = terminalGroupService;
        this.terminalEditorService = terminalEditorService;
        this.viewsService = viewsService;
        // If a result terminal is currently active and we start a new test run,
        // stream live results there automatically.
        resultService.onResultsChanged(evt => {
            const active = this.terminalService.activeInstance;
            if (!('started' in evt) || !active) {
                return;
            }
            const pane = this.viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
            if (!pane) {
                return;
            }
            const output = this.outputTerminals.get(active);
            if (output && output.ended) {
                this.showResultsInTerminal(active, output, evt.started);
            }
        });
    }
    /**
     * @inheritdoc
     */
    async open(result, marker) {
        const testOutputPtys = this.terminalService.instances
            .map(t => {
            const output = this.outputTerminals.get(t);
            return output ? [t, output] : undefined;
        })
            .filter(isDefined);
        // If there's an existing terminal for the attempted reveal, show that instead.
        const existing = testOutputPtys.find(([, o]) => o.resultId === result?.id);
        if (existing) {
            this.terminalService.setActiveInstance(existing[0]);
            if (existing[0].target === TerminalLocation.Editor) {
                this.terminalEditorService.revealActiveEditor();
            }
            else {
                this.terminalGroupService.showPanel();
            }
            this.revealMarker(existing[0], marker);
            return;
        }
        // Try to reuse ended terminals, otherwise make a new one
        const ended = testOutputPtys.find(([, o]) => o.ended);
        if (ended) {
            ended[1].clear();
            this.showResultsInTerminal(ended[0], ended[1], result);
            return;
        }
        const output = new TestOutputProcess();
        this.showResultsInTerminal(await this.terminalService.createTerminal({
            config: {
                isFeatureTerminal: true,
                icon: testingViewIcon,
                customPtyImplementation: () => output,
                name: getTitle(result),
            },
        }), output, result, marker);
    }
    async showResultsInTerminal(terminal, output, result, thenSelectMarker) {
        this.outputTerminals.set(terminal, output);
        output.resetFor(result?.id, getTitle(result));
        this.terminalService.setActiveInstance(terminal);
        if (terminal.target === TerminalLocation.Editor) {
            this.terminalEditorService.revealActiveEditor();
        }
        else {
            this.terminalGroupService.showPanel();
        }
        if (!result) {
            // seems like it takes a tick for listeners to be registered
            output.ended = true;
            setTimeout(() => output.pushData(localize('testNoRunYet', '\r\nNo tests have been run, yet.\r\n')));
            return;
        }
        const [stream] = await Promise.all([result.getOutput(), output.started]);
        let hadData = false;
        listenStream(stream, {
            onData: d => {
                hadData = true;
                output.pushData(d.toString());
            },
            onError: err => output.pushData(`\r\n\r\n${err.stack || err.message}`),
            onEnd: () => {
                if (!hadData) {
                    output.pushData(`\x1b[2m${localize('runNoOutout', 'The test run did not record any output.')}\x1b[0m`);
                }
                const completedAt = result.completedAt ? new Date(result.completedAt) : new Date();
                const text = localize('runFinished', 'Test run finished at {0}', completedAt.toLocaleString());
                output.pushData(`\r\n\r\n\x1b[1m> ${text} <\x1b[0m\r\n\r\n`);
                output.ended = true;
                this.revealMarker(terminal, thenSelectMarker);
            },
        });
    }
    revealMarker(terminal, marker) {
        if (marker !== undefined) {
            terminal.scrollToMark(getMarkId(marker, true), getMarkId(marker, false), true);
        }
    }
};
TestingOutputTerminalService = __decorate([
    __param(0, ITerminalService),
    __param(1, ITerminalGroupService),
    __param(2, ITerminalEditorService),
    __param(3, ITestResultService),
    __param(4, IViewsService)
], TestingOutputTerminalService);
export { TestingOutputTerminalService };
class TestOutputProcess extends Disposable {
    onProcessOverrideDimensions;
    onProcessResolvedShellLaunchConfig;
    onDidChangeHasChildProcesses;
    onDidChangeProperty = Event.None;
    processDataEmitter = this._register(new Emitter());
    titleEmitter = this._register(new Emitter());
    startedDeferred = new DeferredPromise();
    /** Whether the associated test has ended (indicating the terminal can be reused) */
    ended = true;
    /** Result currently being displayed */
    resultId;
    /** Promise resolved when the terminal is ready to take data */
    started = this.startedDeferred.p;
    pushData(data) {
        this.processDataEmitter.fire(data);
    }
    clear() {
        this.processDataEmitter.fire('\x1bc');
    }
    resetFor(resultId, title) {
        this.ended = false;
        this.resultId = resultId;
        this.titleEmitter.fire(title);
    }
    //#region implementation
    id = 0;
    shouldPersist = false;
    onProcessData = this.processDataEmitter.event;
    onProcessExit = this._register(new Emitter()).event;
    _onProcessReady = this._register(new Emitter());
    onProcessReady = this._onProcessReady.event;
    onProcessTitleChanged = this.titleEmitter.event;
    onProcessShellTypeChanged = this._register(new Emitter()).event;
    start() {
        this.startedDeferred.complete();
        this._onProcessReady.fire({ pid: -1, cwd: '' });
        return Promise.resolve(undefined);
    }
    shutdown() {
        // no-op
    }
    input() {
        // not supported
    }
    processBinary() {
        return Promise.resolve();
    }
    resize() {
        // no-op
    }
    acknowledgeDataEvent() {
        // no-op, flow control not currently implemented
    }
    setUnicodeVersion() {
        // no-op
        return Promise.resolve();
    }
    getInitialCwd() {
        return Promise.resolve('');
    }
    getCwd() {
        return Promise.resolve('');
    }
    getLatency() {
        return Promise.resolve(0);
    }
    refreshProperty(property) {
        throw new Error(`refreshProperty is not suppported in TestOutputProcesses. property: ${property}`);
    }
    updateProperty(property, value) {
        throw new Error(`updateProperty is not suppported in TestOutputProcesses. property: ${property}, value: ${value}`);
    }
}
