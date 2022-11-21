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
import { coalesce } from 'vs/base/common/arrays';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { EDITOR_FONT_DEFAULTS } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { CommentThreadWidget } from 'vs/workbench/contrib/comments/browser/commentThreadWidget';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
let CellComments = class CellComments extends CellContentPart {
    notebookEditor;
    container;
    contextKeyService;
    themeService;
    commentService;
    configurationService;
    instantiationService;
    _initialized = false;
    _commentThreadWidget = null;
    currentElement;
    commentTheadDisposables = this._register(new DisposableStore());
    constructor(notebookEditor, container, contextKeyService, themeService, commentService, configurationService, instantiationService) {
        super();
        this.notebookEditor = notebookEditor;
        this.container = container;
        this.contextKeyService = contextKeyService;
        this.themeService = themeService;
        this.commentService = commentService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.container.classList.add('review-widget');
        this._register(this.themeService.onDidColorThemeChange(this._applyTheme, this));
        // TODO @rebornix onDidChangeLayout (font change)
        // this._register(this.notebookEditor.onDidchangeLa)
        this._applyTheme();
    }
    async initialize(element) {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        const info = await this._getCommentThreadForCell(element);
        if (info) {
            this._createCommentTheadWidget(info.owner, info.thread);
        }
    }
    _createCommentTheadWidget(owner, commentThread) {
        this._commentThreadWidget?.dispose();
        this.commentTheadDisposables.clear();
        this._commentThreadWidget = this.instantiationService.createInstance(CommentThreadWidget, this.container, owner, this.notebookEditor.textModel.uri, this.contextKeyService, this.instantiationService, commentThread, null, {
            codeBlockFontFamily: this.configurationService.getValue('editor').fontFamily || EDITOR_FONT_DEFAULTS.fontFamily
        }, undefined, {
            actionRunner: () => {
            },
            collapse: () => { }
        });
        const layoutInfo = this.notebookEditor.getLayoutInfo();
        this._commentThreadWidget.display(layoutInfo.fontInfo.lineHeight);
        this._applyTheme();
        this.commentTheadDisposables.add(this._commentThreadWidget.onDidResize(() => {
            if (this.currentElement?.cellKind === CellKind.Code && this._commentThreadWidget) {
                this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
            }
        }));
    }
    _bindListeners() {
        this.cellDisposables.add(this.commentService.onDidUpdateCommentThreads(async () => {
            if (this.currentElement) {
                const info = await this._getCommentThreadForCell(this.currentElement);
                if (!this._commentThreadWidget && info) {
                    this._createCommentTheadWidget(info.owner, info.thread);
                    const layoutInfo = this.currentElement.layoutInfo;
                    this.container.style.top = `${layoutInfo.outputContainerOffset + layoutInfo.outputTotalHeight}px`;
                    this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
                    return;
                }
                if (this._commentThreadWidget) {
                    if (!info) {
                        this._commentThreadWidget.dispose();
                        this.currentElement.commentHeight = 0;
                        return;
                    }
                    if (this._commentThreadWidget.commentThread === info.thread) {
                        this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
                        return;
                    }
                    this._commentThreadWidget.updateCommentThread(info.thread);
                    this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
                }
            }
        }));
    }
    _calculateCommentThreadHeight(bodyHeight) {
        const layoutInfo = this.notebookEditor.getLayoutInfo();
        const headHeight = Math.ceil(layoutInfo.fontInfo.lineHeight * 1.2);
        const lineHeight = layoutInfo.fontInfo.lineHeight;
        const arrowHeight = Math.round(lineHeight / 3);
        const frameThickness = Math.round(lineHeight / 9) * 2;
        const computedHeight = headHeight + bodyHeight + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */;
        return computedHeight;
    }
    async _getCommentThreadForCell(element) {
        if (this.notebookEditor.hasModel()) {
            const commentInfos = coalesce(await this.commentService.getNotebookComments(element.uri));
            if (commentInfos.length && commentInfos[0].threads.length) {
                return { owner: commentInfos[0].owner, thread: commentInfos[0].threads[0] };
            }
        }
        return null;
    }
    _applyTheme() {
        const theme = this.themeService.getColorTheme();
        const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
        this._commentThreadWidget?.applyTheme(theme, fontInfo);
    }
    didRenderCell(element) {
        if (element.cellKind === CellKind.Code) {
            this.currentElement = element;
            this.initialize(element);
            this._bindListeners();
        }
    }
    prepareLayout() {
        if (this.currentElement?.cellKind === CellKind.Code && this._commentThreadWidget) {
            this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.getDimensions().height);
        }
    }
    updateInternalLayoutNow(element) {
        if (this.currentElement?.cellKind === CellKind.Code && this._commentThreadWidget) {
            const layoutInfo = element.layoutInfo;
            this.container.style.top = `${layoutInfo.outputContainerOffset + layoutInfo.outputTotalHeight}px`;
        }
    }
};
CellComments = __decorate([
    __param(2, IContextKeyService),
    __param(3, IThemeService),
    __param(4, ICommentService),
    __param(5, IConfigurationService),
    __param(6, IInstantiationService)
], CellComments);
export { CellComments };
