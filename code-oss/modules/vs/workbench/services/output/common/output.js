/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Registry } from 'vs/platform/registry/common/platform';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { whenProviderRegistered } from 'vs/platform/files/common/files';
import { CancellationError, getErrorMessage, isCancellationError } from 'vs/base/common/errors';
import { createCancelablePromise, timeout } from 'vs/base/common/async';
/**
 * Mime type used by the output editor.
 */
export const OUTPUT_MIME = 'text/x-code-output';
/**
 * Output resource scheme.
 */
export const OUTPUT_SCHEME = 'output';
/**
 * Id used by the output editor.
 */
export const OUTPUT_MODE_ID = 'Log';
/**
 * Mime type used by the log output editor.
 */
export const LOG_MIME = 'text/x-code-log-output';
/**
 * Log resource scheme.
 */
export const LOG_SCHEME = 'log';
/**
 * Id used by the log output editor.
 */
export const LOG_MODE_ID = 'log';
/**
 * Output view id
 */
export const OUTPUT_VIEW_ID = 'workbench.panel.output';
export const OUTPUT_SERVICE_ID = 'outputService';
export const MAX_OUTPUT_LENGTH = 10000 /* Max. number of output lines to show in output */ * 100 /* Guestimated chars per line */;
export const CONTEXT_IN_OUTPUT = new RawContextKey('inOutput', false);
export const CONTEXT_ACTIVE_LOG_OUTPUT = new RawContextKey('activeLogOutput', false);
export const CONTEXT_OUTPUT_SCROLL_LOCK = new RawContextKey(`outputView.scrollLock`, false);
export const IOutputService = createDecorator(OUTPUT_SERVICE_ID);
export var OutputChannelUpdateMode;
(function (OutputChannelUpdateMode) {
    OutputChannelUpdateMode[OutputChannelUpdateMode["Append"] = 1] = "Append";
    OutputChannelUpdateMode[OutputChannelUpdateMode["Replace"] = 2] = "Replace";
    OutputChannelUpdateMode[OutputChannelUpdateMode["Clear"] = 3] = "Clear";
})(OutputChannelUpdateMode || (OutputChannelUpdateMode = {}));
export const Extensions = {
    OutputChannels: 'workbench.contributions.outputChannels'
};
class OutputChannelRegistry {
    channels = new Map();
    _onDidRegisterChannel = new Emitter();
    onDidRegisterChannel = this._onDidRegisterChannel.event;
    _onDidRemoveChannel = new Emitter();
    onDidRemoveChannel = this._onDidRemoveChannel.event;
    registerChannel(descriptor) {
        if (!this.channels.has(descriptor.id)) {
            this.channels.set(descriptor.id, descriptor);
            this._onDidRegisterChannel.fire(descriptor.id);
        }
    }
    getChannels() {
        const result = [];
        this.channels.forEach(value => result.push(value));
        return result;
    }
    getChannel(id) {
        return this.channels.get(id);
    }
    removeChannel(id) {
        this.channels.delete(id);
        this._onDidRemoveChannel.fire(id);
    }
}
Registry.add(Extensions.OutputChannels, new OutputChannelRegistry());
export function registerLogChannel(id, label, file, fileService, logService) {
    return createCancelablePromise(async (token) => {
        await whenProviderRegistered(file, fileService);
        const outputChannelRegistry = Registry.as(Extensions.OutputChannels);
        try {
            await whenFileExists(file, 1, fileService, logService, token);
            outputChannelRegistry.registerChannel({ id, label, file, log: true });
        }
        catch (error) {
            if (!isCancellationError(error)) {
                logService.error('Error while registering log channel', file.toString(), getErrorMessage(error));
            }
        }
    });
}
async function whenFileExists(file, trial, fileService, logService, token) {
    const exists = await fileService.exists(file);
    if (exists) {
        return;
    }
    if (token.isCancellationRequested) {
        throw new CancellationError();
    }
    if (trial > 10) {
        throw new Error(`Timed out while waiting for file to be created`);
    }
    logService.debug(`[Registering Log Channel] File does not exist. Waiting for 1s to retry.`, file.toString());
    await timeout(1000, token);
    await whenFileExists(file, trial + 1, fileService, logService, token);
}
export const ACTIVE_OUTPUT_CHANNEL_CONTEXT = new RawContextKey('activeOutputChannel', '');
