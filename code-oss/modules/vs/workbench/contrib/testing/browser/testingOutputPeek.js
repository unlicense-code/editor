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
import * as dom from 'vs/base/browser/dom';
import { renderStringAsPlaintext } from 'vs/base/browser/markdownRenderer';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { Sizing, SplitView } from 'vs/base/browser/ui/splitview/splitview';
import { Action, Separator } from 'vs/base/common/actions';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Codicon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Emitter, Event } from 'vs/base/common/event';
import { stripIcons } from 'vs/base/common/iconLabels';
import { Iterable } from 'vs/base/common/iterator';
import { Lazy } from 'vs/base/common/lazy';
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { clamp } from 'vs/base/common/numbers';
import { count } from 'vs/base/common/strings';
import { isCodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction2 } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { EmbeddedCodeEditorWidget, EmbeddedDiffEditorWidget } from 'vs/editor/browser/widget/embeddedCodeEditorWidget';
import { Range } from 'vs/editor/common/core/range';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { MarkdownRenderer } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { getOuterEditor, IPeekViewService, peekViewTitleForeground, peekViewTitleInfoForeground, PeekViewWidget } from 'vs/editor/contrib/peekView/browser/peekView';
import { localize } from 'vs/nls';
import { createAndFillInActionBarActions, MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuId, MenuItemAction } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchCompressibleObjectTree } from 'vs/platform/list/browser/listService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { flatTestItemDelimiter } from 'vs/workbench/contrib/testing/browser/explorerProjections/display';
import { getTestItemContextOverlay } from 'vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay';
import * as icons from 'vs/workbench/contrib/testing/browser/icons';
import { ITestingOutputTerminalService } from 'vs/workbench/contrib/testing/browser/testingOutputTerminalService';
import { testingPeekBorder, testingPeekHeaderBackground } from 'vs/workbench/contrib/testing/browser/theme';
import { getTestingConfiguration } from 'vs/workbench/contrib/testing/common/configuration';
import { MutableObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { StoredValue } from 'vs/workbench/contrib/testing/common/storedValue';
import { ITestExplorerFilterState } from 'vs/workbench/contrib/testing/common/testExplorerFilterState';
import { TestingContextKeys } from 'vs/workbench/contrib/testing/common/testingContextKeys';
import { isFailedState } from 'vs/workbench/contrib/testing/common/testingStates';
import { buildTestUri, parseTestUri } from 'vs/workbench/contrib/testing/common/testingUri';
import { ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { maxCountPriority, resultItemParents } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import 'vs/css!./testingOutputPeek';
class TestDto {
    resultId;
    taskIndex;
    messageIndex;
    test;
    messages;
    expectedUri;
    actualUri;
    messageUri;
    revealLocation;
    get isDiffable() {
        const message = this.messages[this.messageIndex];
        return message.type === 0 /* TestMessageType.Error */ && isDiffable(message);
    }
    constructor(resultId, test, taskIndex, messageIndex) {
        this.resultId = resultId;
        this.taskIndex = taskIndex;
        this.messageIndex = messageIndex;
        this.test = test.item;
        this.messages = test.tasks[taskIndex].messages;
        this.messageIndex = messageIndex;
        const parts = { messageIndex, resultId, taskIndex, testExtId: test.item.extId };
        this.expectedUri = buildTestUri({ ...parts, type: 2 /* TestUriType.ResultExpectedOutput */ });
        this.actualUri = buildTestUri({ ...parts, type: 1 /* TestUriType.ResultActualOutput */ });
        this.messageUri = buildTestUri({ ...parts, type: 0 /* TestUriType.ResultMessage */ });
        const message = this.messages[this.messageIndex];
        this.revealLocation = message.location ?? (test.item.uri && test.item.range ? { uri: test.item.uri, range: Range.lift(test.item.range) } : undefined);
    }
}
/** Iterates through every message in every result */
function* allMessages(results) {
    for (const result of results) {
        for (const test of result.tests) {
            for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
                for (let messageIndex = 0; messageIndex < test.tasks[taskIndex].messages.length; messageIndex++) {
                    yield { result, test, taskIndex, messageIndex };
                }
            }
        }
    }
}
let TestingPeekOpener = class TestingPeekOpener extends Disposable {
    configuration;
    editorService;
    codeEditorService;
    testResults;
    testService;
    lastUri;
    constructor(configuration, editorService, codeEditorService, testResults, testService) {
        super();
        this.configuration = configuration;
        this.editorService = editorService;
        this.codeEditorService = codeEditorService;
        this.testResults = testResults;
        this.testService = testService;
        this._register(testResults.onTestChanged(this.openPeekOnFailure, this));
    }
    /** @inheritdoc */
    async open() {
        let uri;
        const active = this.editorService.activeTextEditorControl;
        if (isCodeEditor(active) && active.getModel()?.uri) {
            const modelUri = active.getModel()?.uri;
            if (modelUri) {
                uri = await this.getFileCandidateMessage(modelUri, active.getPosition());
            }
        }
        if (!uri) {
            uri = this.lastUri;
        }
        if (!uri) {
            uri = this.getAnyCandidateMessage();
        }
        if (!uri) {
            return false;
        }
        return this.showPeekFromUri(uri);
    }
    /** @inheritdoc */
    tryPeekFirstError(result, test, options) {
        const candidate = this.getFailedCandidateMessage(test);
        if (!candidate) {
            return false;
        }
        const message = candidate.message;
        this.showPeekFromUri({
            type: 0 /* TestUriType.ResultMessage */,
            documentUri: message.location.uri,
            taskIndex: candidate.taskId,
            messageIndex: candidate.index,
            resultId: result.id,
            testExtId: test.item.extId,
        }, { selection: message.location.range, ...options });
        return true;
    }
    /** @inheritdoc */
    peekUri(uri, options) {
        const parsed = parseTestUri(uri);
        const result = parsed && this.testResults.getResult(parsed.resultId);
        if (!parsed || !result) {
            return false;
        }
        const message = result.getStateById(parsed.testExtId)?.tasks[parsed.taskIndex].messages[parsed.messageIndex];
        if (!message?.location) {
            return false;
        }
        this.showPeekFromUri({
            type: 0 /* TestUriType.ResultMessage */,
            documentUri: message.location.uri,
            taskIndex: parsed.taskIndex,
            messageIndex: parsed.messageIndex,
            resultId: result.id,
            testExtId: parsed.testExtId,
        }, { selection: message.location.range, ...options });
        return true;
    }
    /** @inheritdoc */
    closeAllPeeks() {
        for (const editor of this.codeEditorService.listCodeEditors()) {
            TestingOutputPeekController.get(editor)?.removePeek();
        }
    }
    /** @inheritdoc */
    async showPeekFromUri(uri, options) {
        const pane = await this.editorService.openEditor({
            resource: uri.documentUri,
            options: { revealIfOpened: true, ...options }
        });
        const control = pane?.getControl();
        if (!isCodeEditor(control)) {
            return false;
        }
        this.lastUri = uri;
        TestingOutputPeekController.get(control)?.show(buildTestUri(this.lastUri));
        return true;
    }
    /**
     * Opens the peek view on a test failure, based on user preferences.
     */
    openPeekOnFailure(evt) {
        if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */) {
            return;
        }
        const candidate = this.getFailedCandidateMessage(evt.item);
        if (!candidate) {
            return;
        }
        if (evt.result.request.isAutoRun && !getTestingConfiguration(this.configuration, "testing.automaticallyOpenPeekViewDuringAutoRun" /* TestingConfigKeys.AutoOpenPeekViewDuringAutoRun */)) {
            return;
        }
        const editors = this.codeEditorService.listCodeEditors();
        const cfg = getTestingConfiguration(this.configuration, "testing.automaticallyOpenPeekView" /* TestingConfigKeys.AutoOpenPeekView */);
        // don't show the peek if the user asked to only auto-open peeks for visible tests,
        // and this test is not in any of the editors' models.
        switch (cfg) {
            case "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */: {
                const editorUris = new Set(editors.map(e => e.getModel()?.uri.toString()));
                if (!Iterable.some(resultItemParents(evt.result, evt.item), i => i.item.uri && editorUris.has(i.item.uri.toString()))) {
                    return;
                }
                break; //continue
            }
            case "failureAnywhere" /* AutoOpenPeekViewWhen.FailureAnywhere */:
                break; //continue
            default:
                return; // never show
        }
        const controllers = editors.map(TestingOutputPeekController.get);
        if (controllers.some(c => c?.isVisible)) {
            return;
        }
        this.tryPeekFirstError(evt.result, evt.item);
    }
    /**
     * Gets the message closest to the given position from a test in the file.
     */
    async getFileCandidateMessage(uri, position) {
        let best;
        let bestDistance = Infinity;
        // Get all tests for the document. In those, find one that has a test
        // message closest to the cursor position.
        const demandedUriStr = uri.toString();
        for (const test of this.testService.collection.all) {
            const result = this.testResults.getStateById(test.item.extId);
            if (!result) {
                continue;
            }
            mapFindTestMessage(result[1], (_task, message, messageIndex, taskIndex) => {
                if (!message.location || message.location.uri.toString() !== demandedUriStr) {
                    return;
                }
                const distance = position ? Math.abs(position.lineNumber - message.location.range.startLineNumber) : 0;
                if (!best || distance <= bestDistance) {
                    bestDistance = distance;
                    best = {
                        type: 0 /* TestUriType.ResultMessage */,
                        testExtId: result[1].item.extId,
                        resultId: result[0].id,
                        taskIndex,
                        messageIndex,
                        documentUri: uri,
                    };
                }
            });
        }
        return best;
    }
    /**
     * Gets any possible still-relevant message from the results.
     */
    getAnyCandidateMessage() {
        const seen = new Set();
        for (const result of this.testResults.results) {
            for (const test of result.tests) {
                if (seen.has(test.item.extId)) {
                    continue;
                }
                seen.add(test.item.extId);
                const found = mapFindTestMessage(test, (task, message, messageIndex, taskIndex) => (message.location && {
                    type: 0 /* TestUriType.ResultMessage */,
                    testExtId: test.item.extId,
                    resultId: result.id,
                    taskIndex,
                    messageIndex,
                    documentUri: message.location.uri,
                }));
                if (found) {
                    return found;
                }
            }
        }
        return undefined;
    }
    /**
     * Gets the first failed message that can be displayed from the result.
     */
    getFailedCandidateMessage(test) {
        let best;
        mapFindTestMessage(test, (task, message, messageIndex, taskId) => {
            if (!isFailedState(task.state) || !message.location) {
                return;
            }
            if (best && message.type !== 0 /* TestMessageType.Error */) {
                return;
            }
            best = { taskId, index: messageIndex, message };
        });
        return best;
    }
};
TestingPeekOpener = __decorate([
    __param(0, IConfigurationService),
    __param(1, IEditorService),
    __param(2, ICodeEditorService),
    __param(3, ITestResultService),
    __param(4, ITestService)
], TestingPeekOpener);
export { TestingPeekOpener };
const mapFindTestMessage = (test, fn) => {
    for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
        const task = test.tasks[taskIndex];
        for (let messageIndex = 0; messageIndex < task.messages.length; messageIndex++) {
            const r = fn(task, task.messages[messageIndex], messageIndex, taskIndex);
            if (r !== undefined) {
                return r;
            }
        }
    }
    return undefined;
};
/**
 * Adds output/message peek functionality to code editors.
 */
