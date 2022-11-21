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
import { Event, Emitter } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { dispose, Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { Registry } from 'vs/platform/registry/common/platform';
import { IOutputService, OUTPUT_VIEW_ID, OUTPUT_SCHEME, LOG_SCHEME, LOG_MIME, OUTPUT_MIME, Extensions, ACTIVE_OUTPUT_CHANNEL_CONTEXT, CONTEXT_ACTIVE_LOG_OUTPUT } from 'vs/workbench/services/output/common/output';
import { OutputLinkProvider } from 'vs/workbench/contrib/output/browser/outputLinkProvider';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ILogService } from 'vs/platform/log/common/log';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IViewsService } from 'vs/workbench/common/views';
import { IOutputChannelModelService } from 'vs/workbench/contrib/output/common/outputChannelModelService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
const OUTPUT_ACTIVE_CHANNEL_KEY = 'output.activechannel';
let OutputChannel = class OutputChannel extends Disposable {
    outputChannelDescriptor;
    scrollLock = false;
    model;
    id;
    label;
    uri;
    constructor(outputChannelDescriptor, outputChannelModelService, languageService) {
        super();
        this.outputChannelDescriptor = outputChannelDescriptor;
        this.id = outputChannelDescriptor.id;
        this.label = outputChannelDescriptor.label;
        this.uri = URI.from({ scheme: OUTPUT_SCHEME, path: this.id });
        this.model = this._register(outputChannelModelService.createOutputChannelModel(this.id, this.uri, outputChannelDescriptor.languageId ? languageService.createById(outputChannelDescriptor.languageId) : languageService.createByMimeType(outputChannelDescriptor.log ? LOG_MIME : OUTPUT_MIME), outputChannelDescriptor.file));
    }
    append(output) {
        this.model.append(output);
    }
    update(mode, till) {
        this.model.update(mode, till, true);
    }
    clear() {
        this.model.clear();
    }
    replace(value) {
        this.model.replace(value);
    }
};
OutputChannel = __decorate([
    __param(1, IOutputChannelModelService),
    __param(2, ILanguageService)
], OutputChannel);
let OutputService = class OutputService extends Disposable {
    storageService;
    instantiationService;
    logService;
    lifecycleService;
    viewsService;
    channels = new Map();
    activeChannelIdInStorage;
    activeChannel;
    _onActiveOutputChannel = this._register(new Emitter());
    onActiveOutputChannel = this._onActiveOutputChannel.event;
    activeOutputChannelContext;
    activeLogOutputChannelContext;
    constructor(storageService, instantiationService, textModelResolverService, logService, lifecycleService, viewsService, contextKeyService) {
        super();
        this.storageService = storageService;
        this.instantiationService = instantiationService;
        this.logService = logService;
        this.lifecycleService = lifecycleService;
        this.viewsService = viewsService;
        this.activeChannelIdInStorage = this.storageService.get(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */, '');
        this.activeOutputChannelContext = ACTIVE_OUTPUT_CHANNEL_CONTEXT.bindTo(contextKeyService);
        this.activeOutputChannelContext.set(this.activeChannelIdInStorage);
        this._register(this.onActiveOutputChannel(channel => this.activeOutputChannelContext.set(channel)));
        this.activeLogOutputChannelContext = CONTEXT_ACTIVE_LOG_OUTPUT.bindTo(contextKeyService);
        // Register as text model content provider for output
        textModelResolverService.registerTextModelContentProvider(OUTPUT_SCHEME, this);
        instantiationService.createInstance(OutputLinkProvider);
        // Create output channels for already registered channels
        const registry = Registry.as(Extensions.OutputChannels);
        for (const channelIdentifier of registry.getChannels()) {
            this.onDidRegisterChannel(channelIdentifier.id);
        }
        this._register(registry.onDidRegisterChannel(this.onDidRegisterChannel, this));
        // Set active channel to first channel if not set
        if (!this.activeChannel) {
            const channels = this.getChannelDescriptors();
            this.setActiveChannel(channels && channels.length > 0 ? this.getChannel(channels[0].id) : undefined);
        }
        this._register(Event.filter(this.viewsService.onDidChangeViewVisibility, e => e.id === OUTPUT_VIEW_ID && e.visible)(() => {
            if (this.activeChannel) {
                this.viewsService.getActiveViewWithId(OUTPUT_VIEW_ID)?.showChannel(this.activeChannel, true);
            }
        }));
        this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
    }
    provideTextContent(resource) {
        const channel = this.getChannel(resource.path);
        if (channel) {
            return channel.model.loadModel();
        }
        return null;
    }
    async showChannel(id, preserveFocus) {
        const channel = this.getChannel(id);
        if (this.activeChannel?.id !== channel?.id) {
            this.setActiveChannel(channel);
            this._onActiveOutputChannel.fire(id);
        }
        const outputView = await this.viewsService.openView(OUTPUT_VIEW_ID, !preserveFocus);
        if (outputView && channel) {
            outputView.showChannel(channel, !!preserveFocus);
        }
    }
    getChannel(id) {
        return this.channels.get(id);
    }
    getChannelDescriptor(id) {
        return Registry.as(Extensions.OutputChannels).getChannel(id);
    }
    getChannelDescriptors() {
        return Registry.as(Extensions.OutputChannels).getChannels();
    }
    getActiveChannel() {
        return this.activeChannel;
    }
    async onDidRegisterChannel(channelId) {
        const channel = this.createChannel(channelId);
        this.channels.set(channelId, channel);
        if (!this.activeChannel || this.activeChannelIdInStorage === channelId) {
            this.setActiveChannel(channel);
            this._onActiveOutputChannel.fire(channelId);
            const outputView = this.viewsService.getActiveViewWithId(OUTPUT_VIEW_ID);
            outputView?.showChannel(channel, true);
        }
    }
    createChannel(id) {
        const channelDisposables = [];
        const channel = this.instantiateChannel(id);
        channel.model.onDispose(() => {
            if (this.activeChannel === channel) {
                const channels = this.getChannelDescriptors();
                const channel = channels.length ? this.getChannel(channels[0].id) : undefined;
                if (channel && this.viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
                    this.showChannel(channel.id);
                }
                else {
                    this.setActiveChannel(undefined);
                }
            }
            Registry.as(Extensions.OutputChannels).removeChannel(id);
            dispose(channelDisposables);
        }, channelDisposables);
        return channel;
    }
    instantiateChannel(id) {
        const channelData = Registry.as(Extensions.OutputChannels).getChannel(id);
        if (!channelData) {
            this.logService.error(`Channel '${id}' is not registered yet`);
            throw new Error(`Channel '${id}' is not registered yet`);
        }
        return this.instantiationService.createInstance(OutputChannel, channelData);
    }
    setActiveChannel(channel) {
        this.activeChannel = channel;
        this.activeLogOutputChannelContext.set(!!channel?.outputChannelDescriptor?.file && channel?.outputChannelDescriptor?.log);
        if (this.activeChannel) {
            this.storageService.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.activeChannel.id, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        else {
            this.storageService.remove(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */);
        }
    }
};
OutputService = __decorate([
    __param(0, IStorageService),
    __param(1, IInstantiationService),
    __param(2, ITextModelService),
    __param(3, ILogService),
    __param(4, ILifecycleService),
    __param(5, IViewsService),
    __param(6, IContextKeyService)
], OutputService);
export { OutputService };
let LogContentProvider = class LogContentProvider {
    outputService;
    outputChannelModelService;
    languageService;
    channelModels = new Map();
    constructor(outputService, outputChannelModelService, languageService) {
        this.outputService = outputService;
        this.outputChannelModelService = outputChannelModelService;
        this.languageService = languageService;
    }
    provideTextContent(resource) {
        if (resource.scheme === LOG_SCHEME) {
            const channelModel = this.getChannelModel(resource);
            if (channelModel) {
                return channelModel.loadModel();
            }
        }
        return null;
    }
    getChannelModel(resource) {
        const channelId = resource.path;
        let channelModel = this.channelModels.get(channelId);
        if (!channelModel) {
            const channelDisposables = [];
            const outputChannelDescriptor = this.outputService.getChannelDescriptors().filter(({ id }) => id === channelId)[0];
            if (outputChannelDescriptor && outputChannelDescriptor.file) {
                channelModel = this.outputChannelModelService.createOutputChannelModel(channelId, resource, outputChannelDescriptor.languageId ? this.languageService.createById(outputChannelDescriptor.languageId) : this.languageService.createByMimeType(outputChannelDescriptor.log ? LOG_MIME : OUTPUT_MIME), outputChannelDescriptor.file);
                channelModel.onDispose(() => dispose(channelDisposables), channelDisposables);
                this.channelModels.set(channelId, channelModel);
            }
        }
        return channelModel;
    }
};
LogContentProvider = __decorate([
    __param(0, IOutputService),
    __param(1, IOutputChannelModelService),
    __param(2, ILanguageService)
], LogContentProvider);
export { LogContentProvider };
