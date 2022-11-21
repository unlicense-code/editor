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
import { RunOnceScheduler } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { compareFileExtensions, compareFileNames, comparePaths } from 'vs/base/common/comparers';
import { memoize } from 'vs/base/common/decorators';
import * as errors from 'vs/base/common/errors';
import { Emitter, Event, PauseableEmitter } from 'vs/base/common/event';
import { Lazy } from 'vs/base/common/lazy';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { Schemas } from 'vs/base/common/network';
import { lcut } from 'vs/base/common/strings';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { MinimapPosition, OverviewRulerLane } from 'vs/editor/common/model';
import { ModelDecorationOptions } from 'vs/editor/common/model/textModel';
import { IModelService } from 'vs/editor/common/services/model';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { minimapFindMatch, overviewRulerFindMatchForeground } from 'vs/platform/theme/common/colorRegistry';
import { themeColorFromId } from 'vs/platform/theme/common/themeService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IReplaceService } from 'vs/workbench/contrib/search/common/replace';
import { ReplacePattern } from 'vs/workbench/services/search/common/replace';
import { ISearchService, OneLineRange, resultIsMatch } from 'vs/workbench/services/search/common/search';
import { addContextToEditorMatches, editorMatchesToTextSearchResults } from 'vs/workbench/services/search/common/searchHelpers';
export class Match {
    _parent;
    _fullPreviewLines;
    static MAX_PREVIEW_CHARS = 250;
    _id;
    _range;
    _oneLinePreviewText;
    _rangeInPreviewText;
    // For replace
    _fullPreviewRange;
    constructor(_parent, _fullPreviewLines, _fullPreviewRange, _documentRange) {
        this._parent = _parent;
        this._fullPreviewLines = _fullPreviewLines;
        this._oneLinePreviewText = _fullPreviewLines[_fullPreviewRange.startLineNumber];
        const adjustedEndCol = _fullPreviewRange.startLineNumber === _fullPreviewRange.endLineNumber ?
            _fullPreviewRange.endColumn :
            this._oneLinePreviewText.length;
        this._rangeInPreviewText = new OneLineRange(1, _fullPreviewRange.startColumn + 1, adjustedEndCol + 1);
        this._range = new Range(_documentRange.startLineNumber + 1, _documentRange.startColumn + 1, _documentRange.endLineNumber + 1, _documentRange.endColumn + 1);
        this._fullPreviewRange = _fullPreviewRange;
        this._id = this._parent.id() + '>' + this._range + this.getMatchString();
    }
    id() {
        return this._id;
    }
    parent() {
        return this._parent;
    }
    text() {
        return this._oneLinePreviewText;
    }
    range() {
        return this._range;
    }
    preview() {
        let before = this._oneLinePreviewText.substring(0, this._rangeInPreviewText.startColumn - 1), inside = this.getMatchString(), after = this._oneLinePreviewText.substring(this._rangeInPreviewText.endColumn - 1);
        before = lcut(before, 26);
        before = before.trimLeft();
        let charsRemaining = Match.MAX_PREVIEW_CHARS - before.length;
        inside = inside.substr(0, charsRemaining);
        charsRemaining -= inside.length;
        after = after.substr(0, charsRemaining);
        return {
            before,
            inside,
            after,
        };
    }
    get replaceString() {
        const searchModel = this.parent().parent().searchModel;
        if (!searchModel.replacePattern) {
            throw new Error('searchModel.replacePattern must be set before accessing replaceString');
        }
        const fullMatchText = this.fullMatchText();
        let replaceString = searchModel.replacePattern.getReplaceString(fullMatchText, searchModel.preserveCase);
        // If match string is not matching then regex pattern has a lookahead expression
        if (replaceString === null) {
            const fullMatchTextWithSurroundingContent = this.fullMatchText(true);
            replaceString = searchModel.replacePattern.getReplaceString(fullMatchTextWithSurroundingContent, searchModel.preserveCase);
            // Search/find normalize line endings - check whether \r prevents regex from matching
            if (replaceString === null) {
                const fullMatchTextWithoutCR = fullMatchTextWithSurroundingContent.replace(/\r\n/g, '\n');
                replaceString = searchModel.replacePattern.getReplaceString(fullMatchTextWithoutCR, searchModel.preserveCase);
            }
        }
        // Match string is still not matching. Could be unsupported matches (multi-line).
        if (replaceString === null) {
            replaceString = searchModel.replacePattern.pattern;
        }
        return replaceString;
    }
    fullMatchText(includeSurrounding = false) {
        let thisMatchPreviewLines;
        if (includeSurrounding) {
            thisMatchPreviewLines = this._fullPreviewLines;
        }
        else {
            thisMatchPreviewLines = this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
            thisMatchPreviewLines[thisMatchPreviewLines.length - 1] = thisMatchPreviewLines[thisMatchPreviewLines.length - 1].slice(0, this._fullPreviewRange.endColumn);
            thisMatchPreviewLines[0] = thisMatchPreviewLines[0].slice(this._fullPreviewRange.startColumn);
        }
        return thisMatchPreviewLines.join('\n');
    }
    rangeInPreview() {
        // convert to editor's base 1 positions.
        return {
            ...this._fullPreviewRange,
            startColumn: this._fullPreviewRange.startColumn + 1,
            endColumn: this._fullPreviewRange.endColumn + 1
        };
    }
    fullPreviewLines() {
        return this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
    }
    getMatchString() {
        return this._oneLinePreviewText.substring(this._rangeInPreviewText.startColumn - 1, this._rangeInPreviewText.endColumn - 1);
    }
}
__decorate([
    memoize
], Match.prototype, "preview", null);
let FileMatch = class FileMatch extends Disposable {
    _query;
    _previewOptions;
    _maxResults;
    _parent;
    rawMatch;
    _closestRoot;
    modelService;
    replaceService;
    labelService;
    static _CURRENT_FIND_MATCH = ModelDecorationOptions.register({
        description: 'search-current-find-match',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        zIndex: 13,
        className: 'currentFindMatch',
        overviewRuler: {
            color: themeColorFromId(overviewRulerFindMatchForeground),
            position: OverviewRulerLane.Center
        },
        minimap: {
            color: themeColorFromId(minimapFindMatch),
            position: MinimapPosition.Inline
        }
    });
    static _FIND_MATCH = ModelDecorationOptions.register({
        description: 'search-find-match',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'findMatch',
        overviewRuler: {
            color: themeColorFromId(overviewRulerFindMatchForeground),
            position: OverviewRulerLane.Center
        },
        minimap: {
            color: themeColorFromId(minimapFindMatch),
            position: MinimapPosition.Inline
        }
    });
    static getDecorationOption(selected) {
        return (selected ? FileMatch._CURRENT_FIND_MATCH : FileMatch._FIND_MATCH);
    }
    _onChange = this._register(new Emitter());
    onChange = this._onChange.event;
    _onDispose = this._register(new Emitter());
    onDispose = this._onDispose.event;
    _resource;
    _fileStat;
    _model = null;
    _modelListener = null;
    _matches;
    _removedMatches;
    _selectedMatch = null;
    _name;
    _updateScheduler;
    _modelDecorations = [];
    _context = new Map();
    get context() {
        return new Map(this._context);
    }
    constructor(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, modelService, replaceService, labelService) {
        super();
        this._query = _query;
        this._previewOptions = _previewOptions;
        this._maxResults = _maxResults;
        this._parent = _parent;
        this.rawMatch = rawMatch;
        this._closestRoot = _closestRoot;
        this.modelService = modelService;
        this.replaceService = replaceService;
        this.labelService = labelService;
        this._resource = this.rawMatch.resource;
        this._matches = new Map();
        this._removedMatches = new Set();
        this._updateScheduler = new RunOnceScheduler(this.updateMatchesForModel.bind(this), 250);
        this._name = new Lazy(() => labelService.getUriBasenameLabel(this.resource));
        this.createMatches();
    }
    get closestRoot() {
        return this._closestRoot;
    }
    createMatches() {
        const model = this.modelService.getModel(this._resource);
        if (model) {
            this.bindModel(model);
            this.updateMatchesForModel();
        }
        else {
            this.rawMatch.results
                .filter(resultIsMatch)
                .forEach(rawMatch => {
                textSearchResultToMatches(rawMatch, this)
                    .forEach(m => this.add(m));
            });
            this.addContext(this.rawMatch.results);
        }
    }
    bindModel(model) {
        this._model = model;
        this._modelListener = this._model.onDidChangeContent(() => {
            this._updateScheduler.schedule();
        });
        this._model.onWillDispose(() => this.onModelWillDispose());
        this.updateHighlights();
    }
    onModelWillDispose() {
        // Update matches because model might have some dirty changes
        this.updateMatchesForModel();
        this.unbindModel();
    }
    unbindModel() {
        if (this._model) {
            this._updateScheduler.cancel();
            this._model.changeDecorations((accessor) => {
                this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, []);
            });
            this._model = null;
            this._modelListener.dispose();
        }
    }
    updateMatchesForModel() {
        // this is called from a timeout and might fire
        // after the model has been disposed
        if (!this._model) {
            return;
        }
        this._matches = new Map();
        const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
        const matches = this._model
            .findMatches(this._query.pattern, this._model.getFullModelRange(), !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators, false, this._maxResults ?? Number.MAX_SAFE_INTEGER);
        this.updateMatches(matches, true);
    }
    updatesMatchesForLineAfterReplace(lineNumber, modelChange) {
        if (!this._model) {
            return;
        }
        const range = {
            startLineNumber: lineNumber,
            startColumn: this._model.getLineMinColumn(lineNumber),
            endLineNumber: lineNumber,
            endColumn: this._model.getLineMaxColumn(lineNumber)
        };
        const oldMatches = Array.from(this._matches.values()).filter(match => match.range().startLineNumber === lineNumber);
        oldMatches.forEach(match => this._matches.delete(match.id()));
        const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
        const matches = this._model.findMatches(this._query.pattern, range, !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators, false, this._maxResults ?? Number.MAX_SAFE_INTEGER);
        this.updateMatches(matches, modelChange);
    }
    updateMatches(matches, modelChange) {
        if (!this._model) {
            return;
        }
        const textSearchResults = editorMatchesToTextSearchResults(matches, this._model, this._previewOptions);
        textSearchResults.forEach(textSearchResult => {
            textSearchResultToMatches(textSearchResult, this).forEach(match => {
                if (!this._removedMatches.has(match.id())) {
                    this.add(match);
                    if (this.isMatchSelected(match)) {
                        this._selectedMatch = match;
                    }
                }
            });
        });
        this.addContext(addContextToEditorMatches(textSearchResults, this._model, this.parent().parent().query)
            .filter((result => !resultIsMatch(result)))
            .map(context => ({ ...context, lineNumber: context.lineNumber + 1 })));
        this._onChange.fire({ forceUpdateModel: modelChange });
        this.updateHighlights();
    }
    updateHighlights() {
        if (!this._model) {
            return;
        }
        this._model.changeDecorations((accessor) => {
            const newDecorations = (this.parent().showHighlights
                ? this.matches().map(match => ({
                    range: match.range(),
                    options: FileMatch.getDecorationOption(this.isMatchSelected(match))
                }))
                : []);
            this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, newDecorations);
        });
    }
    id() {
        return this.resource.toString();
    }
    parent() {
        return this._parent;
    }
    matches() {
        return Array.from(this._matches.values());
    }
    remove(matches) {
        if (!Array.isArray(matches)) {
            matches = [matches];
        }
        for (const match of matches) {
            this.removeMatch(match);
            this._removedMatches.add(match.id());
        }
        this._onChange.fire({ didRemove: true });
    }
    replaceQ = Promise.resolve();
    async replace(toReplace) {
        return this.replaceQ = this.replaceQ.finally(async () => {
            await this.replaceService.replace(toReplace);
            this.updatesMatchesForLineAfterReplace(toReplace.range().startLineNumber, false);
        });
    }
    setSelectedMatch(match) {
        if (match) {
            if (!this._matches.has(match.id())) {
                return;
            }
            if (this.isMatchSelected(match)) {
                return;
            }
        }
        this._selectedMatch = match;
        this.updateHighlights();
    }
    getSelectedMatch() {
        return this._selectedMatch;
    }
    isMatchSelected(match) {
        return !!this._selectedMatch && this._selectedMatch.id() === match.id();
    }
    count() {
        return this.matches().length;
    }
    get resource() {
        return this._resource;
    }
    name() {
        return this._name.getValue();
    }
    addContext(results) {
        if (!results) {
            return;
        }
        results
            .filter((result => !resultIsMatch(result)))
            .forEach(context => this._context.set(context.lineNumber, context.text));
    }
    add(match, trigger) {
        this._matches.set(match.id(), match);
        if (trigger) {
            this._onChange.fire({ forceUpdateModel: true });
        }
    }
    removeMatch(match) {
        this._matches.delete(match.id());
        if (this.isMatchSelected(match)) {
            this.setSelectedMatch(null);
        }
        else {
            this.updateHighlights();
        }
    }
    async resolveFileStat(fileService) {
        this._fileStat = await fileService.stat(this.resource).catch(() => undefined);
    }
    get fileStat() {
        return this._fileStat;
    }
    set fileStat(stat) {
        this._fileStat = stat;
    }
    dispose() {
        this.setSelectedMatch(null);
        this.unbindModel();
        this._onDispose.fire();
        super.dispose();
    }
};
FileMatch = __decorate([
    __param(6, IModelService),
    __param(7, IReplaceService),
    __param(8, ILabelService)
], FileMatch);
export { FileMatch };
let FolderMatch = class FolderMatch extends Disposable {
    _resource;
    _id;
    _index;
    _query;
    _parent;
    _searchModel;
    _closestRoot;
    replaceService;
    instantiationService;
    labelService;
    uriIdentityService;
    _onChange = this._register(new Emitter());
    onChange = this._onChange.event;
    _onDispose = this._register(new Emitter());
    onDispose = this._onDispose.event;
    _fileMatches;
    _folderMatches;
    _folderMatchesMap;
    _unDisposedFileMatches;
    _unDisposedFolderMatches;
    _replacingAll = false;
    _name;
    // if this is compressed in a node with other FolderMatches, then this is set to the parent where compression starts
    compressionStartParent;
    constructor(_resource, _id, _index, _query, _parent, _searchModel, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
        super();
        this._resource = _resource;
        this._id = _id;
        this._index = _index;
        this._query = _query;
        this._parent = _parent;
        this._searchModel = _searchModel;
        this._closestRoot = _closestRoot;
        this.replaceService = replaceService;
        this.instantiationService = instantiationService;
        this.labelService = labelService;
        this.uriIdentityService = uriIdentityService;
        this._fileMatches = new ResourceMap();
        this._folderMatches = new ResourceMap();
        this._folderMatchesMap = TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
        this._unDisposedFileMatches = new ResourceMap();
        this._unDisposedFolderMatches = new ResourceMap();
        this._name = new Lazy(() => this.resource ? labelService.getUriBasenameLabel(this.resource) : '');
    }
    get searchModel() {
        return this._searchModel;
    }
    get showHighlights() {
        return this._parent.showHighlights;
    }
    get closestRoot() {
        return this._closestRoot;
    }
    set replacingAll(b) {
        this._replacingAll = b;
    }
    id() {
        return this._id;
    }
    get resource() {
        return this._resource;
    }
    index() {
        return this._index;
    }
    name() {
        return this._name.getValue();
    }
    parent() {
        return this._parent;
    }
    bindModel(model) {
        const fileMatch = this._fileMatches.get(model.uri);
        if (fileMatch) {
            fileMatch.bindModel(model);
        }
        else {
            const folderMatch = this.getFolderMatch(model.uri);
            const match = folderMatch?.getDownstreamFileMatch(model.uri);
            match?.bindModel(model);
        }
    }
    createIntermediateFolderMatch(resource, id, index, query, baseWorkspaceFolder) {
        const folderMatch = this.instantiationService.createInstance(FolderMatchWithResource, resource, id, index, query, this, this._searchModel, baseWorkspaceFolder);
        this.configureIntermediateMatch(folderMatch);
        this.doAddFolder(folderMatch);
        return folderMatch;
    }
    configureIntermediateMatch(folderMatch) {
        const disposable = folderMatch.onChange((event) => this.onFolderChange(folderMatch, event));
        folderMatch.onDispose(() => disposable.dispose());
    }
    clear(clearingAll = false) {
        const changed = this.allDownstreamFileMatches();
        this.disposeMatches();
        this._onChange.fire({ elements: changed, removed: true, added: false, clearingAll });
    }
    remove(matches) {
        if (!Array.isArray(matches)) {
            matches = [matches];
        }
        const allMatches = getFileMatches(matches);
        this.doRemoveFile(allMatches);
    }
    replace(match) {
        return this.replaceService.replace([match]).then(() => {
            this.doRemoveFile([match]);
        });
    }
    replaceAll() {
        const matches = this.matches();
        return this.batchReplace(matches);
    }
    matches() {
        return [...this.fileMatchesIterator(), ...this.folderMatchesIterator()];
    }
    fileMatchesIterator() {
        return this._fileMatches.values();
    }
    folderMatchesIterator() {
        return this._folderMatches.values();
    }
    isEmpty() {
        return (this.fileCount() + this.folderCount()) === 0;
    }
    getDownstreamFileMatch(uri) {
        const directChildFileMatch = this._fileMatches.get(uri);
        if (directChildFileMatch) {
            return directChildFileMatch;
        }
        const folderMatch = this.getFolderMatch(uri);
        const match = folderMatch?.getDownstreamFileMatch(uri);
        if (match) {
            return match;
        }
        return null;
    }
    allDownstreamFileMatches() {
        let recursiveChildren = [];
        const iterator = this.folderMatchesIterator();
        for (const elem of iterator) {
            recursiveChildren = recursiveChildren.concat(elem.allDownstreamFileMatches());
        }
        return [...this.fileMatchesIterator(), ...recursiveChildren];
    }
    fileCount() {
        return this._fileMatches.size;
    }
    folderCount() {
        return this._folderMatches.size;
    }
    count() {
        return this.fileCount() + this.folderCount();
    }
    recursiveFileCount() {
        return this.allDownstreamFileMatches().length;
    }
    recursiveMatchCount() {
        return this.allDownstreamFileMatches().reduce((prev, match) => prev + match.count(), 0);
    }
    get query() {
        return this._query;
    }
    addFileMatch(raw, silent) {
        // when adding a fileMatch that has intermediate directories
        const added = [];
        const updated = [];
        raw.forEach(rawFileMatch => {
            const existingFileMatch = this.getDownstreamFileMatch(rawFileMatch.resource);
            if (existingFileMatch) {
                rawFileMatch
                    .results
                    .filter(resultIsMatch)
                    .forEach(m => {
                    textSearchResultToMatches(m, existingFileMatch)
                        .forEach(m => existingFileMatch.add(m));
                });
                updated.push(existingFileMatch);
                existingFileMatch.addContext(rawFileMatch.results);
            }
            else {
                if (this instanceof FolderMatchWorkspaceRoot || this instanceof FolderMatchNoRoot) {
                    const fileMatch = this.createAndConfigureFileMatch(rawFileMatch);
                    added.push(fileMatch);
                }
            }
        });
        const elements = [...added, ...updated];
        if (!silent && elements.length) {
            this._onChange.fire({ elements, added: !!added.length });
        }
    }
    doAddFile(fileMatch) {
        this._fileMatches.set(fileMatch.resource, fileMatch);
        if (this._unDisposedFileMatches.has(fileMatch.resource)) {
            this._unDisposedFileMatches.delete(fileMatch.resource);
        }
    }
    uriHasParent(parent, child) {
        return this.uriIdentityService.extUri.isEqualOrParent(child, parent) && !this.uriIdentityService.extUri.isEqual(child, parent);
    }
    isInParentChain(folderMatch) {
        let matchItem = this;
        while (matchItem instanceof FolderMatch) {
            if (matchItem.id() === folderMatch.id()) {
                return true;
            }
            matchItem = matchItem.parent();
        }
        return false;
    }
    getFolderMatch(resource) {
        const folderMatch = this._folderMatchesMap.findSubstr(resource);
        return folderMatch;
    }
    doAddFolder(folderMatch) {
        if (this instanceof FolderMatchWithResource && !this.uriHasParent(this.resource, folderMatch.resource)) {
            throw Error(`${folderMatch.resource} does not belong as a child of ${this.resource}`);
        }
        else if (this.isInParentChain(folderMatch)) {
            throw Error(`${folderMatch.resource} is a parent of ${this.resource}`);
        }
        this._folderMatches.set(folderMatch.resource, folderMatch);
        this._folderMatchesMap.set(folderMatch.resource, folderMatch);
        if (this._unDisposedFolderMatches.has(folderMatch.resource)) {
            this._unDisposedFolderMatches.delete(folderMatch.resource);
        }
    }
    async batchReplace(matches) {
        const allMatches = getFileMatches(matches);
        await this.replaceService.replace(allMatches);
        this.doRemoveFile(allMatches, true, true);
    }
    onFileChange(fileMatch, removed = false) {
        let added = false;
        if (!this._fileMatches.has(fileMatch.resource)) {
            this.doAddFile(fileMatch);
            added = true;
        }
        if (fileMatch.count() === 0) {
            this.doRemoveFile([fileMatch], false, false);
            added = false;
            removed = true;
        }
        if (!this._replacingAll) {
            this._onChange.fire({ elements: [fileMatch], added: added, removed: removed });
        }
    }
    onFolderChange(folderMatch, event) {
        if (!this._folderMatches.has(folderMatch.resource)) {
            this.doAddFolder(folderMatch);
        }
        if (folderMatch.isEmpty()) {
            this._folderMatches.delete(folderMatch.resource);
            folderMatch.dispose();
        }
        this._onChange.fire(event);
    }
    doRemoveFile(fileMatches, dispose = true, trigger = true) {
        const removed = [];
        for (const match of fileMatches) {
            if (this._fileMatches.get(match.resource)) {
                this._fileMatches.delete(match.resource);
                if (dispose) {
                    match.dispose();
                }
                else {
                    this._unDisposedFileMatches.set(match.resource, match);
                }
                removed.push(match);
            }
            else {
                const folder = this.getFolderMatch(match.resource);
                if (folder) {
                    folder.doRemoveFile([match], dispose, trigger);
                }
                else {
                    throw Error(`FileMatch ${match.resource} is not located within FolderMatch ${this.resource}`);
                }
            }
        }
        if (trigger) {
            this._onChange.fire({ elements: removed, removed: true });
        }
    }
    disposeMatches() {
        [...this._fileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
        [...this._folderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
        [...this._unDisposedFileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
        [...this._unDisposedFolderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
        this._fileMatches.clear();
        this._folderMatches.clear();
        this._unDisposedFileMatches.clear();
        this._unDisposedFolderMatches.clear();
    }
    dispose() {
        this.disposeMatches();
        this._onDispose.fire();
        super.dispose();
    }
};
FolderMatch = __decorate([
    __param(7, IReplaceService),
    __param(8, IInstantiationService),
    __param(9, ILabelService),
    __param(10, IUriIdentityService)
], FolderMatch);
export { FolderMatch };
let FolderMatchWithResource = class FolderMatchWithResource extends FolderMatch {
    constructor(_resource, _id, _index, _query, _parent, _searchModel, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
        super(_resource, _id, _index, _query, _parent, _searchModel, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService);
    }
    get resource() {
        return this._resource;
    }
};
FolderMatchWithResource = __decorate([
    __param(7, IReplaceService),
    __param(8, IInstantiationService),
    __param(9, ILabelService),
    __param(10, IUriIdentityService)
], FolderMatchWithResource);
export { FolderMatchWithResource };
/**
 * FolderMatchWorkspaceRoot => folder for workspace root
 */
let FolderMatchWorkspaceRoot = class FolderMatchWorkspaceRoot extends FolderMatchWithResource {
    constructor(_resource, _id, _index, _query, _parent, _searchModel, replaceService, instantiationService, labelService, uriIdentityService) {
        super(_resource, _id, _index, _query, _parent, _searchModel, null, replaceService, instantiationService, labelService, uriIdentityService);
    }
    normalizedUriParent(uri) {
        return this.uriIdentityService.extUri.normalizePath(this.uriIdentityService.extUri.dirname(uri));
    }
    uriEquals(uri1, ur2) {
        return this.uriIdentityService.extUri.isEqual(uri1, ur2);
    }
    createFileMatch(query, previewOptions, maxResults, parent, rawFileMatch, closestRoot) {
        const fileMatch = this.instantiationService.createInstance(FileMatch, query, previewOptions, maxResults, parent, rawFileMatch, closestRoot);
        parent.doAddFile(fileMatch);
        const disposable = fileMatch.onChange(({ didRemove }) => parent.onFileChange(fileMatch, didRemove));
        fileMatch.onDispose(() => disposable.dispose());
        return fileMatch;
    }
    createAndConfigureFileMatch(rawFileMatch) {
        if (!this.uriHasParent(this.resource, rawFileMatch.resource)) {
            throw Error(`${rawFileMatch.resource} is not a descendant of ${this.resource}`);
        }
        const fileMatchParentParts = [];
        const normalizedResource = this.uriIdentityService.extUri.normalizePath(this.resource);
        let uri = this.normalizedUriParent(rawFileMatch.resource);
        while (!this.uriEquals(normalizedResource, uri)) {
            fileMatchParentParts.unshift(uri);
            const prevUri = uri;
            uri = this.normalizedUriParent(uri);
            if (this.uriEquals(prevUri, uri)) {
                throw Error(`${rawFileMatch.resource} is not correctly configured as a child of its ${normalizedResource}`);
            }
        }
        const root = this.closestRoot ?? this;
        let parent = this;
        for (let i = 0; i < fileMatchParentParts.length; i++) {
            let folderMatch = parent.getFolderMatch(fileMatchParentParts[i]);
            if (!folderMatch) {
                folderMatch = parent.createIntermediateFolderMatch(fileMatchParentParts[i], fileMatchParentParts[i].toString(), -1, this._query, root);
            }
            parent = folderMatch;
        }
        return this.createFileMatch(this._query.contentPattern, this._query.previewOptions, this._query.maxResults, parent, rawFileMatch, root);
    }
};
FolderMatchWorkspaceRoot = __decorate([
    __param(6, IReplaceService),
    __param(7, IInstantiationService),
    __param(8, ILabelService),
    __param(9, IUriIdentityService)
], FolderMatchWorkspaceRoot);
export { FolderMatchWorkspaceRoot };
/**
 * BaseFolderMatch => optional resource ("other files" node)
 * FolderMatch => required resource (normal folder node)
 */
let FolderMatchNoRoot = class FolderMatchNoRoot extends FolderMatch {
    constructor(_id, _index, _query, _parent, _searchModel, replaceService, instantiationService, labelService, uriIdentityService) {
        super(null, _id, _index, _query, _parent, _searchModel, null, replaceService, instantiationService, labelService, uriIdentityService);
    }
    createAndConfigureFileMatch(rawFileMatch) {
        const fileMatch = this.instantiationService.createInstance(FileMatch, this._query.contentPattern, this._query.previewOptions, this._query.maxResults, this, rawFileMatch, null);
        this.doAddFile(fileMatch);
        const disposable = fileMatch.onChange(({ didRemove }) => this.onFileChange(fileMatch, didRemove));
        fileMatch.onDispose(() => disposable.dispose());
        return fileMatch;
    }
};
FolderMatchNoRoot = __decorate([
    __param(5, IReplaceService),
    __param(6, IInstantiationService),
    __param(7, ILabelService),
    __param(8, IUriIdentityService)
], FolderMatchNoRoot);
export { FolderMatchNoRoot };
let elemAIndex = -1;
let elemBIndex = -1;
/**
 * Compares instances of the same match type. Different match types should not be siblings
 * and their sort order is undefined.
 */
export function searchMatchComparer(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
    if (elementA instanceof FileMatch && elementB instanceof FolderMatch) {
        return 1;
    }
    if (elementB instanceof FileMatch && elementA instanceof FolderMatch) {
        return -1;
    }
    if (elementA instanceof FolderMatch && elementB instanceof FolderMatch) {
        elemAIndex = elementA.index();
        elemBIndex = elementB.index();
        if (elemAIndex !== -1 && elemBIndex !== -1) {
            return elemAIndex - elemBIndex;
        }
        switch (sortOrder) {
            case "countDescending" /* SearchSortOrder.CountDescending */:
                return elementB.count() - elementA.count();
            case "countAscending" /* SearchSortOrder.CountAscending */:
                return elementA.count() - elementB.count();
            case "type" /* SearchSortOrder.Type */:
                return compareFileExtensions(elementA.name(), elementB.name());
            case "fileNames" /* SearchSortOrder.FileNames */:
                return compareFileNames(elementA.name(), elementB.name());
            // Fall through otherwise
            default:
                if (!elementA.resource || !elementB.resource) {
                    return 0;
                }
                return comparePaths(elementA.resource.fsPath, elementB.resource.fsPath) || compareFileNames(elementA.name(), elementB.name());
        }
    }
    if (elementA instanceof FileMatch && elementB instanceof FileMatch) {
        switch (sortOrder) {
            case "countDescending" /* SearchSortOrder.CountDescending */:
                return elementB.count() - elementA.count();
            case "countAscending" /* SearchSortOrder.CountAscending */:
                return elementA.count() - elementB.count();
            case "type" /* SearchSortOrder.Type */:
                return compareFileExtensions(elementA.name(), elementB.name());
            case "fileNames" /* SearchSortOrder.FileNames */:
                return compareFileNames(elementA.name(), elementB.name());
            case "modified" /* SearchSortOrder.Modified */: {
                const fileStatA = elementA.fileStat;
                const fileStatB = elementB.fileStat;
                if (fileStatA && fileStatB) {
                    return fileStatB.mtime - fileStatA.mtime;
                }
            }
            // Fall through otherwise
            default:
                return comparePaths(elementA.resource.fsPath, elementB.resource.fsPath) || compareFileNames(elementA.name(), elementB.name());
        }
    }
    if (elementA instanceof Match && elementB instanceof Match) {
        return Range.compareRangesUsingStarts(elementA.range(), elementB.range());
    }
    return 0;
}
export function searchComparer(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
    const elemAParents = createParentList(elementA);
    const elemBParents = createParentList(elementB);
    let i = elemAParents.length - 1;
    let j = elemBParents.length - 1;
    while (i >= 0 && j >= 0) {
        if (elemAParents[i].id() !== elemBParents[j].id()) {
            return searchMatchComparer(elemAParents[i], elemBParents[j], sortOrder);
        }
        i--;
        j--;
    }
    const elemAAtEnd = i === 0;
    const elemBAtEnd = j === 0;
    if (elemAAtEnd && !elemBAtEnd) {
        return 1;
    }
    else if (!elemAAtEnd && elemBAtEnd) {
        return -1;
    }
    return 0;
}
function createParentList(element) {
    const parentArray = [];
    let currElement = element;
    while (!(currElement instanceof SearchResult)) {
        parentArray.push(currElement);
        currElement = currElement.parent();
    }
    return parentArray;
}
let SearchResult = class SearchResult extends Disposable {
    _searchModel;
    replaceService;
    instantiationService;
    modelService;
    uriIdentityService;
    _onChange = this._register(new PauseableEmitter({
        merge: this.mergeEvents
    }));
    onChange = this._onChange.event;
    _folderMatches = [];
    _otherFilesMatch = null;
    _folderMatchesMap = TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
    _showHighlights = false;
    _query = null;
    _rangeHighlightDecorations;
    disposePastResults = () => { };
    _isDirty = false;
    constructor(_searchModel, replaceService, instantiationService, modelService, uriIdentityService) {
        super();
        this._searchModel = _searchModel;
        this.replaceService = replaceService;
        this.instantiationService = instantiationService;
        this.modelService = modelService;
        this.uriIdentityService = uriIdentityService;
        this._rangeHighlightDecorations = this.instantiationService.createInstance(RangeHighlightDecorations);
        this._register(this.modelService.onModelAdded(model => this.onModelAdded(model)));
        this._register(this.onChange(e => {
            if (e.removed) {
                this._isDirty = !this.isEmpty();
            }
        }));
    }
    async batchReplace(elementsToReplace) {
        try {
            this._onChange.pause();
            await Promise.all(elementsToReplace.map(async (elem) => {
                const parent = elem.parent();
                if ((parent instanceof FolderMatch || parent instanceof FileMatch) && arrayContainsElementOrParent(parent, elementsToReplace)) {
                    // skip any children who have parents in the array
                    return;
                }
                if (elem instanceof FileMatch) {
                    await elem.parent().replace(elem);
                }
                else if (elem instanceof Match) {
                    await elem.parent().replace(elem);
                }
                else if (elem instanceof FolderMatch) {
                    await elem.replaceAll();
                }
            }));
        }
        finally {
            this._onChange.resume();
        }
    }
    batchRemove(elementsToRemove) {
        try {
            this._onChange.pause();
            elementsToRemove.forEach((currentElement) => currentElement.parent().remove(currentElement));
        }
        finally {
            this._onChange.resume();
        }
    }
    get isDirty() {
        return this._isDirty;
    }
    get query() {
        return this._query;
    }
    set query(query) {
        // When updating the query we could change the roots, so keep a reference to them to clean up when we trigger `disposePastResults`
        const oldFolderMatches = this.folderMatches();
        new Promise(resolve => this.disposePastResults = resolve)
            .then(() => oldFolderMatches.forEach(match => match.clear()))
            .then(() => oldFolderMatches.forEach(match => match.dispose()))
            .then(() => this._isDirty = false);
        this._rangeHighlightDecorations.removeHighlightRange();
        this._folderMatchesMap = TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
        if (!query) {
            return;
        }
        this._folderMatches = (query && query.folderQueries || [])
            .map(fq => fq.folder)
            .map((resource, index) => this._createBaseFolderMatch(resource, resource.toString(), index, query));
        this._folderMatches.forEach(fm => this._folderMatchesMap.set(fm.resource, fm));
        this._otherFilesMatch = this._createBaseFolderMatch(null, 'otherFiles', this._folderMatches.length + 1, query);
        this._query = query;
    }
    mergeEvents(events) {
        const retEvent = {
            elements: [],
            added: false,
            removed: false,
        };
        events.forEach((e) => {
            if (e.added) {
                retEvent.added = true;
            }
            if (e.removed) {
                retEvent.removed = true;
            }
            retEvent.elements = retEvent.elements.concat(e.elements);
        });
        return retEvent;
    }
    onModelAdded(model) {
        const folderMatch = this._folderMatchesMap.findSubstr(model.uri);
        folderMatch?.bindModel(model);
    }
    _createBaseFolderMatch(resource, id, index, query) {
        let folderMatch;
        if (resource) {
            folderMatch = this.instantiationService.createInstance(FolderMatchWorkspaceRoot, resource, id, index, query, this, this._searchModel);
        }
        else {
            folderMatch = this.instantiationService.createInstance(FolderMatchNoRoot, id, index, query, this, this._searchModel);
        }
        const disposable = folderMatch.onChange((event) => this._onChange.fire(event));
        folderMatch.onDispose(() => disposable.dispose());
        return folderMatch;
    }
    get searchModel() {
        return this._searchModel;
    }
    add(allRaw, silent = false) {
        // Split up raw into a list per folder so we can do a batch add per folder.
        const { byFolder, other } = this.groupFilesByFolder(allRaw);
        byFolder.forEach(raw => {
            if (!raw.length) {
                return;
            }
            const folderMatch = this.getFolderMatch(raw[0].resource);
            folderMatch?.addFileMatch(raw, silent);
        });
        this._otherFilesMatch?.addFileMatch(other, silent);
        this.disposePastResults();
    }
    clear() {
        this.folderMatches().forEach((folderMatch) => folderMatch.clear(true));
        this.disposeMatches();
        this._folderMatches = [];
        this._otherFilesMatch = null;
    }
    remove(matches) {
        if (!Array.isArray(matches)) {
            matches = [matches];
        }
        matches.forEach(m => {
            if (m instanceof FolderMatch) {
                m.clear();
            }
        });
        const fileMatches = matches.filter(m => m instanceof FileMatch);
        const { byFolder, other } = this.groupFilesByFolder(fileMatches);
        byFolder.forEach(matches => {
            if (!matches.length) {
                return;
            }
            this.getFolderMatch(matches[0].resource).remove(matches);
        });
        if (other.length) {
            this.getFolderMatch(other[0].resource).remove(other);
        }
    }
    replace(match) {
        return this.getFolderMatch(match.resource).replace(match);
    }
    replaceAll(progress) {
        this.replacingAll = true;
        const promise = this.replaceService.replace(this.matches(), progress);
        return promise.then(() => {
            this.replacingAll = false;
            this.clear();
        }, () => {
            this.replacingAll = false;
        });
    }
    folderMatches() {
        return this._otherFilesMatch ?
            [
                ...this._folderMatches,
                this._otherFilesMatch
            ] :
            [
                ...this._folderMatches
            ];
    }
    matches() {
        const matches = [];
        this.folderMatches().forEach(folderMatch => {
            matches.push(folderMatch.allDownstreamFileMatches());
        });
        return [].concat(...matches);
    }
    isEmpty() {
        return this.folderMatches().every((folderMatch) => folderMatch.isEmpty());
    }
    fileCount() {
        return this.folderMatches().reduce((prev, match) => prev + match.recursiveFileCount(), 0);
    }
    count() {
        return this.matches().reduce((prev, match) => prev + match.count(), 0);
    }
    get showHighlights() {
        return this._showHighlights;
    }
    toggleHighlights(value) {
        if (this._showHighlights === value) {
            return;
        }
        this._showHighlights = value;
        let selectedMatch = null;
        this.matches().forEach((fileMatch) => {
            fileMatch.updateHighlights();
            if (!selectedMatch) {
                selectedMatch = fileMatch.getSelectedMatch();
            }
        });
        if (this._showHighlights && selectedMatch) {
            // TS?
            this._rangeHighlightDecorations.highlightRange(selectedMatch.parent().resource, selectedMatch.range());
        }
        else {
            this._rangeHighlightDecorations.removeHighlightRange();
        }
    }
    get rangeHighlightDecorations() {
        return this._rangeHighlightDecorations;
    }
    getFolderMatch(resource) {
        const folderMatch = this._folderMatchesMap.findSubstr(resource);
        return folderMatch ? folderMatch : this._otherFilesMatch;
    }
    set replacingAll(running) {
        this.folderMatches().forEach((folderMatch) => {
            folderMatch.replacingAll = running;
        });
    }
    groupFilesByFolder(fileMatches) {
        const rawPerFolder = new ResourceMap();
        const otherFileMatches = [];
        this._folderMatches.forEach(fm => rawPerFolder.set(fm.resource, []));
        fileMatches.forEach(rawFileMatch => {
            const folderMatch = this.getFolderMatch(rawFileMatch.resource);
            if (!folderMatch) {
                // foldermatch was previously removed by user or disposed for some reason
                return;
            }
            const resource = folderMatch.resource;
            if (resource) {
                rawPerFolder.get(resource).push(rawFileMatch);
            }
            else {
                otherFileMatches.push(rawFileMatch);
            }
        });
        return {
            byFolder: rawPerFolder,
            other: otherFileMatches
        };
    }
    disposeMatches() {
        this.folderMatches().forEach(folderMatch => folderMatch.dispose());
        this._folderMatches = [];
        this._folderMatchesMap = TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
        this._rangeHighlightDecorations.removeHighlightRange();
    }
    dispose() {
        this.disposePastResults();
        this.disposeMatches();
        this._rangeHighlightDecorations.dispose();
        super.dispose();
    }
};
SearchResult = __decorate([
    __param(1, IReplaceService),
    __param(2, IInstantiationService),
    __param(3, IModelService),
    __param(4, IUriIdentityService)
], SearchResult);
export { SearchResult };
let SearchModel = class SearchModel extends Disposable {
    searchService;
    telemetryService;
    configurationService;
    instantiationService;
    _searchResult;
    _searchQuery = null;
    _replaceActive = false;
    _replaceString = null;
    _replacePattern = null;
    _preserveCase = false;
    _startStreamDelay = Promise.resolve();
    _resultQueue = [];
    _onReplaceTermChanged = this._register(new Emitter());
    onReplaceTermChanged = this._onReplaceTermChanged.event;
    currentCancelTokenSource = null;
    searchCancelledForNewSearch = false;
    constructor(searchService, telemetryService, configurationService, instantiationService) {
        super();
        this.searchService = searchService;
        this.telemetryService = telemetryService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this._searchResult = this.instantiationService.createInstance(SearchResult, this);
    }
    isReplaceActive() {
        return this._replaceActive;
    }
    set replaceActive(replaceActive) {
        this._replaceActive = replaceActive;
    }
    get replacePattern() {
        return this._replacePattern;
    }
    get replaceString() {
        return this._replaceString || '';
    }
    set preserveCase(value) {
        this._preserveCase = value;
    }
    get preserveCase() {
        return this._preserveCase;
    }
    set replaceString(replaceString) {
        this._replaceString = replaceString;
        if (this._searchQuery) {
            this._replacePattern = new ReplacePattern(replaceString, this._searchQuery.contentPattern);
        }
        this._onReplaceTermChanged.fire();
    }
    get searchResult() {
        return this._searchResult;
    }
    async search(query, onProgress) {
        this.cancelSearch(true);
        this._searchQuery = query;
        if (!this.searchConfig.searchOnType) {
            this.searchResult.clear();
        }
        this._searchResult.query = this._searchQuery;
        const progressEmitter = new Emitter();
        this._replacePattern = new ReplacePattern(this.replaceString, this._searchQuery.contentPattern);
        // In search on type case, delay the streaming of results just a bit, so that we don't flash the only "local results" fast path
        this._startStreamDelay = new Promise(resolve => setTimeout(resolve, this.searchConfig.searchOnType ? 150 : 0));
        const tokenSource = this.currentCancelTokenSource = new CancellationTokenSource();
        const currentRequest = this.searchService.textSearch(this._searchQuery, this.currentCancelTokenSource.token, p => {
            progressEmitter.fire();
            this.onSearchProgress(p);
            onProgress?.(p);
        });
        const dispose = () => tokenSource.dispose();
        currentRequest.then(dispose, dispose);
        const start = Date.now();
        Promise.race([currentRequest, Event.toPromise(progressEmitter.event)]).finally(() => {
            /* __GDPR__
                "searchResultsFirstRender" : {
                    "owner": "roblourens",
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                }
            */
            this.telemetryService.publicLog('searchResultsFirstRender', { duration: Date.now() - start });
        });
        currentRequest.then(value => this.onSearchCompleted(value, Date.now() - start), e => this.onSearchError(e, Date.now() - start));
        try {
            return await currentRequest;
        }
        finally {
            /* __GDPR__
                "searchResultsFinished" : {
                    "owner": "roblourens",
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                }
            */
            this.telemetryService.publicLog('searchResultsFinished', { duration: Date.now() - start });
        }
    }
    onSearchCompleted(completed, duration) {
        if (!this._searchQuery) {
            throw new Error('onSearchCompleted must be called after a search is started');
        }
        this._searchResult.add(this._resultQueue);
        this._resultQueue.length = 0;
        const options = Object.assign({}, this._searchQuery.contentPattern);
        delete options.pattern;
        const stats = completed && completed.stats;
        const fileSchemeOnly = this._searchQuery.folderQueries.every(fq => fq.folder.scheme === Schemas.file);
        const otherSchemeOnly = this._searchQuery.folderQueries.every(fq => fq.folder.scheme !== Schemas.file);
        const scheme = fileSchemeOnly ? Schemas.file :
            otherSchemeOnly ? 'other' :
                'mixed';
        /* __GDPR__
            "searchResultsShown" : {
                "owner": "roblourens",
                "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "fileCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "options": { "${inline}": [ "${IPatternInfo}" ] },
                "duration": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "type" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "scheme" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "searchOnTypeEnabled" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        this.telemetryService.publicLog('searchResultsShown', {
            count: this._searchResult.count(),
            fileCount: this._searchResult.fileCount(),
            options,
            duration,
            type: stats && stats.type,
            scheme,
            searchOnTypeEnabled: this.searchConfig.searchOnType
        });
        return completed;
    }
    onSearchError(e, duration) {
        if (errors.isCancellationError(e)) {
            this.onSearchCompleted(this.searchCancelledForNewSearch
                ? { exit: 1 /* SearchCompletionExitCode.NewSearchStarted */, results: [], messages: [] }
                : null, duration);
            this.searchCancelledForNewSearch = false;
        }
    }
    async onSearchProgress(p) {
        if (p.resource) {
            this._resultQueue.push(p);
            await this._startStreamDelay;
            if (this._resultQueue.length) {
                this._searchResult.add(this._resultQueue, true);
                this._resultQueue.length = 0;
            }
        }
    }
    get searchConfig() {
        return this.configurationService.getValue('search');
    }
    cancelSearch(cancelledForNewSearch = false) {
        if (this.currentCancelTokenSource) {
            this.searchCancelledForNewSearch = cancelledForNewSearch;
            this.currentCancelTokenSource.cancel();
            return true;
        }
        return false;
    }
    dispose() {
        this.cancelSearch();
        this.searchResult.dispose();
        super.dispose();
    }
};
SearchModel = __decorate([
    __param(0, ISearchService),
    __param(1, ITelemetryService),
    __param(2, IConfigurationService),
    __param(3, IInstantiationService)
], SearchModel);
export { SearchModel };
let SearchWorkbenchService = class SearchWorkbenchService {
    instantiationService;
    _searchModel = null;
    constructor(instantiationService) {
        this.instantiationService = instantiationService;
    }
    get searchModel() {
        if (!this._searchModel) {
            this._searchModel = this.instantiationService.createInstance(SearchModel);
        }
        return this._searchModel;
    }
};
SearchWorkbenchService = __decorate([
    __param(0, IInstantiationService)
], SearchWorkbenchService);
export { SearchWorkbenchService };
export const ISearchWorkbenchService = createDecorator('searchWorkbenchService');
/**
 * Can add a range highlight decoration to a model.
 * It will automatically remove it when the model has its decorations changed.
 */
let RangeHighlightDecorations = class RangeHighlightDecorations {
    _modelService;
    _decorationId = null;
    _model = null;
    _modelDisposables = new DisposableStore();
    constructor(_modelService) {
        this._modelService = _modelService;
    }
    removeHighlightRange() {
        if (this._model && this._decorationId) {
            const decorationId = this._decorationId;
            this._model.changeDecorations((accessor) => {
                accessor.removeDecoration(decorationId);
            });
        }
        this._decorationId = null;
    }
    highlightRange(resource, range, ownerId = 0) {
        let model;
        if (URI.isUri(resource)) {
            model = this._modelService.getModel(resource);
        }
        else {
            model = resource;
        }
        if (model) {
            this.doHighlightRange(model, range);
        }
    }
    doHighlightRange(model, range) {
        this.removeHighlightRange();
        model.changeDecorations((accessor) => {
            this._decorationId = accessor.addDecoration(range, RangeHighlightDecorations._RANGE_HIGHLIGHT_DECORATION);
        });
        this.setModel(model);
    }
    setModel(model) {
        if (this._model !== model) {
            this.clearModelListeners();
            this._model = model;
            this._modelDisposables.add(this._model.onDidChangeDecorations((e) => {
                this.clearModelListeners();
                this.removeHighlightRange();
                this._model = null;
            }));
            this._modelDisposables.add(this._model.onWillDispose(() => {
                this.clearModelListeners();
                this.removeHighlightRange();
                this._model = null;
            }));
        }
    }
    clearModelListeners() {
        this._modelDisposables.clear();
    }
    dispose() {
        if (this._model) {
            this.removeHighlightRange();
            this._modelDisposables.dispose();
            this._model = null;
        }
    }
    static _RANGE_HIGHLIGHT_DECORATION = ModelDecorationOptions.register({
        description: 'search-range-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'rangeHighlight',
        isWholeLine: true
    });
};
RangeHighlightDecorations = __decorate([
    __param(0, IModelService)
], RangeHighlightDecorations);
export { RangeHighlightDecorations };
function textSearchResultToMatches(rawMatch, fileMatch) {
    const previewLines = rawMatch.preview.text.split('\n');
    if (Array.isArray(rawMatch.ranges)) {
        return rawMatch.ranges.map((r, i) => {
            const previewRange = rawMatch.preview.matches[i];
            return new Match(fileMatch, previewLines, previewRange, r);
        });
    }
    else {
        const previewRange = rawMatch.preview.matches;
        const match = new Match(fileMatch, previewLines, previewRange, rawMatch.ranges);
        return [match];
    }
}
export function arrayContainsElementOrParent(element, testArray) {
    do {
        if (testArray.includes(element)) {
            return true;
        }
    } while (!(element.parent() instanceof SearchResult) && (element = element.parent()));
    return false;
}
function getFileMatches(matches) {
    const folderMatches = [];
    const fileMatches = [];
    matches.forEach((e) => {
        if (e instanceof FileMatch) {
            fileMatches.push(e);
        }
        else {
            folderMatches.push(e);
        }
    });
    return fileMatches.concat(folderMatches.map(e => e.allDownstreamFileMatches()).flat());
}
