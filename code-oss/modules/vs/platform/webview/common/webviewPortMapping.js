/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { extractLocalHostUriMetaDataForPortMapping } from 'vs/platform/tunnel/common/tunnel';
/**
 * Manages port mappings for a single webview.
 */
export class WebviewPortMappingManager {
    _getExtensionLocation;
    _getMappings;
    tunnelService;
    _tunnels = new Map();
    constructor(_getExtensionLocation, _getMappings, tunnelService) {
        this._getExtensionLocation = _getExtensionLocation;
        this._getMappings = _getMappings;
        this.tunnelService = tunnelService;
    }
    async getRedirect(resolveAuthority, url) {
        const uri = URI.parse(url);
        const requestLocalHostInfo = extractLocalHostUriMetaDataForPortMapping(uri);
        if (!requestLocalHostInfo) {
            return undefined;
        }
        for (const mapping of this._getMappings()) {
            if (mapping.webviewPort === requestLocalHostInfo.port) {
                const extensionLocation = this._getExtensionLocation();
                if (extensionLocation && extensionLocation.scheme === Schemas.vscodeRemote) {
                    const tunnel = resolveAuthority && await this.getOrCreateTunnel(resolveAuthority, mapping.extensionHostPort);
                    if (tunnel) {
                        if (tunnel.tunnelLocalPort === mapping.webviewPort) {
                            return undefined;
                        }
                        return encodeURI(uri.with({
                            authority: `127.0.0.1:${tunnel.tunnelLocalPort}`,
                        }).toString(true));
                    }
                }
                if (mapping.webviewPort !== mapping.extensionHostPort) {
                    return encodeURI(uri.with({
                        authority: `${requestLocalHostInfo.address}:${mapping.extensionHostPort}`
                    }).toString(true));
                }
            }
        }
        return undefined;
    }
    async dispose() {
        for (const tunnel of this._tunnels.values()) {
            await tunnel.dispose();
        }
        this._tunnels.clear();
    }
    async getOrCreateTunnel(remoteAuthority, remotePort) {
        const existing = this._tunnels.get(remotePort);
        if (existing) {
            return existing;
        }
        const tunnel = await this.tunnelService.openTunnel({ getAddress: async () => remoteAuthority }, undefined, remotePort);
        if (tunnel) {
            this._tunnels.set(remotePort, tunnel);
        }
        return tunnel;
    }
}