let TestingOutputPeekController = class TestingOutputPeekController extends Disposable {
    editor;
    editorService;
    codeEditorService;
    instantiationService;
    testResults;
    storageService;
    commandService;
    /**
     * Gets the controller associated with the given code editor.
     */
    static get(editor) {
        return editor.getContribution("editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */);
    }
    /**
     * Currently-shown peek view.
     */
    peek = this._register(new MutableDisposable());
    /**
     * URI of the currently-visible peek, if any.
     */
    currentPeekUri;
    /**
     * Context key updated when the peek is visible/hidden.
     */
    visible;
    /**
     * Gets whether a peek is currently shown in the associated editor.
     */
    get isVisible() {
        return this.peek.value;
    }
    /**
     * Whether the history part of the peek view should be visible.
     */
    historyVisible = MutableObservableValue.stored(new StoredValue({
        key: 'testHistoryVisibleInPeek',
        scope: 0 /* StorageScope.PROFILE */,
        target: 0 /* StorageTarget.USER */,
    }, this.storageService), true);
    constructor(editor, editorService, codeEditorService, instantiationService, testResults, storageService, contextKeyService, commandService) {
        super();
        this.editor = editor;
        this.editorService = editorService;
        this.codeEditorService = codeEditorService;
        this.instantiationService = instantiationService;
        this.testResults = testResults;
        this.storageService = storageService;
        this.commandService = commandService;
        this.visible = TestingContextKeys.isPeekVisible.bindTo(contextKeyService);
        this._register(editor.onDidChangeModel(() => this.peek.clear()));
        this._register(testResults.onResultsChanged(this.closePeekOnCertainResultEvents, this));
        this._register(testResults.onTestChanged(this.closePeekOnTestChange, this));
    }
    /**
     * Toggles peek visibility for the URI.
     */
    toggle(uri) {
        if (this.currentPeekUri?.toString() === uri.toString()) {
            this.peek.clear();
        }
        else {
            this.show(uri);
        }
    }
    openCurrentInEditor() {
        const current = this.peek.value?.current;
        if (!current) {
            return;
        }
        const options = { pinned: false, revealIfOpened: true };
        const message = current.messages[current.messageIndex];
        if (current.isDiffable) {
            this.editorService.openEditor({
                original: { resource: current.expectedUri },
                modified: { resource: current.actualUri },
                options,
            });
        }
        else if (typeof message.message === 'string') {
            this.editorService.openEditor({ resource: current.messageUri, options });
        }
        else {
            this.commandService.executeCommand('markdown.showPreview', current.messageUri);
        }
    }
    /**
     * Shows a peek for the message in the editor.
     */
    async show(uri) {
        const dto = this.retrieveTest(uri);
        if (!dto) {
            return;
        }
        const message = dto.messages[dto.messageIndex];
        if (!this.peek.value) {
            this.peek.value = this.instantiationService.createInstance(TestingOutputPeek, this.editor, this.historyVisible);
            this.peek.value.onDidClose(() => {
                this.visible.set(false);
                this.currentPeekUri = undefined;
                this.peek.value = undefined;
            });
            this.visible.set(true);
            this.peek.value.create();
        }
        alert(renderStringAsPlaintext(message.message));
        this.peek.value.setModel(dto);
        this.currentPeekUri = uri;
    }
    async openAndShow(uri) {
        const dto = this.retrieveTest(uri);
        if (!dto) {
            return;
        }
        if (!dto.revealLocation || dto.revealLocation.uri.toString() === this.editor.getModel()?.uri.toString()) {
            return this.show(uri);
        }
        const otherEditor = await this.codeEditorService.openCodeEditor({
            resource: dto.revealLocation.uri,
            options: { pinned: false, revealIfOpened: true }
        }, this.editor);
        if (otherEditor) {
            TestingOutputPeekController.get(otherEditor)?.removePeek();
            return TestingOutputPeekController.get(otherEditor)?.show(uri);
        }
    }
    /**
     * Disposes the peek view, if any.
     */
    removePeek() {
        this.peek.clear();
    }
    /**
     * Shows the next message in the peek, if possible.
     */
    next() {
        const dto = this.peek.value?.current;
        if (!dto) {
            return;
        }
        let found = false;
        for (const { messageIndex, taskIndex, result, test } of allMessages(this.testResults.results)) {
            if (found) {
                this.openAndShow(buildTestUri({
                    type: 0 /* TestUriType.ResultMessage */,
                    messageIndex,
                    taskIndex,
                    resultId: result.id,
                    testExtId: test.item.extId
                }));
                return;
            }
            else if (dto.test.extId === test.item.extId && dto.messageIndex === messageIndex && dto.taskIndex === taskIndex && dto.resultId === result.id) {
                found = true;
            }
        }
    }
    /**
     * Shows the previous message in the peek, if possible.
     */
    previous() {
        const dto = this.peek.value?.current;
        if (!dto) {
            return;
        }
        let previous;
        for (const m of allMessages(this.testResults.results)) {
            if (dto.test.extId === m.test.item.extId && dto.messageIndex === m.messageIndex && dto.taskIndex === m.taskIndex && dto.resultId === m.result.id) {
                if (!previous) {
                    return;
                }
                this.openAndShow(buildTestUri({
                    type: 0 /* TestUriType.ResultMessage */,
                    messageIndex: previous.messageIndex,
                    taskIndex: previous.taskIndex,
                    resultId: previous.result.id,
                    testExtId: previous.test.item.extId
                }));
                return;
            }
            previous = m;
        }
    }
    /**
     * Removes the peek view if it's being displayed on the given test ID.
     */
    removeIfPeekingForTest(testId) {
        if (this.peek.value?.current?.test.extId === testId) {
            this.peek.clear();
        }
    }
    /**
     * If the test we're currently showing has its state change to something
     * else, then clear the peek.
     */
    closePeekOnTestChange(evt) {
        if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */ || evt.previousState === evt.item.ownComputedState) {
            return;
        }
        this.removeIfPeekingForTest(evt.item.item.extId);
    }
    closePeekOnCertainResultEvents(evt) {
        if ('started' in evt) {
            this.peek.clear(); // close peek when runs start
        }
        if ('removed' in evt && this.testResults.results.length === 0) {
            this.peek.clear(); // close the peek if results are cleared
        }
    }
    retrieveTest(uri) {
        const parts = parseTestUri(uri);
        if (!parts) {
            return undefined;
        }
        const { resultId, testExtId, taskIndex, messageIndex } = parts;
        const test = this.testResults.getResult(parts.resultId)?.getStateById(testExtId);
        if (!test || !test.tasks[parts.taskIndex]) {
            return;
        }
        return new TestDto(resultId, test, taskIndex, messageIndex);
    }
};
TestingOutputPeekController = __decorate([
    __param(1, IEditorService),
    __param(2, ICodeEditorService),
    __param(3, IInstantiationService),
    __param(4, ITestResultService),
    __param(5, IStorageService),
    __param(6, IContextKeyService),
    __param(7, ICommandService)
], TestingOutputPeekController);
export { TestingOutputPeekController };
let TestingOutputPeek = class TestingOutputPeek extends PeekViewWidget {
    historyVisible;
    contextKeyService;
    menuService;
    modelService;
    static lastHeightInLines;
    static lastSplitWidth;
    visibilityChange = this._disposables.add(new Emitter());
    didReveal = this._disposables.add(new Emitter());
    dimension;
    splitView;
    contentProviders;
    current;
    constructor(editor, historyVisible, themeService, peekViewService, contextKeyService, menuService, instantiationService, modelService) {
        super(editor, { showFrame: true, frameWidth: 1, showArrow: true, isResizeable: true, isAccessible: true, className: 'test-output-peek' }, instantiationService);
        this.historyVisible = historyVisible;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.modelService = modelService;
        TestingContextKeys.isInPeek.bindTo(contextKeyService);
        this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme, this));
        this._disposables.add(this.onDidClose(() => this.visibilityChange.fire(false)));
        this.applyTheme(themeService.getColorTheme());
        peekViewService.addExclusiveWidget(editor, this);
    }
    applyTheme(theme) {
        const borderColor = theme.getColor(testingPeekBorder) || Color.transparent;
        const headerBg = theme.getColor(testingPeekHeaderBackground) || Color.transparent;
        this.style({
            arrowColor: borderColor,
            frameColor: borderColor,
            headerBackgroundColor: headerBg,
            primaryHeadingColor: theme.getColor(peekViewTitleForeground),
            secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
        });
    }
    _fillHead(container) {
        super._fillHead(container);
        const actions = [];
        const menu = this.menuService.createMenu(MenuId.TestPeekTitle, this.contextKeyService);
        createAndFillInActionBarActions(menu, undefined, actions);
        this._actionbarWidget.push(actions, { label: false, icon: true, index: 0 });
        menu.dispose();
    }
    _fillBody(containerElement) {
        const initialSpitWidth = TestingOutputPeek.lastSplitWidth;
        this.splitView = new SplitView(containerElement, { orientation: 1 /* Orientation.HORIZONTAL */ });
        const messageContainer = dom.append(containerElement, dom.$('.test-output-peek-message-container'));
        this.contentProviders = [
            this._disposables.add(this.instantiationService.createInstance(DiffContentProvider, this.editor, messageContainer)),
            this._disposables.add(this.instantiationService.createInstance(MarkdownTestMessagePeek, messageContainer)),
            this._disposables.add(this.instantiationService.createInstance(PlainTextMessagePeek, this.editor, messageContainer)),
        ];
        const treeContainer = dom.append(containerElement, dom.$('.test-output-peek-tree'));
        const tree = this._disposables.add(this.instantiationService.createInstance(OutputPeekTree, this.editor, treeContainer, this.visibilityChange.event, this.didReveal.event));
        this.splitView.addView({
            onDidChange: Event.None,
            element: messageContainer,
            minimumSize: 200,
            maximumSize: Number.MAX_VALUE,
            layout: width => {
                TestingOutputPeek.lastSplitWidth = width;
                if (this.dimension) {
                    for (const provider of this.contentProviders) {
                        provider.layout({ height: this.dimension.height, width });
                    }
                }
            },
        }, Sizing.Distribute);
        this.splitView.addView({
            onDidChange: Event.None,
            element: treeContainer,
            minimumSize: 100,
            maximumSize: Number.MAX_VALUE,
            layout: width => {
                if (this.dimension) {
                    tree.layout(this.dimension.height, width);
                }
            },
        }, Sizing.Distribute);
        const historyViewIndex = 1;
        this.splitView.setViewVisible(historyViewIndex, this.historyVisible.value);
        this._disposables.add(this.historyVisible.onDidChange(visible => {
            this.splitView.setViewVisible(historyViewIndex, visible);
        }));
        if (initialSpitWidth) {
            queueMicrotask(() => this.splitView.resizeView(0, initialSpitWidth));
        }
    }
    /**
     * Updates the test to be shown.
     */
    setModel(dto) {
        const message = dto.messages[dto.messageIndex];
        const previous = this.current;
        if (!dto.revealLocation && !previous) {
            return Promise.resolve();
        }
        this.current = dto;
        if (!dto.revealLocation) {
            return this.showInPlace(dto);
        }
        this.show(dto.revealLocation.range, TestingOutputPeek.lastHeightInLines || hintMessagePeekHeight(message));
        this.editor.revealPositionNearTop(dto.revealLocation.range.getStartPosition(), 0 /* ScrollType.Smooth */);
        return this.showInPlace(dto);
    }
    /**
     * Shows a message in-place without showing or changing the peek location.
     * This is mostly used if peeking a message without a location.
     */
    async showInPlace(dto) {
        const message = dto.messages[dto.messageIndex];
        this.setTitle(firstLine(renderStringAsPlaintext(message.message)), stripIcons(dto.test.label));
        this.didReveal.fire(dto);
        this.visibilityChange.fire(true);
        await Promise.all(this.contentProviders.map(p => p.update(dto, message)));
    }
    _relayout(newHeightInLines) {
        super._relayout(newHeightInLines);
        TestingOutputPeek.lastHeightInLines = newHeightInLines;
    }
    /** @override */
    _doLayoutBody(height, width) {
        super._doLayoutBody(height, width);
        this.dimension = new dom.Dimension(width, height);
        this.splitView.layout(width);
    }
    /** @override */
    _onWidth(width) {
        super._onWidth(width);
        if (this.dimension) {
            this.dimension = new dom.Dimension(width, this.dimension.height);
        }
        this.splitView.layout(width);
    }
};
TestingOutputPeek = __decorate([
    __param(2, IThemeService),
    __param(3, IPeekViewService),
    __param(4, IContextKeyService),
    __param(5, IMenuService),
    __param(6, IInstantiationService),
    __param(7, ITextModelService)
], TestingOutputPeek);
const commonEditorOptions = {
    scrollBeyondLastLine: false,
    links: true,
    scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: 'auto',
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: false
    },
    fixedOverflowWidgets: true,
    readOnly: true,
    minimap: {
        enabled: false
    },
    wordWrap: 'on',
};
const diffEditorOptions = {
    ...commonEditorOptions,
    enableSplitViewResizing: true,
    isInEmbeddedEditor: true,
    renderOverviewRuler: false,
    ignoreTrimWhitespace: false,
    renderSideBySide: true,
    originalAriaLabel: localize('testingOutputExpected', 'Expected result'),
    modifiedAriaLabel: localize('testingOutputActual', 'Actual result'),
    diffAlgorithm: 'smart',
};
const isDiffable = (message) => message.type === 0 /* TestMessageType.Error */ && message.actual !== undefined && message.expected !== undefined;
let DiffContentProvider = class DiffContentProvider extends Disposable {
    editor;
    container;
    instantiationService;
    modelService;
    widget = this._register(new MutableDisposable());
    model = this._register(new MutableDisposable());
    dimension;
    constructor(editor, container, instantiationService, modelService) {
        super();
        this.editor = editor;
        this.container = container;
        this.instantiationService = instantiationService;
        this.modelService = modelService;
    }
    async update({ expectedUri, actualUri }, message) {
        if (!isDiffable(message)) {
            return this.clear();
        }
        const [original, modified] = await Promise.all([
            this.modelService.createModelReference(expectedUri),
            this.modelService.createModelReference(actualUri),
        ]);
        const model = this.model.value = new SimpleDiffEditorModel(original, modified);
        if (!this.widget.value) {
            this.widget.value = this.instantiationService.createInstance(EmbeddedDiffEditorWidget, this.container, diffEditorOptions, this.editor);
            if (this.dimension) {
                this.widget.value.layout(this.dimension);
            }
        }
        this.widget.value.setModel(model);
        this.widget.value.updateOptions(this.getOptions(isMultiline(message.expected) || isMultiline(message.actual)));
    }
    clear() {
        this.model.clear();
        this.widget.clear();
    }
    layout(dimensions) {
        this.dimension = dimensions;
        this.widget.value?.layout(dimensions);
    }
    getOptions(isMultiline) {
        return isMultiline
            ? { ...diffEditorOptions, lineNumbers: 'on' }
            : { ...diffEditorOptions, lineNumbers: 'off' };
    }
};
DiffContentProvider = __decorate([
    __param(2, IInstantiationService),
    __param(3, ITextModelService)
], DiffContentProvider);
class ScrollableMarkdownMessage extends Disposable {
    scrollable;
    element;
    constructor(container, markdown, message) {
        super();
        const rendered = this._register(markdown.render(message, {}));
        rendered.element.style.height = '100%';
        rendered.element.style.userSelect = 'text';
        container.appendChild(rendered.element);
        this.element = rendered.element;
        this.scrollable = this._register(new DomScrollableElement(rendered.element, {
            className: 'preview-text',
        }));
        container.appendChild(this.scrollable.getDomNode());
        this._register(toDisposable(() => {
            container.removeChild(this.scrollable.getDomNode());
        }));
        this.scrollable.scanDomNode();
    }
    layout(height, width) {
        // Remove padding of `.monaco-editor .zone-widget.test-output-peek .preview-text`
        this.scrollable.setScrollDimensions({
            width: width - 32,
            height: height - 16,
            scrollWidth: this.element.scrollWidth,
            scrollHeight: this.element.scrollHeight
        });
    }
}
let MarkdownTestMessagePeek = class MarkdownTestMessagePeek extends Disposable {
    container;
    instantiationService;
    markdown = new Lazy(() => this._register(this.instantiationService.createInstance(MarkdownRenderer, {})));
    textPreview = this._register(new MutableDisposable());
    constructor(container, instantiationService) {
        super();
        this.container = container;
        this.instantiationService = instantiationService;
    }
    update(_dto, message) {
        if (isDiffable(message) || typeof message.message === 'string') {
            return this.textPreview.clear();
        }
        this.textPreview.value = new ScrollableMarkdownMessage(this.container, this.markdown.getValue(), message.message);
    }
    layout(dimension) {
        this.textPreview.value?.layout(dimension.height, dimension.width);
    }
};
MarkdownTestMessagePeek = __decorate([
    __param(1, IInstantiationService)
], MarkdownTestMessagePeek);
let PlainTextMessagePeek = class PlainTextMessagePeek extends Disposable {
    editor;
    container;
    instantiationService;
    modelService;
    widget = this._register(new MutableDisposable());
    model = this._register(new MutableDisposable());
    dimension;
    constructor(editor, container, instantiationService, modelService) {
        super();
        this.editor = editor;
        this.container = container;
        this.instantiationService = instantiationService;
        this.modelService = modelService;
    }
    async update({ messageUri }, message) {
        if (isDiffable(message) || typeof message.message !== 'string') {
            return this.clear();
        }
        const modelRef = this.model.value = await this.modelService.createModelReference(messageUri);
        if (!this.widget.value) {
            this.widget.value = this.instantiationService.createInstance(EmbeddedCodeEditorWidget, this.container, commonEditorOptions, this.editor);
            if (this.dimension) {
                this.widget.value.layout(this.dimension);
            }
        }
        this.widget.value.setModel(modelRef.object.textEditorModel);
        this.widget.value.updateOptions(this.getOptions(isMultiline(message.message)));
    }
    clear() {
        this.model.clear();
        this.widget.clear();
    }
    layout(dimensions) {
        this.dimension = dimensions;
        this.widget.value?.layout(dimensions);
    }
    getOptions(isMultiline) {
        return isMultiline
            ? { ...diffEditorOptions, lineNumbers: 'on' }
            : { ...diffEditorOptions, lineNumbers: 'off' };
    }
};
PlainTextMessagePeek = __decorate([
    __param(2, IInstantiationService),
    __param(3, ITextModelService)
], PlainTextMessagePeek);
const hintMessagePeekHeight = (msg) => isDiffable(msg)
    ? Math.max(hintPeekStrHeight(msg.actual), hintPeekStrHeight(msg.expected))
    : hintPeekStrHeight(typeof msg.message === 'string' ? msg.message : msg.message.value);
