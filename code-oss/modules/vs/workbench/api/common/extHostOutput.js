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
import { MainContext } from './extHost.protocol';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { AbstractMessageLogger, ILoggerService, ILogService, log, parseLogLevel } from 'vs/platform/log/common/log';
import { OutputChannelUpdateMode } from 'vs/workbench/services/output/common/output';
import { IExtHostConsumerFileSystem } from 'vs/workbench/api/common/extHostFileSystemConsumer';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostFileSystemInfo } from 'vs/workbench/api/common/extHostFileSystemInfo';
import { toLocalISOString } from 'vs/base/common/date';
import { VSBuffer } from 'vs/base/common/buffer';
import { isString } from 'vs/base/common/types';
import { FileSystemProviderErrorCode, toFileSystemProviderErrorCode } from 'vs/platform/files/common/files';
import { Emitter } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
class ExtHostOutputChannel extends AbstractMessageLogger {
    id;
    name;
    logger;
    proxy;
    extension;
    offset = 0;
    _disposed = false;
    get disposed() { return this._disposed; }
    visible = false;
    constructor(id, name, logger, proxy, extension) {
        super();
        this.id = id;
        this.name = name;
        this.logger = logger;
        this.proxy = proxy;
        this.extension = extension;
        this._register(logger.onDidChangeLogLevel(level => this.setLevel(level)));
    }
    get logLevel() {
        return this.logger.getLevel();
    }
    appendLine(value) {
        this.append(value + '\n');
    }
    append(value) {
        this.info(value);
    }
    clear() {
        const till = this.offset;
        this.logger.flush();
        this.proxy.$update(this.id, OutputChannelUpdateMode.Clear, till);
    }
    replace(value) {
        const till = this.offset;
        this.info(value);
        this.proxy.$update(this.id, OutputChannelUpdateMode.Replace, till);
        if (this.visible) {
            this.logger.flush();
        }
    }
    show(columnOrPreserveFocus, preserveFocus) {
        this.logger.flush();
        this.proxy.$reveal(this.id, !!(typeof columnOrPreserveFocus === 'boolean' ? columnOrPreserveFocus : preserveFocus));
    }
    hide() {
        this.proxy.$close(this.id);
    }
    log(level, message) {
        this.offset += VSBuffer.fromString(message).byteLength;
        log(this.logger, level, message);
        if (this.visible) {
            this.logger.flush();
            this.proxy.$update(this.id, OutputChannelUpdateMode.Append);
        }
    }
    dispose() {
        super.dispose();
        if (!this._disposed) {
            this.proxy.$dispose(this.id);
            this._disposed = true;
        }
    }
}
class ExtHostLogOutputChannel extends ExtHostOutputChannel {
    appendLine(value) {
        this.append(value);
    }
}
let ExtHostOutputService = class ExtHostOutputService {
    initData;
    extHostFileSystem;
    extHostFileSystemInfo;
    loggerService;
    logService;
    _serviceBrand;
    proxy;
    outputsLocation;
    outputDirectoryPromise;
    extensionLogDirectoryPromise = new Map();
    namePool = 1;
    channels = new Map();
    visibleChannelId = null;
    constructor(extHostRpc, initData, extHostFileSystem, extHostFileSystemInfo, loggerService, logService) {
        this.initData = initData;
        this.extHostFileSystem = extHostFileSystem;
        this.extHostFileSystemInfo = extHostFileSystemInfo;
        this.loggerService = loggerService;
        this.logService = logService;
        this.proxy = extHostRpc.getProxy(MainContext.MainThreadOutputService);
        this.outputsLocation = this.extHostFileSystemInfo.extUri.joinPath(initData.logsLocation, `output_logging_${toLocalISOString(new Date()).replace(/-|:|\.\d+Z$/g, '')}`);
    }
    $setVisibleChannel(visibleChannelId) {
        this.visibleChannelId = visibleChannelId;
        for (const [id, channel] of this.channels) {
            channel.visible = id === this.visibleChannelId;
        }
    }
    createOutputChannel(name, options, extension) {
        name = name.trim();
        if (!name) {
            throw new Error('illegal argument `name`. must not be falsy');
        }
        const log = typeof options === 'object' && options.log;
        const languageId = isString(options) ? options : undefined;
        if (isString(languageId) && !languageId.trim()) {
            throw new Error('illegal argument `languageId`. must not be empty');
        }
        let logLevel;
        const logLevelValue = this.initData.environment.extensionLogLevel?.find(([identifier]) => ExtensionIdentifier.equals(extension.identifier, identifier))?.[1];
        if (logLevelValue) {
            logLevel = parseLogLevel(logLevelValue);
        }
        const extHostOutputChannel = log ? this.doCreateLogOutputChannel(name, logLevel, extension) : this.doCreateOutputChannel(name, languageId, extension);
        extHostOutputChannel.then(channel => {
            this.channels.set(channel.id, channel);
            channel.visible = channel.id === this.visibleChannelId;
        });
        return log ? this.createExtHostLogOutputChannel(name, logLevel ?? this.logService.getLevel(), extHostOutputChannel) : this.createExtHostOutputChannel(name, extHostOutputChannel);
    }
    async doCreateOutputChannel(name, languageId, extension) {
        if (!this.outputDirectoryPromise) {
            this.outputDirectoryPromise = this.extHostFileSystem.value.createDirectory(this.outputsLocation).then(() => this.outputsLocation);
        }
        const outputDir = await this.outputDirectoryPromise;
        const file = this.extHostFileSystemInfo.extUri.joinPath(outputDir, `${this.namePool++}-${name.replace(/[\\/:\*\?"<>\|]/g, '')}.log`);
        const logger = this.loggerService.createLogger(file, { always: true, donotRotate: true, donotUseFormatters: true });
        const id = await this.proxy.$register(name, file, false, languageId, extension.identifier.value);
        return new ExtHostOutputChannel(id, name, logger, this.proxy, extension);
    }
    async doCreateLogOutputChannel(name, logLevel, extension) {
        const extensionLogDir = await this.createExtensionLogDirectory(extension);
        const file = this.extHostFileSystemInfo.extUri.joinPath(extensionLogDir, `${name.replace(/[\\/:\*\?"<>\|]/g, '')}.log`);
        const logger = this.loggerService.createLogger(file, { name }, logLevel);
        const id = await this.proxy.$register(name, file, true, undefined, extension.identifier.value);
        return new ExtHostLogOutputChannel(id, name, logger, this.proxy, extension);
    }
    createExtensionLogDirectory(extension) {
        let extensionLogDirectoryPromise = this.extensionLogDirectoryPromise.get(extension.identifier.value);
        if (!extensionLogDirectoryPromise) {
            const extensionLogDirectory = this.extHostFileSystemInfo.extUri.joinPath(this.initData.logsLocation, extension.identifier.value);
            this.extensionLogDirectoryPromise.set(extension.identifier.value, extensionLogDirectoryPromise = (async () => {
                try {
                    await this.extHostFileSystem.value.createDirectory(extensionLogDirectory);
                }
                catch (err) {
                    if (toFileSystemProviderErrorCode(err) !== FileSystemProviderErrorCode.FileExists) {
                        throw err;
                    }
                }
                return extensionLogDirectory;
            })());
        }
        return extensionLogDirectoryPromise;
    }
    createExtHostOutputChannel(name, channelPromise) {
        let disposed = false;
        const validate = () => {
            if (disposed) {
                throw new Error('Channel has been closed');
            }
        };
        return {
            get name() { return name; },
            append(value) {
                validate();
                channelPromise.then(channel => channel.append(value));
            },
            appendLine(value) {
                validate();
                channelPromise.then(channel => channel.appendLine(value));
            },
            clear() {
                validate();
                channelPromise.then(channel => channel.clear());
            },
            replace(value) {
                validate();
                channelPromise.then(channel => channel.replace(value));
            },
            show(columnOrPreserveFocus, preserveFocus) {
                validate();
                channelPromise.then(channel => channel.show(columnOrPreserveFocus, preserveFocus));
            },
            hide() {
                validate();
                channelPromise.then(channel => channel.hide());
            },
            dispose() {
                disposed = true;
                channelPromise.then(channel => channel.dispose());
            }
        };
    }
    createExtHostLogOutputChannel(name, logLevel, channelPromise) {
        const disposables = new DisposableStore();
        const validate = () => {
            if (disposables.isDisposed) {
                throw new Error('Channel has been closed');
            }
        };
        const onDidChangeLogLevel = disposables.add(new Emitter());
        channelPromise.then(channel => {
            disposables.add(channel);
            disposables.add(channel.onDidChangeLogLevel(e => {
                logLevel = e;
                onDidChangeLogLevel.fire(e);
            }));
        });
        return {
            ...this.createExtHostOutputChannel(name, channelPromise),
            get logLevel() { return logLevel; },
            onDidChangeLogLevel: onDidChangeLogLevel.event,
            trace(value, ...args) {
                validate();
                channelPromise.then(channel => channel.trace(value, ...args));
            },
            debug(value, ...args) {
                validate();
                channelPromise.then(channel => channel.debug(value, ...args));
            },
            info(value, ...args) {
                validate();
                channelPromise.then(channel => channel.info(value, ...args));
            },
            warn(value, ...args) {
                validate();
                channelPromise.then(channel => channel.warn(value, ...args));
            },
            error(value, ...args) {
                validate();
                channelPromise.then(channel => channel.error(value, ...args));
            },
            dispose() {
                disposables.dispose();
            }
        };
    }
};
ExtHostOutputService = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostInitDataService),
    __param(2, IExtHostConsumerFileSystem),
    __param(3, IExtHostFileSystemInfo),
    __param(4, ILoggerService),
    __param(5, ILogService)
], ExtHostOutputService);
export { ExtHostOutputService };
export const IExtHostOutputService = createDecorator('IExtHostOutputService');
