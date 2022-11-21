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
import * as nls from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { isTemporaryWorkspace, IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { ResourcesDropHandler } from 'vs/workbench/browser/dnd';
import { listDropBackground } from 'vs/platform/theme/common/colorRegistry';
import { ILabelService } from 'vs/platform/label/common/label';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { isWeb } from 'vs/base/common/platform';
import { DragAndDropObserver } from 'vs/base/browser/dom';
let EmptyView = class EmptyView extends ViewPane {
    contextService;
    labelService;
    static ID = 'workbench.explorer.emptyView';
    static NAME = nls.localize('noWorkspace', "No Folder Opened");
    constructor(options, themeService, viewDescriptorService, instantiationService, keybindingService, contextMenuService, contextService, configurationService, labelService, contextKeyService, openerService, telemetryService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.contextService = contextService;
        this.labelService = labelService;
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.refreshTitle()));
        this._register(this.labelService.onDidChangeFormatters(() => this.refreshTitle()));
    }
    shouldShowWelcome() {
        return true;
    }
    renderBody(container) {
        super.renderBody(container);
        this._register(new DragAndDropObserver(container, {
            onDrop: e => {
                container.style.backgroundColor = '';
                const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: !isWeb || isTemporaryWorkspace(this.contextService.getWorkspace()) });
                dropHandler.handleDrop(e, () => undefined, () => undefined);
            },
            onDragEnter: () => {
                const color = this.themeService.getColorTheme().getColor(listDropBackground);
                container.style.backgroundColor = color ? color.toString() : '';
            },
            onDragEnd: () => {
                container.style.backgroundColor = '';
            },
            onDragLeave: () => {
                container.style.backgroundColor = '';
            },
            onDragOver: e => {
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'copy';
                }
            }
        }));
        this.refreshTitle();
    }
    refreshTitle() {
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            this.updateTitle(EmptyView.NAME);
        }
        else {
            this.updateTitle(this.title);
        }
    }
};
EmptyView = __decorate([
    __param(1, IThemeService),
    __param(2, IViewDescriptorService),
    __param(3, IInstantiationService),
    __param(4, IKeybindingService),
    __param(5, IContextMenuService),
    __param(6, IWorkspaceContextService),
    __param(7, IConfigurationService),
    __param(8, ILabelService),
    __param(9, IContextKeyService),
    __param(10, IOpenerService),
    __param(11, ITelemetryService)
], EmptyView);
export { EmptyView };
