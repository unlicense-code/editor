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
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { createMatches } from 'vs/base/common/filters';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { Range } from 'vs/editor/common/core/range';
import * as dom from 'vs/base/browser/dom';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { TextModel } from 'vs/editor/common/model/textModel';
import { BulkFileOperations } from 'vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview';
import { FileKind } from 'vs/platform/files/common/files';
import { localize } from 'vs/nls';
import { ILabelService } from 'vs/platform/label/common/label';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { basename } from 'vs/base/common/resources';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { compare } from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { ResourceFileEdit } from 'vs/editor/browser/services/bulkEditService';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { SnippetParser } from 'vs/editor/contrib/snippet/browser/snippetParser';
export class CategoryElement {
    parent;
    category;
    constructor(parent, category) {
        this.parent = parent;
        this.category = category;
    }
}
export class FileElement {
    parent;
    edit;
    constructor(parent, edit) {
        this.parent = parent;
        this.edit = edit;
    }
    isChecked() {
        const model = this.parent instanceof CategoryElement ? this.parent.parent : this.parent;
        let checked = true;
        // only text edit children -> reflect children state
        if (this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
            checked = !this.edit.textEdits.every(edit => !model.checked.isChecked(edit.textEdit));
        }
        // multiple file edits -> reflect single state
        for (const edit of this.edit.originalEdits.values()) {
            if (edit instanceof ResourceFileEdit) {
                checked = checked && model.checked.isChecked(edit);
            }
        }
        // multiple categories and text change -> read all elements
        if (this.parent instanceof CategoryElement && this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
            for (const category of model.categories) {
                for (const file of category.fileOperations) {
                    if (file.uri.toString() === this.edit.uri.toString()) {
                        for (const edit of file.originalEdits.values()) {
                            if (edit instanceof ResourceFileEdit) {
                                checked = checked && model.checked.isChecked(edit);
                            }
                        }
                    }
                }
            }
        }
        return checked;
    }
    setChecked(value) {
        const model = this.parent instanceof CategoryElement ? this.parent.parent : this.parent;
        for (const edit of this.edit.originalEdits.values()) {
            model.checked.updateChecked(edit, value);
        }
        // multiple categories and file change -> update all elements
        if (this.parent instanceof CategoryElement && this.edit.type !== 1 /* BulkFileOperationType.TextEdit */) {
            for (const category of model.categories) {
                for (const file of category.fileOperations) {
                    if (file.uri.toString() === this.edit.uri.toString()) {
                        for (const edit of file.originalEdits.values()) {
                            model.checked.updateChecked(edit, value);
                        }
                    }
                }
            }
        }
    }
    isDisabled() {
        if (this.parent instanceof CategoryElement && this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
            const model = this.parent.parent;
            let checked = true;
            for (const category of model.categories) {
                for (const file of category.fileOperations) {
                    if (file.uri.toString() === this.edit.uri.toString()) {
                        for (const edit of file.originalEdits.values()) {
                            if (edit instanceof ResourceFileEdit) {
                                checked = checked && model.checked.isChecked(edit);
                            }
                        }
                    }
                }
            }
            return !checked;
        }
        return false;
    }
}
export class TextEditElement {
    parent;
    idx;
    edit;
    prefix;
    selecting;
    inserting;
    suffix;
    constructor(parent, idx, edit, prefix, selecting, inserting, suffix) {
        this.parent = parent;
        this.idx = idx;
        this.edit = edit;
        this.prefix = prefix;
        this.selecting = selecting;
        this.inserting = inserting;
        this.suffix = suffix;
    }
    isChecked() {
        let model = this.parent.parent;
        if (model instanceof CategoryElement) {
            model = model.parent;
        }
        return model.checked.isChecked(this.edit.textEdit);
    }
    setChecked(value) {
        let model = this.parent.parent;
        if (model instanceof CategoryElement) {
            model = model.parent;
        }
        // check/uncheck this element
        model.checked.updateChecked(this.edit.textEdit, value);
        // make sure parent is checked when this element is checked...
        if (value) {
            for (const edit of this.parent.edit.originalEdits.values()) {
                if (edit instanceof ResourceFileEdit) {
                    model.checked.updateChecked(edit, value);
                }
            }
        }
    }
    isDisabled() {
        return this.parent.isDisabled();
    }
}
// --- DATA SOURCE
let BulkEditDataSource = class BulkEditDataSource {
    _textModelService;
    _undoRedoService;
    _languageService;
    _languageConfigurationService;
    groupByFile = true;
    constructor(_textModelService, _undoRedoService, _languageService, _languageConfigurationService) {
        this._textModelService = _textModelService;
        this._undoRedoService = _undoRedoService;
        this._languageService = _languageService;
        this._languageConfigurationService = _languageConfigurationService;
    }
    hasChildren(element) {
        if (element instanceof FileElement) {
            return element.edit.textEdits.length > 0;
        }
        if (element instanceof TextEditElement) {
            return false;
        }
        return true;
    }
    async getChildren(element) {
        // root -> file/text edits
        if (element instanceof BulkFileOperations) {
            return this.groupByFile
                ? element.fileOperations.map(op => new FileElement(element, op))
                : element.categories.map(cat => new CategoryElement(element, cat));
        }
        // category
        if (element instanceof CategoryElement) {
            return Array.from(element.category.fileOperations, op => new FileElement(element, op));
        }
        // file: text edit
        if (element instanceof FileElement && element.edit.textEdits.length > 0) {
            // const previewUri = BulkEditPreviewProvider.asPreviewUri(element.edit.resource);
            let textModel;
            let textModelDisposable;
            try {
                const ref = await this._textModelService.createModelReference(element.edit.uri);
                textModel = ref.object.textEditorModel;
                textModelDisposable = ref;
            }
            catch {
                textModel = new TextModel('', PLAINTEXT_LANGUAGE_ID, TextModel.DEFAULT_CREATION_OPTIONS, null, this._undoRedoService, this._languageService, this._languageConfigurationService);
                textModelDisposable = textModel;
            }
            const result = element.edit.textEdits.map((edit, idx) => {
                const range = Range.lift(edit.textEdit.textEdit.range);
                //prefix-math
                const startTokens = textModel.tokenization.getLineTokens(range.startLineNumber);
                let prefixLen = 23; // default value for the no tokens/grammar case
                for (let idx = startTokens.findTokenIndexAtOffset(range.startColumn - 1) - 1; prefixLen < 50 && idx >= 0; idx--) {
                    prefixLen = range.startColumn - startTokens.getStartOffset(idx);
                }
                //suffix-math
                const endTokens = textModel.tokenization.getLineTokens(range.endLineNumber);
                let suffixLen = 0;
                for (let idx = endTokens.findTokenIndexAtOffset(range.endColumn - 1); suffixLen < 50 && idx < endTokens.getCount(); idx++) {
                    suffixLen += endTokens.getEndOffset(idx) - endTokens.getStartOffset(idx);
                }
                return new TextEditElement(element, idx, edit, textModel.getValueInRange(new Range(range.startLineNumber, range.startColumn - prefixLen, range.startLineNumber, range.startColumn)), textModel.getValueInRange(range), !edit.textEdit.textEdit.insertAsSnippet ? edit.textEdit.textEdit.text : SnippetParser.asInsertText(edit.textEdit.textEdit.text), textModel.getValueInRange(new Range(range.endLineNumber, range.endColumn, range.endLineNumber, range.endColumn + suffixLen)));
            });
            textModelDisposable.dispose();
            return result;
        }
        return [];
    }
};
BulkEditDataSource = __decorate([
    __param(0, ITextModelService),
    __param(1, IUndoRedoService),
    __param(2, ILanguageService),
    __param(3, ILanguageConfigurationService)
], BulkEditDataSource);
export { BulkEditDataSource };
export class BulkEditSorter {
    compare(a, b) {
        if (a instanceof FileElement && b instanceof FileElement) {
            return compare(a.edit.uri.toString(), b.edit.uri.toString());
        }
        if (a instanceof TextEditElement && b instanceof TextEditElement) {
            return Range.compareRangesUsingStarts(a.edit.textEdit.textEdit.range, b.edit.textEdit.textEdit.range);
        }
        return 0;
    }
}
// --- ACCESSI
let BulkEditAccessibilityProvider = class BulkEditAccessibilityProvider {
    _labelService;
    constructor(_labelService) {
        this._labelService = _labelService;
    }
    getWidgetAriaLabel() {
        return localize('bulkEdit', "Bulk Edit");
    }
    getRole(_element) {
        return 'checkbox';
    }
    getAriaLabel(element) {
        if (element instanceof FileElement) {
            if (element.edit.textEdits.length > 0) {
                if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                    return localize('aria.renameAndEdit', "Renaming {0} to {1}, also making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }), this._labelService.getUriLabel(element.edit.newUri, { relative: true }));
                }
                else if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                    return localize('aria.createAndEdit', "Creating {0}, also making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                }
                else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                    return localize('aria.deleteAndEdit', "Deleting {0}, also making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                }
                else {
                    return localize('aria.editOnly', "{0}, making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                }
            }
            else {
                if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                    return localize('aria.rename', "Renaming {0} to {1}", this._labelService.getUriLabel(element.edit.uri, { relative: true }), this._labelService.getUriLabel(element.edit.newUri, { relative: true }));
                }
                else if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                    return localize('aria.create', "Creating {0}", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                }
                else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                    return localize('aria.delete', "Deleting {0}", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                }
            }
        }
        if (element instanceof TextEditElement) {
            if (element.selecting.length > 0 && element.inserting.length > 0) {
                // edit: replace
                return localize('aria.replace', "line {0}, replacing {1} with {2}", element.edit.textEdit.textEdit.range.startLineNumber, element.selecting, element.inserting);
            }
            else if (element.selecting.length > 0 && element.inserting.length === 0) {
                // edit: delete
                return localize('aria.del', "line {0}, removing {1}", element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
            }
            else if (element.selecting.length === 0 && element.inserting.length > 0) {
                // edit: insert
                return localize('aria.insert', "line {0}, inserting {1}", element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
            }
        }
        return null;
    }
};
BulkEditAccessibilityProvider = __decorate([
    __param(0, ILabelService)
], BulkEditAccessibilityProvider);
export { BulkEditAccessibilityProvider };
// --- IDENT
export class BulkEditIdentityProvider {
    getId(element) {
        if (element instanceof FileElement) {
            return element.edit.uri + (element.parent instanceof CategoryElement ? JSON.stringify(element.parent.category.metadata) : '');
        }
        else if (element instanceof TextEditElement) {
            return element.parent.edit.uri.toString() + element.idx;
        }
        else {
            return JSON.stringify(element.category.metadata);
        }
    }
}
// --- RENDERER
class CategoryElementTemplate {
    icon;
    label;
    constructor(container) {
        container.classList.add('category');
        this.icon = document.createElement('div');
        container.appendChild(this.icon);
        this.label = new IconLabel(container);
    }
}
let CategoryElementRenderer = class CategoryElementRenderer {
    _themeService;
    static id = 'CategoryElementRenderer';
    templateId = CategoryElementRenderer.id;
    constructor(_themeService) {
        this._themeService = _themeService;
    }
    renderTemplate(container) {
        return new CategoryElementTemplate(container);
    }
    renderElement(node, _index, template) {
        template.icon.style.setProperty('--background-dark', null);
        template.icon.style.setProperty('--background-light', null);
        template.icon.style.color = '';
        const { metadata } = node.element.category;
        if (ThemeIcon.isThemeIcon(metadata.iconPath)) {
            // css
            const className = ThemeIcon.asClassName(metadata.iconPath);
            template.icon.className = className ? `theme-icon ${className}` : '';
            template.icon.style.color = metadata.iconPath.color ? this._themeService.getColorTheme().getColor(metadata.iconPath.color.id)?.toString() ?? '' : '';
        }
        else if (URI.isUri(metadata.iconPath)) {
            // background-image
            template.icon.className = 'uri-icon';
            template.icon.style.setProperty('--background-dark', dom.asCSSUrl(metadata.iconPath));
            template.icon.style.setProperty('--background-light', dom.asCSSUrl(metadata.iconPath));
        }
        else if (metadata.iconPath) {
            // background-image
            template.icon.className = 'uri-icon';
            template.icon.style.setProperty('--background-dark', dom.asCSSUrl(metadata.iconPath.dark));
            template.icon.style.setProperty('--background-light', dom.asCSSUrl(metadata.iconPath.light));
        }
        template.label.setLabel(metadata.label, metadata.description, {
            descriptionMatches: createMatches(node.filterData),
        });
    }
    disposeTemplate(template) {
        template.label.dispose();
    }
};
CategoryElementRenderer = __decorate([
    __param(0, IThemeService)
], CategoryElementRenderer);
export { CategoryElementRenderer };
let FileElementTemplate = class FileElementTemplate {
    _labelService;
    _disposables = new DisposableStore();
    _localDisposables = new DisposableStore();
    _checkbox;
    _label;
    _details;
    constructor(container, resourceLabels, _labelService) {
        this._labelService = _labelService;
        this._checkbox = document.createElement('input');
        this._checkbox.className = 'edit-checkbox';
        this._checkbox.type = 'checkbox';
        this._checkbox.setAttribute('role', 'checkbox');
        container.appendChild(this._checkbox);
        this._label = resourceLabels.create(container, { supportHighlights: true });
        this._details = document.createElement('span');
        this._details.className = 'details';
        container.appendChild(this._details);
    }
    dispose() {
        this._localDisposables.dispose();
        this._disposables.dispose();
        this._label.dispose();
    }
    set(element, score) {
        this._localDisposables.clear();
        this._checkbox.checked = element.isChecked();
        this._checkbox.disabled = element.isDisabled();
        this._localDisposables.add(dom.addDisposableListener(this._checkbox, 'change', () => {
            element.setChecked(this._checkbox.checked);
        }));
        if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
            // rename: oldName → newName
            this._label.setResource({
                resource: element.edit.uri,
                name: localize('rename.label', "{0} → {1}", this._labelService.getUriLabel(element.edit.uri, { relative: true }), this._labelService.getUriLabel(element.edit.newUri, { relative: true })),
            }, {
                fileDecorations: { colors: true, badges: false }
            });
            this._details.innerText = localize('detail.rename', "(renaming)");
        }
        else {
            // create, delete, edit: NAME
            const options = {
                matches: createMatches(score),
                fileKind: FileKind.FILE,
                fileDecorations: { colors: true, badges: false },
                extraClasses: []
            };
            if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                this._details.innerText = localize('detail.create', "(creating)");
            }
            else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                this._details.innerText = localize('detail.del', "(deleting)");
                options.extraClasses.push('delete');
            }
            else {
                this._details.innerText = '';
            }
            this._label.setFile(element.edit.uri, options);
        }
    }
};
FileElementTemplate = __decorate([
    __param(2, ILabelService)
], FileElementTemplate);
let FileElementRenderer = class FileElementRenderer {
    _resourceLabels;
    _labelService;
    static id = 'FileElementRenderer';
    templateId = FileElementRenderer.id;
    constructor(_resourceLabels, _labelService) {
        this._resourceLabels = _resourceLabels;
        this._labelService = _labelService;
    }
    renderTemplate(container) {
        return new FileElementTemplate(container, this._resourceLabels, this._labelService);
    }
    renderElement(node, _index, template) {
        template.set(node.element, node.filterData);
    }
    disposeTemplate(template) {
        template.dispose();
    }
};
FileElementRenderer = __decorate([
    __param(1, ILabelService)
], FileElementRenderer);
export { FileElementRenderer };
let TextEditElementTemplate = class TextEditElementTemplate {
    _themeService;
    _disposables = new DisposableStore();
    _localDisposables = new DisposableStore();
    _checkbox;
    _icon;
    _label;
    constructor(container, _themeService) {
        this._themeService = _themeService;
        container.classList.add('textedit');
        this._checkbox = document.createElement('input');
        this._checkbox.className = 'edit-checkbox';
        this._checkbox.type = 'checkbox';
        this._checkbox.setAttribute('role', 'checkbox');
        container.appendChild(this._checkbox);
        this._icon = document.createElement('div');
        container.appendChild(this._icon);
        this._label = new HighlightedLabel(container);
    }
    dispose() {
        this._localDisposables.dispose();
        this._disposables.dispose();
    }
    set(element) {
        this._localDisposables.clear();
        this._localDisposables.add(dom.addDisposableListener(this._checkbox, 'change', e => {
            element.setChecked(this._checkbox.checked);
            e.preventDefault();
        }));
        if (element.parent.isChecked()) {
            this._checkbox.checked = element.isChecked();
            this._checkbox.disabled = element.isDisabled();
        }
        else {
            this._checkbox.checked = element.isChecked();
            this._checkbox.disabled = element.isDisabled();
        }
        let value = '';
        value += element.prefix;
        value += element.selecting;
        value += element.inserting;
        value += element.suffix;
        const selectHighlight = { start: element.prefix.length, end: element.prefix.length + element.selecting.length, extraClasses: ['remove'] };
        const insertHighlight = { start: selectHighlight.end, end: selectHighlight.end + element.inserting.length, extraClasses: ['insert'] };
        let title;
        const { metadata } = element.edit.textEdit;
        if (metadata && metadata.description) {
            title = localize('title', "{0} - {1}", metadata.label, metadata.description);
        }
        else if (metadata) {
            title = metadata.label;
        }
        const iconPath = metadata?.iconPath;
        if (!iconPath) {
            this._icon.style.display = 'none';
        }
        else {
            this._icon.style.display = 'block';
            this._icon.style.setProperty('--background-dark', null);
            this._icon.style.setProperty('--background-light', null);
            if (ThemeIcon.isThemeIcon(iconPath)) {
                // css
                const className = ThemeIcon.asClassName(iconPath);
                this._icon.className = className ? `theme-icon ${className}` : '';
                this._icon.style.color = iconPath.color ? this._themeService.getColorTheme().getColor(iconPath.color.id)?.toString() ?? '' : '';
            }
            else if (URI.isUri(iconPath)) {
                // background-image
                this._icon.className = 'uri-icon';
                this._icon.style.setProperty('--background-dark', dom.asCSSUrl(iconPath));
                this._icon.style.setProperty('--background-light', dom.asCSSUrl(iconPath));
            }
            else {
                // background-image
                this._icon.className = 'uri-icon';
                this._icon.style.setProperty('--background-dark', dom.asCSSUrl(iconPath.dark));
                this._icon.style.setProperty('--background-light', dom.asCSSUrl(iconPath.light));
            }
        }
        this._label.set(value, [selectHighlight, insertHighlight], title, true);
        this._icon.title = title || '';
    }
};
TextEditElementTemplate = __decorate([
    __param(1, IThemeService)
], TextEditElementTemplate);
let TextEditElementRenderer = class TextEditElementRenderer {
    _themeService;
    static id = 'TextEditElementRenderer';
    templateId = TextEditElementRenderer.id;
    constructor(_themeService) {
        this._themeService = _themeService;
    }
    renderTemplate(container) {
        return new TextEditElementTemplate(container, this._themeService);
    }
    renderElement({ element }, _index, template) {
        template.set(element);
    }
    disposeTemplate(_template) { }
};
TextEditElementRenderer = __decorate([
    __param(0, IThemeService)
], TextEditElementRenderer);
export { TextEditElementRenderer };
export class BulkEditDelegate {
    getHeight() {
        return 23;
    }
    getTemplateId(element) {
        if (element instanceof FileElement) {
            return FileElementRenderer.id;
        }
        else if (element instanceof TextEditElement) {
            return TextEditElementRenderer.id;
        }
        else {
            return CategoryElementRenderer.id;
        }
    }
}
export class BulkEditNaviLabelProvider {
    getKeyboardNavigationLabel(element) {
        if (element instanceof FileElement) {
            return basename(element.edit.uri);
        }
        else if (element instanceof CategoryElement) {
            return element.category.metadata.label;
        }
        return undefined;
    }
}
