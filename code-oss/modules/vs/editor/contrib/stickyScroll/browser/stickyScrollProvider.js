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
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { OutlineModel, OutlineElement, OutlineGroup } from 'vs/editor/contrib/documentSymbols/browser/outlineModel';
import { CancellationTokenSource, } from 'vs/base/common/cancellation';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { binarySearch } from 'vs/base/common/arrays';
import { Iterable } from 'vs/base/common/iterator';
import { FoldingController } from 'vs/editor/contrib/folding/browser/folding';
import { isEqual } from 'vs/base/common/resources';
export class StickyRange {
    startLineNumber;
    endLineNumber;
    constructor(startLineNumber, endLineNumber) {
        this.startLineNumber = startLineNumber;
        this.endLineNumber = endLineNumber;
    }
}
export class StickyLineCandidate {
    startLineNumber;
    endLineNumber;
    nestingDepth;
    constructor(startLineNumber, endLineNumber, nestingDepth) {
        this.startLineNumber = startLineNumber;
        this.endLineNumber = endLineNumber;
        this.nestingDepth = nestingDepth;
    }
}
let StickyLineCandidateProvider = class StickyLineCandidateProvider extends Disposable {
    static ID = 'store.contrib.stickyScrollController';
    _onDidChangeStickyScroll = this._store.add(new Emitter());
    onDidChangeStickyScroll = this._onDidChangeStickyScroll.event;
    _editor;
    _languageFeaturesService;
    _updateSoon;
    _sessionStore = new DisposableStore();
    _cts;
    _model;
    constructor(editor, languageFeaturesService) {
        super();
        this._editor = editor;
        this._languageFeaturesService = languageFeaturesService;
        this._updateSoon = this._register(new RunOnceScheduler(() => this.update(), 50));
        this._register(this._editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(105 /* EditorOption.stickyScroll */)) {
                this.readConfiguration();
            }
        }));
        this.readConfiguration();
    }
    dispose() {
        super.dispose();
        this._sessionStore.dispose();
    }
    readConfiguration() {
        const options = this._editor.getOption(105 /* EditorOption.stickyScroll */);
        if (options.enabled === false) {
            this._sessionStore.clear();
            return;
        }
        else {
            this._sessionStore.add(this._editor.onDidChangeModel(() => {
                this.update();
            }));
            this._sessionStore.add(this._editor.onDidChangeHiddenAreas(() => this.update()));
            this._sessionStore.add(this._editor.onDidChangeModelContent(() => this._updateSoon.schedule()));
            this._sessionStore.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => {
                this.update();
            }));
            this.update();
        }
    }
    getVersionId() {
        return this._model?.version ?? -1;
    }
    async update() {
        this._cts?.dispose(true);
        this._cts = new CancellationTokenSource();
        await this.updateOutlineModel(this._cts.token);
        this._onDidChangeStickyScroll.fire();
    }
    async updateOutlineModel(token) {
        if (!this._editor.hasModel()) {
            return;
        }
        const model = this._editor.getModel();
        const modelVersionId = model.getVersionId();
        const isDifferentModel = this._model ? !isEqual(this._model.uri, model.uri) : false;
        // clear sticky scroll to not show stale data for too long
        const resetHandle = isDifferentModel ? setTimeout(() => {
            if (!token.isCancellationRequested) {
                this._model = new StickyOutlineModel(model.uri, model.getVersionId(), undefined, undefined);
                this._onDidChangeStickyScroll.fire();
            }
        }, 75) : undefined;
        // get elements from outline or folding model
        const outlineModel = await OutlineModel.create(this._languageFeaturesService.documentSymbolProvider, model, token);
        if (token.isCancellationRequested) {
            return;
        }
        if (outlineModel.children.size !== 0) {
            const { stickyOutlineElement, providerID } = StickyOutlineElement.fromOutlineModel(outlineModel, this._model?.outlineProviderId);
            this._model = new StickyOutlineModel(model.uri, modelVersionId, stickyOutlineElement, providerID);
        }
        else {
            const foldingController = FoldingController.get(this._editor);
            const foldingModel = await foldingController?.getFoldingModel();
            if (token.isCancellationRequested) {
                return;
            }
            if (foldingModel && foldingModel.regions.length !== 0) {
                const foldingElement = StickyOutlineElement.fromFoldingModel(foldingModel);
                this._model = new StickyOutlineModel(model.uri, modelVersionId, foldingElement, undefined);
            }
            else {
                this._model = undefined;
            }
        }
        clearTimeout(resetHandle);
    }
    updateIndex(index) {
        if (index === -1) {
            index = 0;
        }
        else if (index < 0) {
            index = -index - 2;
        }
        return index;
    }
    getCandidateStickyLinesIntersectingFromOutline(range, outlineModel, result, depth, lastStartLineNumber) {
        if (outlineModel.children.length === 0) {
            return;
        }
        let lastLine = lastStartLineNumber;
        const childrenStartLines = [];
        for (let i = 0; i < outlineModel.children.length; i++) {
            const child = outlineModel.children[i];
            if (child.range) {
                childrenStartLines.push(child.range.startLineNumber);
            }
        }
        const lowerBound = this.updateIndex(binarySearch(childrenStartLines, range.startLineNumber, (a, b) => { return a - b; }));
        const upperBound = this.updateIndex(binarySearch(childrenStartLines, range.startLineNumber + depth, (a, b) => { return a - b; }));
        for (let i = lowerBound; i <= upperBound; i++) {
            const child = outlineModel.children[i];
            if (!child) {
                return;
            }
            if (child.range) {
                const childStartLine = child.range.startLineNumber;
                const childEndLine = child.range.endLineNumber;
                if (range.startLineNumber <= childEndLine + 1 && childStartLine - 1 <= range.endLineNumber && childStartLine !== lastLine) {
                    lastLine = childStartLine;
                    result.push(new StickyLineCandidate(childStartLine, childEndLine - 1, depth + 1));
                    this.getCandidateStickyLinesIntersectingFromOutline(range, child, result, depth + 1, childStartLine);
                }
            }
            else {
                this.getCandidateStickyLinesIntersectingFromOutline(range, child, result, depth, lastStartLineNumber);
            }
        }
    }
    getCandidateStickyLinesIntersecting(range) {
        if (!this._model?.element) {
            return [];
        }
        let stickyLineCandidates = [];
        this.getCandidateStickyLinesIntersectingFromOutline(range, this._model.element, stickyLineCandidates, 0, -1);
        const hiddenRanges = this._editor._getViewModel()?.getHiddenAreas();
        if (hiddenRanges) {
            for (const hiddenRange of hiddenRanges) {
                stickyLineCandidates = stickyLineCandidates.filter(stickyLine => !(stickyLine.startLineNumber >= hiddenRange.startLineNumber && stickyLine.endLineNumber <= hiddenRange.endLineNumber + 1));
            }
        }
        return stickyLineCandidates;
    }
};
StickyLineCandidateProvider = __decorate([
    __param(1, ILanguageFeaturesService)
], StickyLineCandidateProvider);
export { StickyLineCandidateProvider };
class StickyOutlineElement {
    range;
    children;
    parent;
    static comparator(range1, range2) {
        if (range1.startLineNumber !== range2.startLineNumber) {
            return range1.startLineNumber - range2.startLineNumber;
        }
        else {
            return range2.endLineNumber - range1.endLineNumber;
        }
    }
    static fromOutlineElement(outlineElement, previousStartLine) {
        const children = [];
        for (const child of outlineElement.children.values()) {
            if (child.symbol.selectionRange.startLineNumber !== child.symbol.range.endLineNumber) {
                if (child.symbol.selectionRange.startLineNumber !== previousStartLine) {
                    children.push(StickyOutlineElement.fromOutlineElement(child, child.symbol.selectionRange.startLineNumber));
                }
                else {
                    for (const subchild of child.children.values()) {
                        children.push(StickyOutlineElement.fromOutlineElement(subchild, child.symbol.selectionRange.startLineNumber));
                    }
                }
            }
        }
        children.sort((child1, child2) => this.comparator(child1.range, child2.range));
        const range = new StickyRange(outlineElement.symbol.selectionRange.startLineNumber, outlineElement.symbol.range.endLineNumber);
        return new StickyOutlineElement(range, children, undefined);
    }
    static fromOutlineModel(outlineModel, preferredProvider) {
        let outlineElements;
        // When several possible outline providers
        if (Iterable.first(outlineModel.children.values()) instanceof OutlineGroup) {
            const provider = Iterable.find(outlineModel.children.values(), outlineGroupOfModel => outlineGroupOfModel.id === preferredProvider);
            if (provider) {
                outlineElements = provider.children;
            }
            else {
                let tempID = '';
                let maxTotalSumOfRanges = -1;
                let optimalOutlineGroup = undefined;
                for (const [_key, outlineGroup] of outlineModel.children.entries()) {
                    const totalSumRanges = StickyOutlineElement.findSumOfRangesOfGroup(outlineGroup);
                    if (totalSumRanges > maxTotalSumOfRanges) {
                        optimalOutlineGroup = outlineGroup;
                        maxTotalSumOfRanges = totalSumRanges;
                        tempID = outlineGroup.id;
                    }
                }
                preferredProvider = tempID;
                outlineElements = optimalOutlineGroup.children;
            }
        }
        else {
            outlineElements = outlineModel.children;
        }
        const stickyChildren = [];
        const outlineElementsArray = Array.from(outlineElements.values()).sort((element1, element2) => {
            const range1 = new StickyRange(element1.symbol.range.startLineNumber, element1.symbol.range.endLineNumber);
            const range2 = new StickyRange(element2.symbol.range.startLineNumber, element2.symbol.range.endLineNumber);
            return this.comparator(range1, range2);
        });
        for (const outlineElement of outlineElementsArray) {
            stickyChildren.push(StickyOutlineElement.fromOutlineElement(outlineElement, outlineElement.symbol.selectionRange.startLineNumber));
        }
        const stickyOutlineElement = new StickyOutlineElement(undefined, stickyChildren, undefined);
        return {
            stickyOutlineElement: stickyOutlineElement,
            providerID: preferredProvider
        };
    }
    static findSumOfRangesOfGroup(outline) {
        let res = 0;
        for (const child of outline.children.values()) {
            res += this.findSumOfRangesOfGroup(child);
        }
        if (outline instanceof OutlineElement) {
            return res + outline.symbol.range.endLineNumber - outline.symbol.selectionRange.startLineNumber;
        }
        else {
            return res;
        }
    }
    static fromFoldingModel(foldingModel) {
        const regions = foldingModel.regions;
        const length = regions.length;
        let range;
        const stackOfParents = [];
        const stickyOutlineElement = new StickyOutlineElement(undefined, [], undefined);
        let parentStickyOutlineElement = stickyOutlineElement;
        for (let i = 0; i < length; i++) {
            range = new StickyRange(regions.getStartLineNumber(i), regions.getEndLineNumber(i) + 1);
            while (stackOfParents.length !== 0 && (range.startLineNumber < stackOfParents[stackOfParents.length - 1].startLineNumber || range.endLineNumber > stackOfParents[stackOfParents.length - 1].endLineNumber)) {
                stackOfParents.pop();
                if (parentStickyOutlineElement.parent !== undefined) {
                    parentStickyOutlineElement = parentStickyOutlineElement.parent;
                }
            }
            const child = new StickyOutlineElement(range, [], parentStickyOutlineElement);
            parentStickyOutlineElement.children.push(child);
            parentStickyOutlineElement = child;
            stackOfParents.push(range);
        }
        return stickyOutlineElement;
    }
    constructor(
    /**
     * Range of line numbers spanned by the current scope
     */
    range, 
    /**
     * Must be sorted by start line number
    */
    children, 
    /**
     * Parent sticky outline element
     */
    parent) {
        this.range = range;
        this.children = children;
        this.parent = parent;
    }
}
class StickyOutlineModel {
    uri;
    version;
    element;
    outlineProviderId;
    constructor(uri, version, element, outlineProviderId) {
        this.uri = uri;
        this.version = version;
        this.element = element;
        this.outlineProviderId = outlineProviderId;
    }
}
