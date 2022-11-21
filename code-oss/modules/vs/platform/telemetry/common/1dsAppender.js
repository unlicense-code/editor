/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { onUnexpectedError } from 'vs/base/common/errors';
import { mixin } from 'vs/base/common/objects';
import { validateTelemetryData } from 'vs/platform/telemetry/common/telemetryUtils';
const endpointUrl = 'https://mobile.events.data.microsoft.com/OneCollector/1.0';
async function getClient(instrumentationKey, addInternalFlag, xhrOverride) {
    const oneDs = await import('@microsoft/1ds-core-js');
    const postPlugin = await import('@microsoft/1ds-post-js');
    const appInsightsCore = new oneDs.AppInsightsCore();
    const collectorChannelPlugin = new postPlugin.PostChannel();
    // Configure the app insights core to send to collector++ and disable logging of debug info
    const coreConfig = {
        instrumentationKey,
        endpointUrl,
        loggingLevelTelemetry: 0,
        loggingLevelConsole: 0,
        disableCookiesUsage: true,
        disableDbgExt: true,
        disableInstrumentationKeyValidation: true,
        channels: [[
                collectorChannelPlugin
            ]]
    };
    if (xhrOverride) {
        coreConfig.extensionConfig = {};
        // Configure the channel to use a XHR Request override since it's not available in node
        const channelConfig = {
            alwaysUseXhrOverride: true,
            httpXHROverride: xhrOverride
        };
        coreConfig.extensionConfig[collectorChannelPlugin.identifier] = channelConfig;
    }
    appInsightsCore.initialize(coreConfig, []);
    appInsightsCore.addTelemetryInitializer((envelope) => {
        if (addInternalFlag) {
            envelope['ext'] = envelope['ext'] ?? {};
            envelope['ext']['utc'] = envelope['ext']['utc'] ?? {};
            // Sets it to be internal only based on Windows UTC flagging
            envelope['ext']['utc']['flags'] = 0x0000811ECD;
        }
    });
    return appInsightsCore;
}
// TODO @lramos15 maybe make more in line with src/vs/platform/telemetry/browser/appInsightsAppender.ts with caching support
export class AbstractOneDataSystemAppender {
    _isInternalTelemetry;
    _eventPrefix;
    _defaultData;
    _xhrOverride;
    _aiCoreOrKey;
    _asyncAiCore;
    endPointUrl = endpointUrl;
    constructor(_isInternalTelemetry, _eventPrefix, _defaultData, iKeyOrClientFactory, // allow factory function for testing
    _xhrOverride) {
        this._isInternalTelemetry = _isInternalTelemetry;
        this._eventPrefix = _eventPrefix;
        this._defaultData = _defaultData;
        this._xhrOverride = _xhrOverride;
        if (!this._defaultData) {
            this._defaultData = {};
        }
        if (typeof iKeyOrClientFactory === 'function') {
            this._aiCoreOrKey = iKeyOrClientFactory();
        }
        else {
            this._aiCoreOrKey = iKeyOrClientFactory;
        }
        this._asyncAiCore = null;
    }
    _withAIClient(callback) {
        if (!this._aiCoreOrKey) {
            return;
        }
        if (typeof this._aiCoreOrKey !== 'string') {
            callback(this._aiCoreOrKey);
            return;
        }
        if (!this._asyncAiCore) {
            this._asyncAiCore = getClient(this._aiCoreOrKey, this._isInternalTelemetry, this._xhrOverride);
        }
        this._asyncAiCore.then((aiClient) => {
            callback(aiClient);
        }, (err) => {
            onUnexpectedError(err);
            console.error(err);
        });
    }
    log(eventName, data) {
        if (!this._aiCoreOrKey) {
            return;
        }
        data = mixin(data, this._defaultData);
        data = validateTelemetryData(data);
        const name = this._eventPrefix + '/' + eventName;
        try {
            this._withAIClient((aiClient) => {
                aiClient.pluginVersionString = data?.properties.version ?? 'Unknown';
                aiClient.track({
                    name,
                    baseData: { name, properties: data?.properties, measurements: data?.measurements }
                });
            });
        }
        catch { }
    }
    flush() {
        if (this._aiCoreOrKey) {
            return new Promise(resolve => {
                this._withAIClient((aiClient) => {
                    aiClient.unload(true, () => {
                        this._aiCoreOrKey = undefined;
                        resolve(undefined);
                    });
                });
            });
        }
        return Promise.resolve(undefined);
    }
}
