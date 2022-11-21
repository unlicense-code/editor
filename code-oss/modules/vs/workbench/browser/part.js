/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./media/part';
import { Component } from 'vs/workbench/common/component';
import { Dimension, size } from 'vs/base/browser/dom';
import { Emitter } from 'vs/base/common/event';
import { assertIsDefined } from 'vs/base/common/types';
/**
 * Parts are layed out in the workbench and have their own layout that
 * arranges an optional title and mandatory content area to show content.
 */
export class Part extends Component {
    options;
    layoutService;
    _dimension;
    get dimension() { return this._dimension; }
    _onDidVisibilityChange = this._register(new Emitter());
    onDidVisibilityChange = this._onDidVisibilityChange.event;
    parent;
    titleArea;
    contentArea;
    partLayout;
    constructor(id, options, themeService, storageService, layoutService) {
        super(id, themeService, storageService);
        this.options = options;
        this.layoutService = layoutService;
        layoutService.registerPart(this);
    }
    onThemeChange(theme) {
        // only call if our create() method has been called
        if (this.parent) {
            super.onThemeChange(theme);
        }
    }
    updateStyles() {
        super.updateStyles();
    }
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Called to create title and content area of the part.
     */
    create(parent, options) {
        this.parent = parent;
        this.titleArea = this.createTitleArea(parent, options);
        this.contentArea = this.createContentArea(parent, options);
        this.partLayout = new PartLayout(this.options, this.contentArea);
        this.updateStyles();
    }
    /**
     * Returns the overall part container.
     */
    getContainer() {
        return this.parent;
    }
    /**
     * Subclasses override to provide a title area implementation.
     */
    createTitleArea(parent, options) {
        return undefined;
    }
    /**
     * Returns the title area container.
     */
    getTitleArea() {
        return this.titleArea;
    }
    /**
     * Subclasses override to provide a content area implementation.
     */
    createContentArea(parent, options) {
        return undefined;
    }
    /**
     * Returns the content area container.
     */
    getContentArea() {
        return this.contentArea;
    }
    /**
     * Layout title and content area in the given dimension.
     */
    layoutContents(width, height) {
        const partLayout = assertIsDefined(this.partLayout);
        return partLayout.layout(width, height);
    }
    //#region ISerializableView
    _onDidChange = this._register(new Emitter());
    get onDidChange() { return this._onDidChange.event; }
    element;
    layout(width, height, _top, _left) {
        this._dimension = new Dimension(width, height);
    }
    setVisible(visible) {
        this._onDidVisibilityChange.fire(visible);
    }
}
class PartLayout {
    options;
    contentArea;
    static TITLE_HEIGHT = 35;
    constructor(options, contentArea) {
        this.options = options;
        this.contentArea = contentArea;
    }
    layout(width, height) {
        // Title Size: Width (Fill), Height (Variable)
        let titleSize;
        if (this.options.hasTitle) {
            titleSize = new Dimension(width, Math.min(height, PartLayout.TITLE_HEIGHT));
        }
        else {
            titleSize = Dimension.None;
        }
        let contentWidth = width;
        if (this.options && typeof this.options.borderWidth === 'function') {
            contentWidth -= this.options.borderWidth(); // adjust for border size
        }
        // Content Size: Width (Fill), Height (Variable)
        const contentSize = new Dimension(contentWidth, height - titleSize.height);
        // Content
        if (this.contentArea) {
            size(this.contentArea, contentSize.width, contentSize.height);
        }
        return { titleSize, contentSize };
    }
}
