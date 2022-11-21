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
import * as browser from 'vs/base/browser/browser';
import * as DOM from 'vs/base/browser/dom';
import { createFastDomNode } from 'vs/base/browser/fastDomNode';
import { Color } from 'vs/base/common/color';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { defaultInsertColor, defaultRemoveColor, diffInserted, diffOverviewRulerInserted, diffOverviewRulerRemoved, diffRemoved } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
let NotebookDiffOverviewRuler = class NotebookDiffOverviewRuler extends Themable {
    notebookEditor;
    width;
    _domNode;
    _overviewViewportDomElement;
    _diffElementViewModels = [];
    _lanes = 2;
    _insertColor;
    _insertColorHex;
    _removeColor;
    _removeColorHex;
    _disposables;
    _renderAnimationFrame;
    constructor(notebookEditor, width, container, themeService) {
        super(themeService);
        this.notebookEditor = notebookEditor;
        this.width = width;
        this._insertColor = null;
        this._removeColor = null;
        this._insertColorHex = null;
        this._removeColorHex = null;
        this._disposables = this._register(new DisposableStore());
        this._renderAnimationFrame = null;
        this._domNode = createFastDomNode(document.createElement('canvas'));
        this._domNode.setPosition('relative');
        this._domNode.setLayerHinting(true);
        this._domNode.setContain('strict');
        container.appendChild(this._domNode.domNode);
        this._overviewViewportDomElement = createFastDomNode(document.createElement('div'));
        this._overviewViewportDomElement.setClassName('diffViewport');
        this._overviewViewportDomElement.setPosition('absolute');
        this._overviewViewportDomElement.setWidth(width);
        container.appendChild(this._overviewViewportDomElement.domNode);
        this._register(browser.PixelRatio.onDidChange(() => {
            this._scheduleRender();
        }));
        this._register(this.themeService.onDidColorThemeChange(e => {
            const colorChanged = this.applyColors(e);
            if (colorChanged) {
                this._scheduleRender();
            }
        }));
        this.applyColors(this.themeService.getColorTheme());
        this._register(this.notebookEditor.onDidScroll(() => {
            this._renderOverviewViewport();
        }));
        this._register(DOM.addStandardDisposableListener(container, DOM.EventType.POINTER_DOWN, (e) => {
            this.notebookEditor.delegateVerticalScrollbarPointerDown(e);
        }));
    }
    applyColors(theme) {
        const newInsertColor = theme.getColor(diffOverviewRulerInserted) || (theme.getColor(diffInserted) || defaultInsertColor).transparent(2);
        const newRemoveColor = theme.getColor(diffOverviewRulerRemoved) || (theme.getColor(diffRemoved) || defaultRemoveColor).transparent(2);
        const hasChanges = !newInsertColor.equals(this._insertColor) || !newRemoveColor.equals(this._removeColor);
        this._insertColor = newInsertColor;
        this._removeColor = newRemoveColor;
        if (this._insertColor) {
            this._insertColorHex = Color.Format.CSS.formatHexA(this._insertColor);
        }
        if (this._removeColor) {
            this._removeColorHex = Color.Format.CSS.formatHexA(this._removeColor);
        }
        return hasChanges;
    }
    layout() {
        this._layoutNow();
    }
    updateViewModels(elements, eventDispatcher) {
        this._disposables.clear();
        this._diffElementViewModels = elements;
        if (eventDispatcher) {
            this._disposables.add(eventDispatcher.onDidChangeLayout(() => {
                this._scheduleRender();
            }));
            this._disposables.add(eventDispatcher.onDidChangeCellLayout(() => {
                this._scheduleRender();
            }));
        }
        this._scheduleRender();
    }
    _scheduleRender() {
        if (this._renderAnimationFrame === null) {
            this._renderAnimationFrame = DOM.runAtThisOrScheduleAtNextAnimationFrame(this._onRenderScheduled.bind(this), 100);
        }
    }
    _onRenderScheduled() {
        this._renderAnimationFrame = null;
        this._layoutNow();
    }
    _layoutNow() {
        const layoutInfo = this.notebookEditor.getLayoutInfo();
        const height = layoutInfo.height;
        const scrollHeight = layoutInfo.scrollHeight;
        const ratio = browser.PixelRatio.value;
        this._domNode.setWidth(this.width);
        this._domNode.setHeight(height);
        this._domNode.domNode.width = this.width * ratio;
        this._domNode.domNode.height = height * ratio;
        const ctx = this._domNode.domNode.getContext('2d');
        ctx.clearRect(0, 0, this.width * ratio, height * ratio);
        this._renderCanvas(ctx, this.width * ratio, height * ratio, scrollHeight * ratio, ratio);
        this._renderOverviewViewport();
    }
    _renderOverviewViewport() {
        const layout = this._computeOverviewViewport();
        if (!layout) {
            this._overviewViewportDomElement.setTop(0);
            this._overviewViewportDomElement.setHeight(0);
        }
        else {
            this._overviewViewportDomElement.setTop(layout.top);
            this._overviewViewportDomElement.setHeight(layout.height);
        }
    }
    _computeOverviewViewport() {
        const layoutInfo = this.notebookEditor.getLayoutInfo();
        if (!layoutInfo) {
            return null;
        }
        const scrollTop = this.notebookEditor.getScrollTop();
        const scrollHeight = this.notebookEditor.getScrollHeight();
        const computedAvailableSize = Math.max(0, layoutInfo.height);
        const computedRepresentableSize = Math.max(0, computedAvailableSize - 2 * 0);
        const computedRatio = scrollHeight > 0 ? (computedRepresentableSize / scrollHeight) : 0;
        const computedSliderSize = Math.max(0, Math.floor(layoutInfo.height * computedRatio));
        const computedSliderPosition = Math.floor(scrollTop * computedRatio);
        return {
            height: computedSliderSize,
            top: computedSliderPosition
        };
    }
    _renderCanvas(ctx, width, height, scrollHeight, ratio) {
        if (!this._insertColorHex || !this._removeColorHex) {
            // no op when colors are not yet known
            return;
        }
        const laneWidth = width / this._lanes;
        let currentFrom = 0;
        for (let i = 0; i < this._diffElementViewModels.length; i++) {
            const element = this._diffElementViewModels[i];
            const cellHeight = (element.layoutInfo.totalHeight / scrollHeight) * ratio * height;
            switch (element.type) {
                case 'insert':
                    ctx.fillStyle = this._insertColorHex;
                    ctx.fillRect(laneWidth, currentFrom, laneWidth, cellHeight);
                    break;
                case 'delete':
                    ctx.fillStyle = this._removeColorHex;
                    ctx.fillRect(0, currentFrom, laneWidth, cellHeight);
                    break;
                case 'unchanged':
                    break;
                case 'modified':
                    ctx.fillStyle = this._removeColorHex;
                    ctx.fillRect(0, currentFrom, laneWidth, cellHeight);
                    ctx.fillStyle = this._insertColorHex;
                    ctx.fillRect(laneWidth, currentFrom, laneWidth, cellHeight);
                    break;
            }
            currentFrom += cellHeight;
        }
    }
    dispose() {
        if (this._renderAnimationFrame !== null) {
            this._renderAnimationFrame.dispose();
            this._renderAnimationFrame = null;
        }
        super.dispose();
    }
};
NotebookDiffOverviewRuler = __decorate([
    __param(3, IThemeService)
], NotebookDiffOverviewRuler);
export { NotebookDiffOverviewRuler };
