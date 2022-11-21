/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IRemoteTunnelService = createDecorator('IRemoteTunnelService');
export var TunnelStates;
(function (TunnelStates) {
    TunnelStates.disconnected = { type: 'disconnected' };
    TunnelStates.uninitialized = { type: 'uninitialized' };
    TunnelStates.connected = (info) => ({ type: 'connected', info });
    TunnelStates.connecting = (progress) => ({ type: 'connecting', progress });
})(TunnelStates || (TunnelStates = {}));
export const CONFIGURATION_KEY_PREFIX = 'remote.tunnels.access';
export const CONFIGURATION_KEY_HOST_NAME = CONFIGURATION_KEY_PREFIX + '.hostNameOverride';
