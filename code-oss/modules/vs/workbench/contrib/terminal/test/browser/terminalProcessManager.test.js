/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { strictEqual } from 'assert';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TerminalConfigHelper } from 'vs/workbench/contrib/terminal/browser/terminalConfigHelper';
import { TerminalProcessManager } from 'vs/workbench/contrib/terminal/browser/terminalProcessManager';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { TestTerminalProfileResolverService, workbenchInstantiationService } from 'vs/workbench/test/browser/workbenchTestServices';
import { IProductService } from 'vs/platform/product/common/productService';
import { IEnvironmentVariableService } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { EnvironmentVariableService } from 'vs/workbench/contrib/terminal/common/environmentVariableService';
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { ITerminalProfileResolverService } from 'vs/workbench/contrib/terminal/common/terminal';
import { ITerminalInstanceService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { TestProductService } from 'vs/workbench/test/common/workbenchTestServices';
class TestTerminalChildProcess {
    shouldPersist;
    id = 0;
    get capabilities() { return []; }
    constructor(shouldPersist) {
        this.shouldPersist = shouldPersist;
    }
    updateProperty(property, value) {
        throw new Error('Method not implemented.');
    }
    onProcessOverrideDimensions;
    onProcessResolvedShellLaunchConfig;
    onDidChangeHasChildProcesses;
    onDidChangeProperty = Event.None;
    onProcessData = Event.None;
    onProcessExit = Event.None;
    onProcessReady = Event.None;
    onProcessTitleChanged = Event.None;
    onProcessShellTypeChanged = Event.None;
    async start() { return undefined; }
    shutdown(immediate) { }
    input(data) { }
    resize(cols, rows) { }
    acknowledgeDataEvent(charCount) { }
    async setUnicodeVersion(version) { }
    async getInitialCwd() { return ''; }
    async getCwd() { return ''; }
    async getLatency() { return 0; }
    async processBinary(data) { }
    refreshProperty(property) { return Promise.resolve(''); }
}
class TestTerminalInstanceService {
    getBackend() {
        return {
            onPtyHostExit: Event.None,
            onPtyHostUnresponsive: Event.None,
            onPtyHostResponsive: Event.None,
            onPtyHostRestart: Event.None,
            onDidMoveWindowInstance: Event.None,
            onDidRequestDetach: Event.None,
            createProcess: (shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, windowsEnableConpty, shouldPersist) => new TestTerminalChildProcess(shouldPersist)
        };
    }
}
suite('Workbench - TerminalProcessManager', () => {
    let disposables;
    let instantiationService;
    let manager;
    setup(async () => {
        disposables = new DisposableStore();
        instantiationService = workbenchInstantiationService(undefined, disposables);
        const configurationService = new TestConfigurationService();
        await configurationService.setUserConfiguration('editor', { fontFamily: 'foo' });
        await configurationService.setUserConfiguration('terminal', {
            integrated: {
                fontFamily: 'bar',
                enablePersistentSessions: true,
                shellIntegration: {
                    enabled: false
                }
            }
        });
        instantiationService.stub(IConfigurationService, configurationService);
        instantiationService.stub(IProductService, TestProductService);
        instantiationService.stub(IEnvironmentVariableService, instantiationService.createInstance(EnvironmentVariableService));
        instantiationService.stub(ITerminalProfileResolverService, TestTerminalProfileResolverService);
        instantiationService.stub(ITerminalInstanceService, new TestTerminalInstanceService());
        const configHelper = instantiationService.createInstance(TerminalConfigHelper);
        manager = instantiationService.createInstance(TerminalProcessManager, 1, configHelper, undefined, undefined);
    });
    teardown(() => {
        disposables.dispose();
    });
    suite('process persistence', () => {
        suite('local', () => {
            test('regular terminal should persist', async () => {
                const p = await manager.createProcess({}, 1, 1, false);
                strictEqual(p, undefined);
                strictEqual(manager.shouldPersist, true);
            });
            test('task terminal should not persist', async () => {
                const p = await manager.createProcess({
                    isFeatureTerminal: true
                }, 1, 1, false);
                strictEqual(p, undefined);
                strictEqual(manager.shouldPersist, false);
            });
        });
        suite('remote', () => {
            const remoteCwd = URI.from({
                scheme: Schemas.vscodeRemote,
                path: 'test/cwd'
            });
            test('regular terminal should persist', async () => {
                const p = await manager.createProcess({
                    cwd: remoteCwd
                }, 1, 1, false);
                strictEqual(p, undefined);
                strictEqual(manager.shouldPersist, true);
            });
            test('task terminal should not persist', async () => {
                const p = await manager.createProcess({
                    isFeatureTerminal: true,
                    cwd: remoteCwd
                }, 1, 1, false);
                strictEqual(p, undefined);
                strictEqual(manager.shouldPersist, false);
            });
        });
    });
});
