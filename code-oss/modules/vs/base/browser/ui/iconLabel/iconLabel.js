/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./iconlabel';
import * as dom from 'vs/base/browser/dom';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { setupCustomHover, setupNativeHover } from 'vs/base/browser/ui/iconLabel/iconLabelHover';
import { Disposable } from 'vs/base/common/lifecycle';
import { equals } from 'vs/base/common/objects';
import { Range } from 'vs/base/common/range';
class FastLabelNode {
    _element;
    disposed;
    _textContent;
    _className;
    _empty;
    constructor(_element) {
        this._element = _element;
    }
    get element() {
        return this._element;
    }
    set textContent(content) {
        if (this.disposed || content === this._textContent) {
            return;
        }
        this._textContent = content;
        this._element.textContent = content;
    }
    set className(className) {
        if (this.disposed || className === this._className) {
            return;
        }
        this._className = className;
        this._element.className = className;
    }
    set empty(empty) {
        if (this.disposed || empty === this._empty) {
            return;
        }
        this._empty = empty;
        this._element.style.marginLeft = empty ? '0' : '';
    }
    dispose() {
        this.disposed = true;
    }
}
export class IconLabel extends Disposable {
    creationOptions;
    domNode;
    nameNode;
    descriptionNode;
    labelContainer;
    hoverDelegate;
    customHovers = new Map();
    constructor(container, options) {
        super();
        this.creationOptions = options;
        this.domNode = this._register(new FastLabelNode(dom.append(container, dom.$('.monaco-icon-label'))));
        this.labelContainer = dom.append(this.domNode.element, dom.$('.monaco-icon-label-container'));
        const nameContainer = dom.append(this.labelContainer, dom.$('span.monaco-icon-name-container'));
        if (options?.supportHighlights || options?.supportIcons) {
            this.nameNode = new LabelWithHighlights(nameContainer, !!options.supportIcons);
        }
        else {
            this.nameNode = new Label(nameContainer);
        }
        this.hoverDelegate = options?.hoverDelegate;
    }
    get element() {
        return this.domNode.element;
    }
    setLabel(label, description, options) {
        const labelClasses = ['monaco-icon-label'];
        const containerClasses = ['monaco-icon-label-container'];
        if (options) {
            if (options.extraClasses) {
                labelClasses.push(...options.extraClasses);
            }
            if (options.italic) {
                labelClasses.push('italic');
            }
            if (options.strikethrough) {
                labelClasses.push('strikethrough');
            }
            if (options.disabledCommand) {
                containerClasses.push('disabled');
            }
        }
        this.domNode.className = labelClasses.join(' ');
        this.labelContainer.className = containerClasses.join(' ');
        this.setupHover(options?.descriptionTitle ? this.labelContainer : this.element, options?.title);
        this.nameNode.setLabel(label, options);
        if (description || this.descriptionNode) {
            const descriptionNode = this.getOrCreateDescriptionNode();
            if (descriptionNode instanceof HighlightedLabel) {
                descriptionNode.set(description || '', options ? options.descriptionMatches : undefined);
                this.setupHover(descriptionNode.element, options?.descriptionTitle);
            }
            else {
                descriptionNode.textContent = description || '';
                this.setupHover(descriptionNode.element, options?.descriptionTitle || '');
                descriptionNode.empty = !description;
            }
        }
    }
    setupHover(htmlElement, tooltip) {
        const previousCustomHover = this.customHovers.get(htmlElement);
        if (previousCustomHover) {
            previousCustomHover.dispose();
            this.customHovers.delete(htmlElement);
        }
        if (!tooltip) {
            htmlElement.removeAttribute('title');
            return;
        }
        if (!this.hoverDelegate) {
            setupNativeHover(htmlElement, tooltip);
        }
        else {
            const hoverDisposable = setupCustomHover(this.hoverDelegate, htmlElement, tooltip);
            if (hoverDisposable) {
                this.customHovers.set(htmlElement, hoverDisposable);
            }
        }
    }
    dispose() {
        super.dispose();
        for (const disposable of this.customHovers.values()) {
            disposable.dispose();
        }
        this.customHovers.clear();
    }
    getOrCreateDescriptionNode() {
        if (!this.descriptionNode) {
            const descriptionContainer = this._register(new FastLabelNode(dom.append(this.labelContainer, dom.$('span.monaco-icon-description-container'))));
            if (this.creationOptions?.supportDescriptionHighlights) {
                this.descriptionNode = new HighlightedLabel(dom.append(descriptionContainer.element, dom.$('span.label-description')), { supportIcons: !!this.creationOptions.supportIcons });
            }
            else {
                this.descriptionNode = this._register(new FastLabelNode(dom.append(descriptionContainer.element, dom.$('span.label-description'))));
            }
        }
        return this.descriptionNode;
    }
}
class Label {
    container;
    label = undefined;
    singleLabel = undefined;
    options;
    constructor(container) {
        this.container = container;
    }
    setLabel(label, options) {
        if (this.label === label && equals(this.options, options)) {
            return;
        }
        this.label = label;
        this.options = options;
        if (typeof label === 'string') {
            if (!this.singleLabel) {
                this.container.innerText = '';
                this.container.classList.remove('multiple');
                this.singleLabel = dom.append(this.container, dom.$('a.label-name', { id: options?.domId }));
            }
            this.singleLabel.textContent = label;
        }
        else {
            this.container.innerText = '';
            this.container.classList.add('multiple');
            this.singleLabel = undefined;
            for (let i = 0; i < label.length; i++) {
                const l = label[i];
                const id = options?.domId && `${options?.domId}_${i}`;
                dom.append(this.container, dom.$('a.label-name', { id, 'data-icon-label-count': label.length, 'data-icon-label-index': i, 'role': 'treeitem' }, l));
                if (i < label.length - 1) {
                    dom.append(this.container, dom.$('span.label-separator', undefined, options?.separator || '/'));
                }
            }
        }
    }
}
function splitMatches(labels, separator, matches) {
    if (!matches) {
        return undefined;
    }
    let labelStart = 0;
    return labels.map(label => {
        const labelRange = { start: labelStart, end: labelStart + label.length };
        const result = matches
            .map(match => Range.intersect(labelRange, match))
            .filter(range => !Range.isEmpty(range))
            .map(({ start, end }) => ({ start: start - labelStart, end: end - labelStart }));
        labelStart = labelRange.end + separator.length;
        return result;
    });
}
class LabelWithHighlights {
    container;
    supportIcons;
    label = undefined;
    singleLabel = undefined;
    options;
    constructor(container, supportIcons) {
        this.container = container;
        this.supportIcons = supportIcons;
    }
    setLabel(label, options) {
        if (this.label === label && equals(this.options, options)) {
            return;
        }
        this.label = label;
        this.options = options;
        if (typeof label === 'string') {
            if (!this.singleLabel) {
                this.container.innerText = '';
                this.container.classList.remove('multiple');
                this.singleLabel = new HighlightedLabel(dom.append(this.container, dom.$('a.label-name', { id: options?.domId })), { supportIcons: this.supportIcons });
            }
            this.singleLabel.set(label, options?.matches, undefined, options?.labelEscapeNewLines);
        }
        else {
            this.container.innerText = '';
            this.container.classList.add('multiple');
            this.singleLabel = undefined;
            const separator = options?.separator || '/';
            const matches = splitMatches(label, separator, options?.matches);
            for (let i = 0; i < label.length; i++) {
                const l = label[i];
                const m = matches ? matches[i] : undefined;
                const id = options?.domId && `${options?.domId}_${i}`;
                const name = dom.$('a.label-name', { id, 'data-icon-label-count': label.length, 'data-icon-label-index': i, 'role': 'treeitem' });
                const highlightedLabel = new HighlightedLabel(dom.append(this.container, name), { supportIcons: this.supportIcons });
                highlightedLabel.set(l, m, undefined, options?.labelEscapeNewLines);
                if (i < label.length - 1) {
                    dom.append(name, dom.$('span.label-separator', undefined, separator));
                }
            }
        }
    }
}
