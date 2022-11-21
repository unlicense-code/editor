/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as platform from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
export class RemoteExtensionEnvironmentChannelClient {
    static async getEnvironmentData(channel, remoteAuthority) {
        const args = {
            remoteAuthority
        };
        const data = await channel.call('getEnvironmentData', args);
        return {
            pid: data.pid,
            connectionToken: data.connectionToken,
            appRoot: URI.revive(data.appRoot),
            settingsPath: URI.revive(data.settingsPath),
            logsPath: URI.revive(data.logsPath),
            extensionsPath: URI.revive(data.extensionsPath),
            extensionHostLogsPath: URI.revive(data.extensionHostLogsPath),
            globalStorageHome: URI.revive(data.globalStorageHome),
            workspaceStorageHome: URI.revive(data.workspaceStorageHome),
            localHistoryHome: URI.revive(data.localHistoryHome),
            userHome: URI.revive(data.userHome),
            os: data.os,
            arch: data.arch,
            marks: data.marks,
            useHostProxy: data.useHostProxy
        };
    }
    static async getExtensionHostExitInfo(channel, remoteAuthority, reconnectionToken) {
        const args = {
            remoteAuthority,
            reconnectionToken
        };
        return channel.call('getExtensionHostExitInfo', args);
    }
    static async whenExtensionsReady(channel) {
        await channel.call('whenExtensionsReady');
    }
    static async scanExtensions(channel, remoteAuthority, extensionDevelopmentPath, skipExtensions) {
        const args = {
            language: platform.language,
            remoteAuthority,
            extensionDevelopmentPath,
            skipExtensions
        };
        const extensions = await channel.call('scanExtensions', args);
        extensions.forEach(ext => { ext.extensionLocation = URI.revive(ext.extensionLocation); });
        return extensions;
    }
    static async scanSingleExtension(channel, remoteAuthority, isBuiltin, extensionLocation) {
        const args = {
            language: platform.language,
            remoteAuthority,
            isBuiltin,
            extensionLocation
        };
        const extension = await channel.call('scanSingleExtension', args);
        if (extension) {
            extension.extensionLocation = URI.revive(extension.extensionLocation);
        }
        return extension;
    }
    static getDiagnosticInfo(channel, options) {
        return channel.call('getDiagnosticInfo', options);
    }
    static updateTelemetryLevel(channel, telemetryLevel) {
        return channel.call('updateTelemetryLevel', { telemetryLevel });
    }
    static logTelemetry(channel, eventName, data) {
        return channel.call('logTelemetry', { eventName, data });
    }
    static flushTelemetry(channel) {
        return channel.call('flushTelemetry');
    }
    static async ping(channel) {
        await channel.call('ping');
    }
}
