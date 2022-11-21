/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { revive } from 'vs/base/common/marshalling';
import { cloneAndChange } from 'vs/base/common/objects';
import { URI } from 'vs/base/common/uri';
import { DefaultURITransformer, transformAndReviveIncomingURIs } from 'vs/base/common/uriIpc';
import { isTargetPlatformCompatible } from 'vs/platform/extensionManagement/common/extensionManagement';
function transformIncomingURI(uri, transformer) {
    return URI.revive(transformer ? transformer.transformIncoming(uri) : uri);
}
function transformOutgoingURI(uri, transformer) {
    return transformer ? transformer.transformOutgoingURI(uri) : uri;
}
function transformIncomingExtension(extension, transformer) {
    transformer = transformer ? transformer : DefaultURITransformer;
    const manifest = extension.manifest;
    const transformed = transformAndReviveIncomingURIs({ ...extension, ...{ manifest: undefined } }, transformer);
    return { ...transformed, ...{ manifest } };
}
function transformOutgoingExtension(extension, transformer) {
    return transformer ? cloneAndChange(extension, value => value instanceof URI ? transformer.transformOutgoingURI(value) : undefined) : extension;
}
export class ExtensionManagementChannel {
    service;
    getUriTransformer;
    onInstallExtension;
    onDidInstallExtensions;
    onUninstallExtension;
    onDidUninstallExtension;
    constructor(service, getUriTransformer) {
        this.service = service;
        this.getUriTransformer = getUriTransformer;
        this.onInstallExtension = Event.buffer(service.onInstallExtension, true);
        this.onDidInstallExtensions = Event.buffer(service.onDidInstallExtensions, true);
        this.onUninstallExtension = Event.buffer(service.onUninstallExtension, true);
        this.onDidUninstallExtension = Event.buffer(service.onDidUninstallExtension, true);
    }
    listen(context, event) {
        const uriTransformer = this.getUriTransformer(context);
        switch (event) {
            case 'onInstallExtension': return this.onInstallExtension;
            case 'onDidInstallExtensions': return Event.map(this.onDidInstallExtensions, results => results.map(i => ({ ...i, local: i.local ? transformOutgoingExtension(i.local, uriTransformer) : i.local })));
            case 'onUninstallExtension': return this.onUninstallExtension;
            case 'onDidUninstallExtension': return this.onDidUninstallExtension;
        }
        throw new Error('Invalid listen');
    }
    call(context, command, args) {
        const uriTransformer = this.getUriTransformer(context);
        switch (command) {
            case 'zip': return this.service.zip(transformIncomingExtension(args[0], uriTransformer)).then(uri => transformOutgoingURI(uri, uriTransformer));
            case 'unzip': return this.service.unzip(transformIncomingURI(args[0], uriTransformer));
            case 'install': return this.service.install(transformIncomingURI(args[0], uriTransformer), revive(args[1]));
            case 'getManifest': return this.service.getManifest(transformIncomingURI(args[0], uriTransformer));
            case 'getTargetPlatform': return this.service.getTargetPlatform();
            case 'canInstall': return this.service.canInstall(args[0]);
            case 'installFromGallery': return this.service.installFromGallery(args[0], revive(args[1]));
            case 'uninstall': return this.service.uninstall(transformIncomingExtension(args[0], uriTransformer), revive(args[1]));
            case 'reinstallFromGallery': return this.service.reinstallFromGallery(transformIncomingExtension(args[0], uriTransformer));
            case 'getInstalled': return this.service.getInstalled(args[0], URI.revive(args[1])).then(extensions => extensions.map(e => transformOutgoingExtension(e, uriTransformer)));
            case 'getMetadata': return this.service.getMetadata(transformIncomingExtension(args[0], uriTransformer));
            case 'updateMetadata': return this.service.updateMetadata(transformIncomingExtension(args[0], uriTransformer), args[1]).then(e => transformOutgoingExtension(e, uriTransformer));
            case 'updateExtensionScope': return this.service.updateExtensionScope(transformIncomingExtension(args[0], uriTransformer), args[1]).then(e => transformOutgoingExtension(e, uriTransformer));
            case 'getExtensionsControlManifest': return this.service.getExtensionsControlManifest();
            case 'download': return this.service.download(args[0], args[1]);
        }
        throw new Error('Invalid call');
    }
}
export class ExtensionManagementChannelClient extends Disposable {
    channel;
    _onInstallExtension = this._register(new Emitter());
    get onInstallExtension() { return this._onInstallExtension.event; }
    _onDidInstallExtensions = this._register(new Emitter());
    get onDidInstallExtensions() { return this._onDidInstallExtensions.event; }
    _onUninstallExtension = this._register(new Emitter());
    get onUninstallExtension() { return this._onUninstallExtension.event; }
    _onDidUninstallExtension = this._register(new Emitter());
    get onDidUninstallExtension() { return this._onDidUninstallExtension.event; }
    constructor(channel) {
        super();
        this.channel = channel;
        this._register(this.channel.listen('onInstallExtension')(e => this._onInstallExtension.fire({ identifier: e.identifier, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) })));
        this._register(this.channel.listen('onDidInstallExtensions')(results => this._onDidInstallExtensions.fire(results.map(e => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) })))));
        this._register(this.channel.listen('onUninstallExtension')(e => this._onUninstallExtension.fire({ identifier: e.identifier, profileLocation: URI.revive(e.profileLocation) })));
        this._register(this.channel.listen('onDidUninstallExtension')(e => this._onDidUninstallExtension.fire({ ...e, profileLocation: URI.revive(e.profileLocation) })));
    }
    isUriComponents(thing) {
        if (!thing) {
            return false;
        }
        return typeof thing.path === 'string' &&
            typeof thing.scheme === 'string';
    }
    _targetPlatformPromise;
    getTargetPlatform() {
        if (!this._targetPlatformPromise) {
            this._targetPlatformPromise = this.channel.call('getTargetPlatform');
        }
        return this._targetPlatformPromise;
    }
    async canInstall(extension) {
        const currentTargetPlatform = await this.getTargetPlatform();
        return extension.allTargetPlatforms.some(targetPlatform => isTargetPlatformCompatible(targetPlatform, extension.allTargetPlatforms, currentTargetPlatform));
    }
    zip(extension) {
        return Promise.resolve(this.channel.call('zip', [extension]).then(result => URI.revive(result)));
    }
    unzip(zipLocation) {
        return Promise.resolve(this.channel.call('unzip', [zipLocation]));
    }
    install(vsix, options) {
        return Promise.resolve(this.channel.call('install', [vsix, options])).then(local => transformIncomingExtension(local, null));
    }
    getManifest(vsix) {
        return Promise.resolve(this.channel.call('getManifest', [vsix]));
    }
    installFromGallery(extension, installOptions) {
        return Promise.resolve(this.channel.call('installFromGallery', [extension, installOptions])).then(local => transformIncomingExtension(local, null));
    }
    uninstall(extension, options) {
        return Promise.resolve(this.channel.call('uninstall', [extension, options]));
    }
    reinstallFromGallery(extension) {
        return Promise.resolve(this.channel.call('reinstallFromGallery', [extension]));
    }
    getInstalled(type = null, extensionsProfileResource) {
        return Promise.resolve(this.channel.call('getInstalled', [type, extensionsProfileResource]))
            .then(extensions => extensions.map(extension => transformIncomingExtension(extension, null)));
    }
    getMetadata(local) {
        return Promise.resolve(this.channel.call('getMetadata', [local]));
    }
    updateMetadata(local, metadata) {
        return Promise.resolve(this.channel.call('updateMetadata', [local, metadata]))
            .then(extension => transformIncomingExtension(extension, null));
    }
    updateExtensionScope(local, isMachineScoped) {
        return Promise.resolve(this.channel.call('updateExtensionScope', [local, isMachineScoped]))
            .then(extension => transformIncomingExtension(extension, null));
    }
    getExtensionsControlManifest() {
        return Promise.resolve(this.channel.call('getExtensionsControlManifest'));
    }
    async download(extension, operation) {
        const result = await this.channel.call('download', [extension, operation]);
        return URI.revive(result);
    }
    registerParticipant() { throw new Error('Not Supported'); }
}
export class ExtensionTipsChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    listen(context, event) {
        throw new Error('Invalid listen');
    }
    call(context, command, args) {
        switch (command) {
            case 'getConfigBasedTips': return this.service.getConfigBasedTips(URI.revive(args[0]));
            case 'getImportantExecutableBasedTips': return this.service.getImportantExecutableBasedTips();
            case 'getOtherExecutableBasedTips': return this.service.getOtherExecutableBasedTips();
            case 'getAllWorkspacesTips': return this.service.getAllWorkspacesTips();
        }
        throw new Error('Invalid call');
    }
}
