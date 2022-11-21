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
import { Widget } from 'vs/base/browser/ui/widget';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { RunOnceScheduler } from 'vs/base/common/async';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import * as dom from 'vs/base/browser/dom';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
let EnvironmentVariableInfoWidget = class EnvironmentVariableInfoWidget extends Widget {
    _info;
    _configurationService;
    _hoverService;
    id = 'env-var-info';
    _domNode;
    _container;
    _mouseMoveListener;
    _hoverOptions;
    get requiresAction() { return this._info.requiresAction; }
    constructor(_info, _configurationService, _hoverService) {
        super();
        this._info = _info;
        this._configurationService = _configurationService;
        this._hoverService = _hoverService;
    }
    attach(container) {
        this._container = container;
        this._domNode = document.createElement('div');
        this._domNode.classList.add('terminal-env-var-info', ...ThemeIcon.asClassNameArray(this._info.getIcon()));
        if (this.requiresAction) {
            this._domNode.classList.add('requires-action');
        }
        container.appendChild(this._domNode);
        const scheduler = new RunOnceScheduler(() => this._showHover(), this._configurationService.getValue('workbench.hover.delay'));
        this._register(scheduler);
        const origin = { x: 0, y: 0 };
        this.onmouseover(this._domNode, e => {
            origin.x = e.browserEvent.pageX;
            origin.y = e.browserEvent.pageY;
            scheduler.schedule();
            this._mouseMoveListener = dom.addDisposableListener(this._domNode, dom.EventType.MOUSE_MOVE, e => {
                // Reset the scheduler if the mouse moves too much
                if (Math.abs(e.pageX - origin.x) > window.devicePixelRatio * 2 || Math.abs(e.pageY - origin.y) > window.devicePixelRatio * 2) {
                    origin.x = e.pageX;
                    origin.y = e.pageY;
                    scheduler.schedule();
                }
            });
        });
        this.onmouseleave(this._domNode, () => {
            scheduler.cancel();
            this._mouseMoveListener?.dispose();
        });
    }
    dispose() {
        super.dispose();
        this._domNode?.parentElement?.removeChild(this._domNode);
        this._mouseMoveListener?.dispose();
    }
    focus() {
        this._showHover(true);
    }
    _showHover(focus) {
        if (!this._domNode || !this._container) {
            return;
        }
        if (!this._hoverOptions) {
            const actions = this._info.getActions ? this._info.getActions() : undefined;
            this._hoverOptions = {
                target: this._domNode,
                content: new MarkdownString(this._info.getInfo()),
                actions
            };
        }
        this._hoverService.showHover(this._hoverOptions, focus);
    }
};
EnvironmentVariableInfoWidget = __decorate([
    __param(1, IConfigurationService),
    __param(2, IHoverService)
], EnvironmentVariableInfoWidget);
export { EnvironmentVariableInfoWidget };