const firstLine = (str) => {
    const index = str.indexOf('\n');
    return index === -1 ? str : str.slice(0, index);
};
const isMultiline = (str) => !!str && str.includes('\n');
const hintPeekStrHeight = (str) => clamp(str ? Math.max(count(str, '\n'), Math.ceil(str.length / 80)) + 3 : 0, 14, 24);
class SimpleDiffEditorModel extends EditorModel {
    _original;
    _modified;
    original = this._original.object.textEditorModel;
    modified = this._modified.object.textEditorModel;
    constructor(_original, _modified) {
        super();
        this._original = _original;
        this._modified = _modified;
    }
    dispose() {
        super.dispose();
        this._original.dispose();
        this._modified.dispose();
    }
}
function getOuterEditorFromDiffEditor(accessor) {
    const diffEditors = accessor.get(ICodeEditorService).listDiffEditors();
    for (const diffEditor of diffEditors) {
        if (diffEditor.hasTextFocus() && diffEditor instanceof EmbeddedDiffEditorWidget) {
            return diffEditor.getParentEditor();
        }
    }
    return getOuterEditor(accessor);
}
export class CloseTestPeek extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.closeTestPeek',
            title: localize('close', 'Close'),
            icon: Codicon.close,
            precondition: ContextKeyExpr.or(TestingContextKeys.isInPeek, TestingContextKeys.isPeekVisible),
            keybinding: {
                weight: 100 /* KeybindingWeight.EditorContrib */ - 101,
                primary: 9 /* KeyCode.Escape */,
                when: ContextKeyExpr.not('config.editor.stablePeek')
            }
        });
    }
    runEditorCommand(accessor, editor) {
        const parent = getOuterEditorFromDiffEditor(accessor);
        TestingOutputPeekController.get(parent ?? editor)?.removePeek();
    }
}
export class TestResultElement {
    value;
    type = 'result';
    context = this.value.id;
    id = this.value.id;
    label = this.value.name;
    get icon() {
        return icons.testingStatesToIcons.get(this.value.completedAt === undefined
            ? 2 /* TestResultState.Running */
            : maxCountPriority(this.value.counts));
    }
    constructor(value) {
        this.value = value;
    }
}
export class TestCaseElement {
    results;
    test;
    type = 'test';
    context = this.test.item.extId;
    id = `${this.results.id}/${this.test.item.extId}`;
    label = this.test.item.label;
    labelWithIcons = renderLabelWithIcons(this.label);
    description;
    get icon() {
        return icons.testingStatesToIcons.get(this.test.computedState);
    }
    constructor(results, test) {
        this.results = results;
        this.test = test;
        for (const parent of resultItemParents(results, test)) {
            if (parent !== test) {
                this.description = this.description
                    ? parent.item.label + flatTestItemDelimiter + this.description
                    : parent.item.label;
            }
        }
    }
}
class TestTaskElement {
    test;
    type = 'task';
    task;
    context;
    id;
    label;
    icon = undefined;
    constructor(results, test, index) {
        this.test = test;
        this.id = `${results.id}/${test.item.extId}/${index}`;
        this.task = results.tasks[index];
        this.context = String(index);
        this.label = this.task.name ?? localize('testUnnamedTask', 'Unnamed Task');
    }
}
class TestMessageElement {
    result;
    test;
    taskIndex;
    messageIndex;
    type = 'message';
    context;
    id;
    label;
    uri;
    location;
    description;
    marker;
    constructor(result, test, taskIndex, messageIndex) {
        this.result = result;
        this.test = test;
        this.taskIndex = taskIndex;
        this.messageIndex = messageIndex;
        const m = test.tasks[taskIndex].messages[messageIndex];
        this.location = m.location;
        this.marker = m.type === 1 /* TestMessageType.Output */ ? m.marker : undefined;
        this.uri = this.context = buildTestUri({
            type: 0 /* TestUriType.ResultMessage */,
            messageIndex,
            resultId: result.id,
            taskIndex,
            testExtId: test.item.extId
        });
        this.id = this.uri.toString();
        const asPlaintext = renderStringAsPlaintext(m.message);
        const lines = count(asPlaintext.trimRight(), '\n');
        this.label = firstLine(asPlaintext);
        if (lines > 0) {
            this.description = lines > 1
                ? localize('messageMoreLinesN', '+ {0} more lines', lines)
                : localize('messageMoreLines1', '+ 1 more line');
        }
    }
}
let OutputPeekTree = class OutputPeekTree extends Disposable {
    contextMenuService;
    disposed = false;
    tree;
    treeActions;
    constructor(editor, container, onDidChangeVisibility, onDidReveal, peekController, contextMenuService, results, instantiationService, explorerFilter) {
        super();
        this.contextMenuService = contextMenuService;
        this.treeActions = instantiationService.createInstance(TreeActionsProvider);
        const diffIdentityProvider = {
            getId(e) {
                return e.id;
            }
        };
        this.tree = this._register(instantiationService.createInstance(WorkbenchCompressibleObjectTree, 'Test Output Peek', container, {
            getHeight: () => 22,
            getTemplateId: () => TestRunElementRenderer.ID,
        }, [instantiationService.createInstance(TestRunElementRenderer, this.treeActions)], {
            compressionEnabled: true,
            hideTwistiesOfChildlessElements: true,
            identityProvider: diffIdentityProvider,
            accessibilityProvider: {
                getAriaLabel(element) {
                    return element.ariaLabel || element.label;
                },
                getWidgetAriaLabel() {
                    return localize('testingPeekLabel', 'Test Result Messages');
                }
            }
        }));
        const creationCache = new WeakMap();
        const cachedCreate = (ref, factory) => {
            const existing = creationCache.get(ref);
            if (existing) {
                return existing;
            }
            const fresh = factory();
            creationCache.set(ref, fresh);
            return fresh;
        };
        const getTaskChildren = (result, test, taskId) => {
            return Iterable.map(test.tasks[0].messages, (m, messageIndex) => ({
                element: cachedCreate(m, () => new TestMessageElement(result, test, taskId, messageIndex)),
                incompressible: true,
            }));
        };
        const getTestChildren = (result, test) => {
            const tasks = Iterable.filter(test.tasks, task => task.messages.length > 0);
            return Iterable.map(tasks, (t, taskId) => ({
                element: cachedCreate(t, () => new TestTaskElement(result, test, taskId)),
                incompressible: false,
                children: getTaskChildren(result, test, taskId),
            }));
        };
        const getResultChildren = (result) => {
            const tests = Iterable.filter(result.tests, test => test.tasks.some(t => t.messages.length > 0));
            return Iterable.map(tests, test => ({
                element: cachedCreate(test, () => new TestCaseElement(result, test)),
                incompressible: true,
                children: getTestChildren(result, test),
            }));
        };
        const getRootChildren = () => results.results.map(result => {
            const element = cachedCreate(result, () => new TestResultElement(result));
            return {
                element,
                incompressible: true,
                collapsed: this.tree.hasElement(element) ? this.tree.isCollapsed(element) : true,
                children: getResultChildren(result)
            };
        });
        // Queued result updates to prevent spamming CPU when lots of tests are
        // completing and messaging quickly (#142514)
        const resultsToUpdate = new Set();
        const resultUpdateScheduler = this._register(new RunOnceScheduler(() => {
            for (const result of resultsToUpdate) {
                const resultNode = creationCache.get(result);
                if (resultNode && this.tree.hasElement(resultNode)) {
                    this.tree.setChildren(resultNode, getResultChildren(result), { diffIdentityProvider });
                }
            }
            resultsToUpdate.clear();
        }, 300));
        this._register(results.onTestChanged(e => {
            const itemNode = creationCache.get(e.item);
            if (itemNode && this.tree.hasElement(itemNode)) { // update to existing test message/state
                this.tree.setChildren(itemNode, getTestChildren(e.result, e.item));
                return;
            }
            const resultNode = creationCache.get(e.result);
            if (resultNode && this.tree.hasElement(resultNode)) { // new test, update result children
                if (!resultUpdateScheduler.isScheduled) {
                    resultsToUpdate.add(e.result);
                    resultUpdateScheduler.schedule();
                }
                return;
            }
            // should be unreachable?
            this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
        }));
        this._register(results.onResultsChanged(e => {
            // little hack here: a result change can cause the peek to be disposed,
            // but this listener will still be queued. Doing stuff with the tree
            // will cause errors.
            if (this.disposed) {
                return;
            }
            if ('completed' in e) {
                const resultNode = creationCache.get(e.completed);
                if (resultNode && this.tree.hasElement(resultNode)) {
                    this.tree.setChildren(resultNode, getResultChildren(e.completed));
                    return;
                }
            }
            this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
        }));
        this._register(onDidReveal(dto => {
            const messageNode = creationCache.get(dto.messages[dto.messageIndex]);
            if (!messageNode || !this.tree.hasElement(messageNode)) {
                return;
            }
            const parents = [];
            for (let parent = this.tree.getParentElement(messageNode); parent; parent = this.tree.getParentElement(parent)) {
                parents.unshift(parent);
            }
            for (const parent of parents) {
                this.tree.expand(parent);
            }
            if (this.tree.getRelativeTop(messageNode) === null) {
                this.tree.reveal(messageNode, 0.5);
            }
            this.tree.setFocus([messageNode]);
            this.tree.setSelection([messageNode]);
            this.tree.domFocus();
        }));
        this._register(this.tree.onDidOpen(async (e) => {
            if (!(e.element instanceof TestMessageElement)) {
                return;
            }
            const dto = new TestDto(e.element.result.id, e.element.test, e.element.taskIndex, e.element.messageIndex);
            if (!dto.revealLocation) {
                peekController.showInPlace(dto);
            }
            else {
                TestingOutputPeekController.get(editor)?.openAndShow(dto.messageUri);
            }
        }));
        this._register(this.tree.onDidChangeSelection(evt => {
            for (const element of evt.elements) {
                if (element && 'test' in element) {
                    explorerFilter.reveal.value = element.test.item.extId;
                    break;
                }
            }
        }));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this.tree.setChildren(null, getRootChildren());
    }
    layout(height, width) {
        this.tree.layout(height, width);
    }
    onContextMenu(evt) {
        if (!evt.element) {
            return;
        }
        const actions = this.treeActions.provideActionBar(evt.element);
        this.contextMenuService.showContextMenu({
            getAnchor: () => evt.anchor,
            getActions: () => actions.secondary.length
                ? [...actions.primary, new Separator(), ...actions.secondary]
                : actions.primary,
            getActionsContext: () => evt.element?.context
        });
    }
    dispose() {
        super.dispose();
        this.disposed = true;
    }
};
OutputPeekTree = __decorate([
    __param(5, IContextMenuService),
    __param(6, ITestResultService),
    __param(7, IInstantiationService),
    __param(8, ITestExplorerFilterState)
], OutputPeekTree);
let TestRunElementRenderer = class TestRunElementRenderer {
    treeActions;
    instantiationService;
    static ID = 'testRunElementRenderer';
    templateId = TestRunElementRenderer.ID;
    constructor(treeActions, instantiationService) {
        this.treeActions = treeActions;
        this.instantiationService = instantiationService;
    }
    /** @inheritdoc */
    renderCompressedElements(node, _index, templateData) {
        const chain = node.element.elements;
        const lastElement = chain[chain.length - 1];
        if (lastElement instanceof TestTaskElement && chain.length >= 2) {
            this.doRender(chain[chain.length - 2], templateData);
        }
        else {
            this.doRender(lastElement, templateData);
        }
    }
    /** @inheritdoc */
    renderTemplate(container) {
        const templateDisposable = new DisposableStore();
        const wrapper = dom.append(container, dom.$('.test-peek-item'));
        const icon = dom.append(wrapper, dom.$('.state'));
        const label = dom.append(wrapper, dom.$('.name'));
        const actionBar = new ActionBar(wrapper, {
            actionViewItemProvider: action => action instanceof MenuItemAction
                ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined)
                : undefined
        });
        templateDisposable.add(actionBar);
        return {
            icon,
            label,
            actionBar,
            elementDisposable: new DisposableStore(),
            templateDisposable,
        };
    }
    /** @inheritdoc */
    renderElement(element, _index, templateData) {
        this.doRender(element.element, templateData);
    }
    /** @inheritdoc */
    disposeTemplate(templateData) {
        templateData.templateDisposable.dispose();
    }
    doRender(element, templateData) {
        templateData.elementDisposable.clear();
        if (element.labelWithIcons) {
            dom.reset(templateData.label, ...element.labelWithIcons);
        }
        else if (element.description) {
            dom.reset(templateData.label, element.label, dom.$('span.test-label-description', {}, element.description));
        }
        else {
            dom.reset(templateData.label, element.label);
        }
        const icon = element.icon;
        templateData.icon.className = `computed-state ${icon ? ThemeIcon.asClassName(icon) : ''}`;
        const actions = this.treeActions.provideActionBar(element);
        templateData.actionBar.clear();
        templateData.actionBar.context = element;
        templateData.actionBar.push(actions.primary, { icon: true, label: false });
    }
};
TestRunElementRenderer = __decorate([
    __param(1, IInstantiationService)
], TestRunElementRenderer);
let TreeActionsProvider = class TreeActionsProvider {
    contextKeyService;
    testTerminalService;
    menuService;
    commandService;
    testProfileService;
    constructor(contextKeyService, testTerminalService, menuService, commandService, testProfileService) {
        this.contextKeyService = contextKeyService;
        this.testTerminalService = testTerminalService;
        this.menuService = menuService;
        this.commandService = commandService;
        this.testProfileService = testProfileService;
    }
    provideActionBar(element) {
        const test = element instanceof TestCaseElement ? element.test : undefined;
        const capabilities = test ? this.testProfileService.capabilitiesForTest(test) : 0;
        const contextOverlay = this.contextKeyService.createOverlay([
            ['peek', "editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */],
            [TestingContextKeys.peekItemType.key, element.type],
            ...getTestItemContextOverlay(test, capabilities),
        ]);
        const menu = this.menuService.createMenu(MenuId.TestPeekElement, contextOverlay);
        try {
            const primary = [];
            const secondary = [];
            if (element instanceof TestResultElement) {
                primary.push(new Action('testing.outputPeek.showResultOutput', localize('testing.showResultOutput', "Show Result Output"), Codicon.terminal.classNames, undefined, () => this.testTerminalService.open(element.value)));
                primary.push(new Action('testing.outputPeek.reRunLastRun', localize('testing.reRunLastRun', "Rerun Test Run"), ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('testing.reRunLastRun', element.value.id)));
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new Action('testing.outputPeek.debugLastRun', localize('testing.debugLastRun', "Debug Test Run"), ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('testing.debugLastRun', element.value.id)));
                }
            }
            if (element instanceof TestCaseElement || element instanceof TestTaskElement) {
                const extId = element.test.item.extId;
                primary.push(new Action('testing.outputPeek.goToFile', localize('testing.goToFile', "Go to File"), Codicon.goToFile.classNames, undefined, () => this.commandService.executeCommand('vscode.revealTest', extId)));
                secondary.push(new Action('testing.outputPeek.revealInExplorer', localize('testing.revealInExplorer', "Reveal in Test Explorer"), Codicon.listTree.classNames, undefined, () => this.commandService.executeCommand('_revealTestInExplorer', extId)));
                if (capabilities & 2 /* TestRunProfileBitset.Run */) {
                    primary.push(new Action('testing.outputPeek.runTest', localize('run test', 'Run Test'), ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 2 /* TestRunProfileBitset.Run */, extId)));
                }
                if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
                    primary.push(new Action('testing.outputPeek.debugTest', localize('debug test', 'Debug Test'), ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 4 /* TestRunProfileBitset.Debug */, extId)));
                }
            }
            if (element instanceof TestMessageElement) {
                if (element.marker !== undefined) {
                    primary.push(new Action('testing.outputPeek.showMessageInTerminal', localize('testing.showMessageInTerminal', "Show Output in Terminal"), Codicon.terminal.classNames, undefined, () => this.testTerminalService.open(element.result, element.marker)));
                }
            }
            const result = { primary, secondary };
            createAndFillInActionBarActions(menu, {
                shouldForwardArgs: true,
            }, result, 'inline');
            return result;
        }
        finally {
            menu.dispose();
        }
    }
};
TreeActionsProvider = __decorate([
    __param(0, IContextKeyService),
    __param(1, ITestingOutputTerminalService),
    __param(2, IMenuService),
    __param(3, ICommandService),
    __param(4, ITestProfileService)
], TreeActionsProvider);
const navWhen = ContextKeyExpr.and(EditorContextKeys.focus, TestingContextKeys.isPeekVisible);
/**
 * Gets the editor where the peek may be shown, bubbling upwards if the given
 * editor is embedded (i.e. inside a peek already).
 */
