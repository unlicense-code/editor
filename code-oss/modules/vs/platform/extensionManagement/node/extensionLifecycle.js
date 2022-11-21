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
import { fork } from 'child_process';
import { Limiter } from 'vs/base/common/async';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { join } from 'vs/base/common/path';
import { Promises } from 'vs/base/node/pfs';
import { ILogService } from 'vs/platform/log/common/log';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
let ExtensionsLifecycle = class ExtensionsLifecycle extends Disposable {
    userDataProfilesService;
    logService;
    processesLimiter = new Limiter(5); // Run max 5 processes in parallel
    constructor(userDataProfilesService, logService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.logService = logService;
    }
    async postUninstall(extension) {
        const script = this.parseScript(extension, 'uninstall');
        if (script) {
            this.logService.info(extension.identifier.id, extension.manifest.version, `Running post uninstall script`);
            await this.processesLimiter.queue(() => this.runLifecycleHook(script.script, 'uninstall', script.args, true, extension)
                .then(() => this.logService.info(extension.identifier.id, extension.manifest.version, `Finished running post uninstall script`), err => this.logService.error(extension.identifier.id, extension.manifest.version, `Failed to run post uninstall script: ${err}`)));
        }
        return Promises.rm(this.getExtensionStoragePath(extension)).then(undefined, e => this.logService.error('Error while removing extension storage path', e));
    }
    parseScript(extension, type) {
        const scriptKey = `vscode:${type}`;
        if (extension.location.scheme === Schemas.file && extension.manifest && extension.manifest['scripts'] && typeof extension.manifest['scripts'][scriptKey] === 'string') {
            const script = extension.manifest['scripts'][scriptKey].split(' ');
            if (script.length < 2 || script[0] !== 'node' || !script[1]) {
                this.logService.warn(extension.identifier.id, extension.manifest.version, `${scriptKey} should be a node script`);
                return null;
            }
            return { script: join(extension.location.fsPath, script[1]), args: script.slice(2) || [] };
        }
        return null;
    }
    runLifecycleHook(lifecycleHook, lifecycleType, args, timeout, extension) {
        return new Promise((c, e) => {
            const extensionLifecycleProcess = this.start(lifecycleHook, lifecycleType, args, extension);
            let timeoutHandler;
            const onexit = (error) => {
                if (timeoutHandler) {
                    clearTimeout(timeoutHandler);
                    timeoutHandler = null;
                }
                if (error) {
                    e(error);
                }
                else {
                    c(undefined);
                }
            };
            // on error
            extensionLifecycleProcess.on('error', (err) => {
                onexit(toErrorMessage(err) || 'Unknown');
            });
            // on exit
            extensionLifecycleProcess.on('exit', (code, signal) => {
                onexit(code ? `post-${lifecycleType} process exited with code ${code}` : undefined);
            });
            if (timeout) {
                // timeout: kill process after waiting for 5s
                timeoutHandler = setTimeout(() => {
                    timeoutHandler = null;
                    extensionLifecycleProcess.kill();
                    e('timed out');
                }, 5000);
            }
        });
    }
    start(uninstallHook, lifecycleType, args, extension) {
        const opts = {
            silent: true,
            execArgv: undefined
        };
        const extensionUninstallProcess = fork(uninstallHook, [`--type=extension-post-${lifecycleType}`, ...args], opts);
        extensionUninstallProcess.stdout.setEncoding('utf8');
        extensionUninstallProcess.stderr.setEncoding('utf8');
        const onStdout = Event.fromNodeEventEmitter(extensionUninstallProcess.stdout, 'data');
        const onStderr = Event.fromNodeEventEmitter(extensionUninstallProcess.stderr, 'data');
        // Log output
        onStdout(data => this.logService.info(extension.identifier.id, extension.manifest.version, `post-${lifecycleType}`, data));
        onStderr(data => this.logService.error(extension.identifier.id, extension.manifest.version, `post-${lifecycleType}`, data));
        const onOutput = Event.any(Event.map(onStdout, o => ({ data: `%c${o}`, format: [''] })), Event.map(onStderr, o => ({ data: `%c${o}`, format: ['color: red'] })));
        // Debounce all output, so we can render it in the Chrome console as a group
        const onDebouncedOutput = Event.debounce(onOutput, (r, o) => {
            return r
                ? { data: r.data + o.data, format: [...r.format, ...o.format] }
                : { data: o.data, format: o.format };
        }, 100);
        // Print out output
        onDebouncedOutput(data => {
            console.group(extension.identifier.id);
            console.log(data.data, ...data.format);
            console.groupEnd();
        });
        return extensionUninstallProcess;
    }
    getExtensionStoragePath(extension) {
        return join(this.userDataProfilesService.defaultProfile.globalStorageHome.fsPath, extension.identifier.id.toLowerCase());
    }
};
ExtensionsLifecycle = __decorate([
    __param(0, IUserDataProfilesService),
    __param(1, ILogService)
], ExtensionsLifecycle);
export { ExtensionsLifecycle };