const getPeekedEditor = (accessor, editor) => {
    if (TestingOutputPeekController.get(editor)?.isVisible) {
        return editor;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
        return editor.getParentEditor();
    }
    const outer = getOuterEditorFromDiffEditor(accessor);
    if (outer) {
        return outer;
    }
    return editor;
};
export class GoToNextMessageAction extends EditorAction2 {
    static ID = 'testing.goToNextMessage';
    constructor() {
        super({
            id: GoToNextMessageAction.ID,
            f1: true,
            title: { value: localize('testing.goToNextMessage', "Go to Next Test Failure"), original: 'Go to Next Test Failure' },
            icon: Codicon.arrowDown,
            category: Categories.Test,
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                when: navWhen,
            },
            menu: [{
                    id: MenuId.TestPeekTitle,
                    group: 'navigation',
                    order: 2,
                }, {
                    id: MenuId.CommandPalette,
                    when: navWhen
                }],
        });
    }
    runEditorCommand(accessor, editor) {
        TestingOutputPeekController.get(getPeekedEditor(accessor, editor))?.next();
    }
}
export class GoToPreviousMessageAction extends EditorAction2 {
    static ID = 'testing.goToPreviousMessage';
    constructor() {
        super({
            id: GoToPreviousMessageAction.ID,
            f1: true,
            title: { value: localize('testing.goToPreviousMessage', "Go to Previous Test Failure"), original: 'Go to Previous Test Failure' },
            icon: Codicon.arrowUp,
            category: Categories.Test,
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 66 /* KeyCode.F8 */,
                weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                when: navWhen
            },
            menu: [{
                    id: MenuId.TestPeekTitle,
                    group: 'navigation',
                    order: 1,
                }, {
                    id: MenuId.CommandPalette,
                    when: navWhen
                }],
        });
    }
    runEditorCommand(accessor, editor) {
        TestingOutputPeekController.get(getPeekedEditor(accessor, editor))?.previous();
    }
}
export class OpenMessageInEditorAction extends EditorAction2 {
    static ID = 'testing.openMessageInEditor';
    constructor() {
        super({
            id: OpenMessageInEditorAction.ID,
            f1: false,
            title: { value: localize('testing.openMessageInEditor', "Open in Editor"), original: 'Open in Editor' },
            icon: Codicon.linkExternal,
            category: Categories.Test,
            menu: [{ id: MenuId.TestPeekTitle }],
        });
    }
    runEditorCommand(accessor, editor) {
        TestingOutputPeekController.get(getPeekedEditor(accessor, editor))?.openCurrentInEditor();
    }
}
export class ToggleTestingPeekHistory extends EditorAction2 {
    static ID = 'testing.toggleTestingPeekHistory';
    constructor() {
        super({
            id: ToggleTestingPeekHistory.ID,
            f1: true,
            title: { value: localize('testing.toggleTestingPeekHistory', "Toggle Test History in Peek"), original: 'Toggle Test History in Peek' },
            icon: Codicon.history,
            category: Categories.Test,
            menu: [{
                    id: MenuId.TestPeekTitle,
                    group: 'navigation',
                    order: 3,
                }],
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 512 /* KeyMod.Alt */ | 38 /* KeyCode.KeyH */,
                when: TestingContextKeys.isPeekVisible.isEqualTo(true),
            },
        });
    }
    runEditorCommand(accessor, editor) {
        const ctrl = TestingOutputPeekController.get(getPeekedEditor(accessor, editor));
        if (ctrl) {
            ctrl.historyVisible.value = !ctrl.historyVisible.value;
        }
    }
}
