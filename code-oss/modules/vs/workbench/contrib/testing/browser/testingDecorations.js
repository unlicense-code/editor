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
import { Action, Separator, SubmenuAction } from 'vs/base/common/actions';
import { equals } from 'vs/base/common/arrays';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Emitter, Event } from 'vs/base/common/event';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { stripIcons } from 'vs/base/common/iconLabels';
import { Iterable } from 'vs/base/common/iterator';
import { Disposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { generateUuid } from 'vs/base/common/uuid';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { editorCodeLensForeground, overviewRulerError, overviewRulerInfo } from 'vs/editor/common/core/editorColorRegistry';
import { Range } from 'vs/editor/common/core/range';
import { OverviewRulerLane } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { localize } from 'vs/nls';
import { createAndFillInContextMenuActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { registerThemingParticipant, themeColorFromId, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { BREAKPOINT_EDITOR_CONTRIBUTION_ID } from 'vs/workbench/contrib/debug/common/debug';
import { getTestItemContextOverlay } from 'vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay';
import { testingRunAllIcon, testingRunIcon, testingStatesToIcons } from 'vs/workbench/contrib/testing/browser/icons';
import { testMessageSeverityColors } from 'vs/workbench/contrib/testing/browser/theme';
import { getTestingConfiguration } from 'vs/workbench/contrib/testing/common/configuration';
import { labelForTestInState } from 'vs/workbench/contrib/testing/common/constants';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { ITestingDecorationsService, TestDecorations } from 'vs/workbench/contrib/testing/common/testingDecorations';
import { ITestingPeekOpener } from 'vs/workbench/contrib/testing/common/testingPeekOpener';
import { isFailedState, maxPriority } from 'vs/workbench/contrib/testing/common/testingStates';
import { buildTestUri, parseTestUri } from 'vs/workbench/contrib/testing/common/testingUri';
import { ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { LiveTestResult } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { getContextForTestItem, ITestService, testsInFile } from 'vs/workbench/contrib/testing/common/testService';
const MAX_INLINE_MESSAGE_LENGTH = 128;
function isOriginalInDiffEditor(codeEditorService, codeEditor) {
    const diffEditors = codeEditorService.listDiffEditors();
    for (const diffEditor of diffEditors) {
        if (diffEditor.getOriginalEditor() === codeEditor) {
            return true;
        }
    }
    return false;
}
let TestingDecorationService = class TestingDecorationService extends Disposable {
    configurationService;
    testService;
    results;
    instantiationService;
    modelService;
    generation = 0;
    changeEmitter = new Emitter();
    decorationCache = new ResourceMap();
    /**
     * List of messages that should be hidden because an editor changed their
     * underlying ranges. I think this is good enough, because:
     *  - Message decorations are never shown across reloads; this does not
     *    need to persist
     *  - Message instances are stable for any completed test results for
     *    the duration of the session.
     */
    invalidatedMessages = new WeakSet();
    /** @inheritdoc */
    onDidChange = this.changeEmitter.event;
    constructor(codeEditorService, configurationService, testService, results, instantiationService, modelService) {
        super();
        this.configurationService = configurationService;
        this.testService = testService;
        this.results = results;
        this.instantiationService = instantiationService;
        this.modelService = modelService;
        codeEditorService.registerDecorationType('test-message-decoration', TestMessageDecoration.decorationId, {}, undefined);
        modelService.onModelRemoved(e => this.decorationCache.delete(e.uri));
        const debounceInvalidate = this._register(new RunOnceScheduler(() => this.invalidate(), 100));
        // If ranges were updated in the document, mark that we should explicitly
        // sync decorations to the published lines, since we assume that everything
        // is up to date. This prevents issues, as in #138632, #138835, #138922.
        this._register(this.testService.onWillProcessDiff(diff => {
            for (const entry of diff) {
                if (entry.op !== 2 /* TestDiffOpType.DocumentSynced */) {
                    continue;
                }
                const rec = this.decorationCache.get(entry.uri);
                if (rec) {
                    rec.rangeUpdateVersionId = entry.docv;
                }
            }
            if (!debounceInvalidate.isScheduled()) {
                debounceInvalidate.schedule();
            }
        }));
        this._register(Event.any(this.results.onResultsChanged, this.results.onTestChanged, this.testService.excluded.onTestExclusionsChanged, this.testService.showInlineOutput.onDidChange, Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration("testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */)))(() => {
            if (!debounceInvalidate.isScheduled()) {
                debounceInvalidate.schedule();
            }
        }));
    }
    /** @inheritdoc */
    invalidateResultMessage(message) {
        this.invalidatedMessages.add(message);
        this.invalidate();
    }
    /** @inheritdoc */
    syncDecorations(resource) {
        const model = this.modelService.getModel(resource);
        if (!model) {
            return new Map();
        }
        const cached = this.decorationCache.get(resource);
        if (cached && cached.generation === this.generation && (cached.rangeUpdateVersionId === undefined || cached.rangeUpdateVersionId !== model.getVersionId())) {
            return cached.map;
        }
        return this.applyDecorations(model);
    }
    /** @inheritdoc */
    getDecoratedRangeForTest(resource, testId) {
        const model = this.modelService.getModel(resource);
        if (!model) {
            return undefined;
        }
        const decoration = Iterable.find(this.syncDecorations(resource).values(), v => v instanceof RunTestDecoration && v.isForTest(testId));
        if (!decoration) {
            return undefined;
        }
        return model.getDecorationRange(decoration.id) || undefined;
    }
    invalidate() {
        this.generation++;
        this.changeEmitter.fire();
    }
    /**
     * Applies the current set of test decorations to the given text model.
     */
    applyDecorations(model) {
        const gutterEnabled = getTestingConfiguration(this.configurationService, "testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */);
        const uriStr = model.uri.toString();
        const cached = this.decorationCache.get(model.uri);
        const testRangesUpdated = cached?.rangeUpdateVersionId === model.getVersionId();
        const lastDecorations = cached?.value ?? [];
        const map = model.changeDecorations(accessor => {
            const newDecorations = [];
            const runDecorations = new TestDecorations();
            for (const test of this.testService.collection.all) {
                if (!test.item.range || test.item.uri?.toString() !== uriStr) {
                    continue;
                }
                const stateLookup = this.results.getStateById(test.item.extId);
                const line = test.item.range.startLineNumber;
                runDecorations.push({ line, id: '', test, resultItem: stateLookup?.[1] });
            }
            for (const [line, tests] of runDecorations.lines()) {
                const multi = tests.length > 1;
                let existing = lastDecorations.find(d => d instanceof RunTestDecoration && d.exactlyContainsTests(tests));
                // see comment in the constructor for what's going on here
                if (existing && testRangesUpdated && model.getDecorationRange(existing.id)?.startLineNumber !== line) {
                    existing = undefined;
                }
                if (existing) {
                    if (existing.replaceOptions(tests, gutterEnabled)) {
                        accessor.changeDecorationOptions(existing.id, existing.editorDecoration.options);
                    }
                    newDecorations.push(existing);
                }
                else {
                    newDecorations.push(multi
                        ? this.instantiationService.createInstance(MultiRunTestDecoration, tests, gutterEnabled, model)
                        : this.instantiationService.createInstance(RunSingleTestDecoration, tests[0].test, tests[0].resultItem, model, gutterEnabled));
                }
            }
            const lastResult = this.results.results[0];
            if (this.testService.showInlineOutput.value && lastResult instanceof LiveTestResult) {
                for (const task of lastResult.tasks) {
                    for (const m of task.otherMessages) {
                        if (!this.invalidatedMessages.has(m) && m.location?.uri.toString() === uriStr) {
                            const decoration = lastDecorations.find(l => l instanceof TestMessageDecoration && l.testMessage === m)
                                || this.instantiationService.createInstance(TestMessageDecoration, m, undefined, model);
                            newDecorations.push(decoration);
                        }
                    }
                }
                const messageLines = new Map();
                for (const test of lastResult.tests) {
                    for (let taskId = 0; taskId < test.tasks.length; taskId++) {
                        const state = test.tasks[taskId];
                        for (let i = 0; i < state.messages.length; i++) {
                            const m = state.messages[i];
                            if (this.invalidatedMessages.has(m) || m.location?.uri.toString() !== uriStr) {
                                continue;
                            }
                            // Only add one message per line number. Overlapping messages
                            // don't appear well, and the peek will show all of them (#134129)
                            const line = m.location.range.startLineNumber;
                            let index;
                            if (messageLines.has(line)) {
                                index = messageLines.get(line);
                            }
                            else {
                                index = newDecorations.length;
                                messageLines.set(line, index);
                            }
                            const previous = lastDecorations.find(l => l instanceof TestMessageDecoration && l.testMessage === m);
                            if (previous) {
                                newDecorations[index] = previous;
                                continue;
                            }
                            const messageUri = buildTestUri({
                                type: 1 /* TestUriType.ResultActualOutput */,
                                messageIndex: i,
                                taskIndex: taskId,
                                resultId: lastResult.id,
                                testExtId: test.item.extId,
                            });
                            newDecorations.push(this.instantiationService.createInstance(TestMessageDecoration, m, messageUri, model));
                        }
                    }
                }
            }
            const saveFromRemoval = new Set();
            for (const decoration of newDecorations) {
                if (decoration.id === '') {
                    decoration.id = accessor.addDecoration(decoration.editorDecoration.range, decoration.editorDecoration.options);
                }
                else {
                    saveFromRemoval.add(decoration.id);
                }
            }
            for (const decoration of lastDecorations) {
                if (!saveFromRemoval.has(decoration.id)) {
                    accessor.removeDecoration(decoration.id);
                }
            }
            const map = new Map(newDecorations.map(d => [d.id, d]));
            this.decorationCache.set(model.uri, {
                generation: this.generation,
                rangeUpdateVersionId: cached?.rangeUpdateVersionId,
                value: newDecorations,
                map,
            });
            return map;
        });
        return map || new Map();
    }
};
TestingDecorationService = __decorate([
    __param(0, ICodeEditorService),
    __param(1, IConfigurationService),
    __param(2, ITestService),
    __param(3, ITestResultService),
    __param(4, IInstantiationService),
    __param(5, IModelService)
], TestingDecorationService);
export { TestingDecorationService };
let TestingDecorations = class TestingDecorations extends Disposable {
    editor;
    codeEditorService;
    testService;
    decorations;
    uriIdentityService;
    /**
     * Gets the decorations associated with the given code editor.
     */
    static get(editor) {
        return editor.getContribution("editor.contrib.testingDecorations" /* Testing.DecorationsContributionId */);
    }
    currentUri;
    expectedWidget = new MutableDisposable();
    actualWidget = new MutableDisposable();
    constructor(editor, codeEditorService, testService, decorations, uriIdentityService) {
        super();
        this.editor = editor;
        this.codeEditorService = codeEditorService;
        this.testService = testService;
        this.decorations = decorations;
        this.uriIdentityService = uriIdentityService;
        codeEditorService.registerDecorationType('test-message-decoration', TestMessageDecoration.decorationId, {}, undefined, editor);
        this.attachModel(editor.getModel()?.uri);
        this._register(decorations.onDidChange(() => {
            if (this.currentUri) {
                decorations.syncDecorations(this.currentUri);
            }
        }));
        this._register(this.editor.onDidChangeModel(e => this.attachModel(e.newModelUrl || undefined)));
        this._register(this.editor.onMouseDown(e => {
            if (e.target.position && this.currentUri) {
                const modelDecorations = editor.getModel()?.getDecorationsInRange(Range.fromPositions(e.target.position)) ?? [];
                for (const { id } of modelDecorations) {
                    const cache = decorations.syncDecorations(this.currentUri);
                    if (cache.get(id)?.click(e)) {
                        e.event.stopPropagation();
                        return;
                    }
                }
            }
        }));
        this._register(Event.accumulate(this.editor.onDidChangeModelContent, 0, this._store)(evts => {
            const model = editor.getModel();
            if (!this.currentUri || !model) {
                return;
            }
            const currentDecorations = decorations.syncDecorations(this.currentUri);
            if (!currentDecorations.size) {
                return;
            }
            for (const e of evts) {
                for (const change of e.changes) {
                    const modelDecorations = model.getLinesDecorations(change.range.startLineNumber, change.range.endLineNumber);
                    for (const { id } of modelDecorations) {
                        const decoration = currentDecorations.get(id);
                        if (decoration instanceof TestMessageDecoration) {
                            decorations.invalidateResultMessage(decoration.testMessage);
                        }
                    }
                }
            }
        }));
        const updateFontFamilyVar = () => {
            this.editor.getContainerDomNode().style.setProperty('--testMessageDecorationFontFamily', editor.getOption(44 /* EditorOption.fontFamily */));
            this.editor.getContainerDomNode().style.setProperty('--testMessageDecorationFontSize', `${editor.getOption(47 /* EditorOption.fontSize */)}px`);
        };
        this._register(this.editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(44 /* EditorOption.fontFamily */)) {
                updateFontFamilyVar();
            }
        }));
        updateFontFamilyVar();
    }
    attachModel(uri) {
        switch (uri && parseTestUri(uri)?.type) {
            case 2 /* TestUriType.ResultExpectedOutput */:
                this.expectedWidget.value = new ExpectedLensContentWidget(this.editor);
                this.actualWidget.clear();
                break;
            case 1 /* TestUriType.ResultActualOutput */:
                this.expectedWidget.clear();
                this.actualWidget.value = new ActualLensContentWidget(this.editor);
                break;
            default:
                this.expectedWidget.clear();
                this.actualWidget.clear();
        }
        if (isOriginalInDiffEditor(this.codeEditorService, this.editor)) {
            uri = undefined;
        }
        this.currentUri = uri;
        if (!uri) {
            return;
        }
        this.decorations.syncDecorations(uri);
        (async () => {
            for await (const _test of testsInFile(this.testService, this.uriIdentityService, uri, false)) {
                // consume the iterator so that all tests in the file get expanded. Or
                // at least until the URI changes. If new items are requested, changes
                // will be trigged in the `onDidProcessDiff` callback.
                if (this.currentUri !== uri) {
                    break;
                }
            }
        })();
    }
};
TestingDecorations = __decorate([
    __param(1, ICodeEditorService),
    __param(2, ITestService),
    __param(3, ITestingDecorationsService),
    __param(4, IUriIdentityService)
], TestingDecorations);
export { TestingDecorations };
const firstLineRange = (originalRange) => ({
    startLineNumber: originalRange.startLineNumber,
    endLineNumber: originalRange.startLineNumber,
    startColumn: 0,
    endColumn: 1,
});
const createRunTestDecoration = (tests, states, visible) => {
    const range = tests[0]?.item.range;
    if (!range) {
        throw new Error('Test decorations can only be created for tests with a range');
    }
    if (!visible) {
        return { range: firstLineRange(range), options: { isWholeLine: true, description: 'run-test-decoration' } };
    }
    let computedState = 0 /* TestResultState.Unset */;
    const hoverMessageParts = [];
    let testIdWithMessages;
    let retired = false;
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const resultItem = states[i];
        const state = resultItem?.computedState ?? 0 /* TestResultState.Unset */;
        if (hoverMessageParts.length < 10) {
            hoverMessageParts.push(labelForTestInState(test.item.label, state));
        }
        computedState = maxPriority(computedState, state);
        retired = retired || !!resultItem?.retired;
        if (!testIdWithMessages && resultItem?.tasks.some(t => t.messages.length)) {
            testIdWithMessages = test.item.extId;
        }
    }
    const hasMultipleTests = tests.length > 1 || tests[0].children.size > 0;
    const icon = computedState === 0 /* TestResultState.Unset */
        ? (hasMultipleTests ? testingRunAllIcon : testingRunIcon)
        : testingStatesToIcons.get(computedState);
    let hoverMessage;
    let glyphMarginClassName = ThemeIcon.asClassName(icon) + ' testing-run-glyph';
    if (retired) {
        glyphMarginClassName += ' retired';
    }
    return {
        range: firstLineRange(range),
        options: {
            description: 'run-test-decoration',
            isWholeLine: true,
            get hoverMessage() {
                if (!hoverMessage) {
                    const building = hoverMessage = new MarkdownString('', true).appendText(hoverMessageParts.join(', ') + '.');
                    if (testIdWithMessages) {
                        const args = encodeURIComponent(JSON.stringify([testIdWithMessages]));
                        building.appendMarkdown(`[${localize('peekTestOutout', 'Peek Test Output')}](command:vscode.peekTestError?${args})`);
                    }
                }
                return hoverMessage;
            },
            glyphMarginClassName,
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        }
    };
};
var LensContentWidgetVars;
(function (LensContentWidgetVars) {
    LensContentWidgetVars["FontFamily"] = "testingDiffLensFontFamily";
    LensContentWidgetVars["FontFeatures"] = "testingDiffLensFontFeatures";
})(LensContentWidgetVars || (LensContentWidgetVars = {}));
class TitleLensContentWidget {
    editor;
    /** @inheritdoc */
    allowEditorOverflow = false;
    /** @inheritdoc */
    suppressMouseDown = true;
    _domNode = dom.$('span');
    viewZoneId;
    constructor(editor) {
        this.editor = editor;
        queueMicrotask(() => {
            this.applyStyling();
            this.editor.addContentWidget(this);
        });
    }
    applyStyling() {
        let fontSize = this.editor.getOption(16 /* EditorOption.codeLensFontSize */);
        let height;
        if (!fontSize || fontSize < 5) {
            fontSize = (this.editor.getOption(47 /* EditorOption.fontSize */) * .9) | 0;
            height = this.editor.getOption(60 /* EditorOption.lineHeight */);
        }
        else {
            height = (fontSize * Math.max(1.3, this.editor.getOption(60 /* EditorOption.lineHeight */) / this.editor.getOption(47 /* EditorOption.fontSize */))) | 0;
        }
        const editorFontInfo = this.editor.getOption(45 /* EditorOption.fontInfo */);
        const node = this._domNode;
        node.classList.add('testing-diff-lens-widget');
        node.textContent = this.getText();
        node.style.lineHeight = `${height}px`;
        node.style.fontSize = `${fontSize}px`;
        node.style.fontFamily = `var(--${"testingDiffLensFontFamily" /* LensContentWidgetVars.FontFamily */})`;
        node.style.fontFeatureSettings = `var(--${"testingDiffLensFontFeatures" /* LensContentWidgetVars.FontFeatures */})`;
        const containerStyle = this.editor.getContainerDomNode().style;
        containerStyle.setProperty("testingDiffLensFontFamily" /* LensContentWidgetVars.FontFamily */, this.editor.getOption(15 /* EditorOption.codeLensFontFamily */) ?? 'inherit');
        containerStyle.setProperty("testingDiffLensFontFeatures" /* LensContentWidgetVars.FontFeatures */, editorFontInfo.fontFeatureSettings);
        this.editor.changeViewZones(accessor => {
            if (this.viewZoneId) {
                accessor.removeZone(this.viewZoneId);
            }
            this.viewZoneId = accessor.addZone({
                afterLineNumber: 0,
                afterColumn: 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
                domNode: document.createElement('div'),
                heightInPx: 20,
            });
        });
    }
    /** @inheritdoc */
    getDomNode() {
        return this._domNode;
    }
    /** @inheritdoc */
    dispose() {
        this.editor.changeViewZones(accessor => {
            if (this.viewZoneId) {
                accessor.removeZone(this.viewZoneId);
            }
        });
        this.editor.removeContentWidget(this);
    }
    /** @inheritdoc */
    getPosition() {
        return {
            position: { column: 0, lineNumber: 0 },
            preference: [1 /* ContentWidgetPositionPreference.ABOVE */],
        };
    }
}
class ExpectedLensContentWidget extends TitleLensContentWidget {
    getId() {
        return 'expectedTestingLens';
    }
    getText() {
        return localize('expected.title', 'Expected');
    }
}
class ActualLensContentWidget extends TitleLensContentWidget {
    getId() {
        return 'actualTestingLens';
    }
    getText() {
        return localize('actual.title', 'Actual');
    }
}
let RunTestDecoration = class RunTestDecoration {
    tests;
    visible;
    model;
    codeEditorService;
    testService;
    contextMenuService;
    commandService;
    configurationService;
    testProfileService;
    contextKeyService;
    menuService;
    /** @inheritdoc */
    id = '';
    get line() {
        return this.editorDecoration.range.startLineNumber;
    }
    editorDecoration;
    constructor(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService) {
        this.tests = tests;
        this.visible = visible;
        this.model = model;
        this.codeEditorService = codeEditorService;
        this.testService = testService;
        this.contextMenuService = contextMenuService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.testProfileService = testProfileService;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.editorDecoration = createRunTestDecoration(tests.map(t => t.test), tests.map(t => t.resultItem), visible);
        this.editorDecoration.options.glyphMarginHoverMessage = new MarkdownString().appendText(this.getGutterLabel());
    }
    /** @inheritdoc */
    click(e) {
        if (e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */) {
            return false;
        }
        if (e.event.rightButton) {
            this.showContextMenu(e);
            return true;
        }
        switch (getTestingConfiguration(this.configurationService, "testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */)) {
            case "contextMenu" /* DefaultGutterClickAction.ContextMenu */:
                this.showContextMenu(e);
                break;
            case "debug" /* DefaultGutterClickAction.Debug */:
                this.defaultDebug();
                break;
            case "run" /* DefaultGutterClickAction.Run */:
            default:
                this.defaultRun();
                break;
        }
        return true;
    }
    exactlyContainsTests(tests) {
        if (tests.length !== this.tests.length) {
            return false;
        }
        if (tests.length === 1) {
            return tests[0].test.item.extId === this.tests[0].test.item.extId;
        }
        const ownTests = new Set();
        for (const t of this.tests) {
            ownTests.add(t.test.item.extId);
        }
        for (const t of tests) {
            if (!ownTests.delete(t.test.item.extId)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Updates the decoration to match the new set of tests.
     * @returns true if options were changed, false otherwise
     */
    replaceOptions(newTests, visible) {
        if (visible === this.visible
            && equals(this.tests.map(t => t.test.item.extId), newTests.map(t => t.test.item.extId))
            && this.tests.map(t => t.resultItem?.computedState) === newTests.map(t => t.resultItem?.computedState)) {
            return false;
        }
        this.tests = newTests;
        this.visible = visible;
        this.editorDecoration.options = createRunTestDecoration(newTests.map(t => t.test), newTests.map(t => t.resultItem), visible).options;
        return true;
    }
    /**
     * Gets whether this decoration serves as the run button for the given test ID.
     */
    isForTest(testId) {
        return this.tests.some(t => t.test.item.extId === testId);
    }
    defaultRun() {
        return this.testService.runTests({
            tests: this.tests.map(({ test }) => test),
            group: 2 /* TestRunProfileBitset.Run */,
        });
    }
    defaultDebug() {
        return this.testService.runTests({
            tests: this.tests.map(({ test }) => test),
            group: 4 /* TestRunProfileBitset.Debug */,
        });
    }
    showContextMenu(e) {
        let actions = this.getContextMenuActions();
        const editor = this.codeEditorService.listCodeEditors().find(e => e.getModel() === this.model);
        if (editor) {
            const contribution = editor.getContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID);
            if (contribution) {
                actions = {
                    dispose: actions.dispose,
                    object: Separator.join(actions.object, contribution.getContextMenuActionsAtPosition(this.line, this.model))
                };
            }
        }
        this.contextMenuService.showContextMenu({
            getAnchor: () => ({ x: e.event.posx, y: e.event.posy }),
            getActions: () => actions.object,
            onHide: () => actions.dispose,
        });
    }
    getGutterLabel() {
        switch (getTestingConfiguration(this.configurationService, "testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */)) {
            case "contextMenu" /* DefaultGutterClickAction.ContextMenu */:
                return localize('testing.gutterMsg.contextMenu', 'Click for test options');
            case "debug" /* DefaultGutterClickAction.Debug */:
                return localize('testing.gutterMsg.debug', 'Click to debug tests, right click for more options');
            case "run" /* DefaultGutterClickAction.Run */:
            default:
                return localize('testing.gutterMsg.run', 'Click to run tests, right click for more options');
        }
    }
    /**
     * Gets context menu actions relevant for a singel test.
     */
    getTestContextMenuActions(test, resultItem) {
        const testActions = [];
        const capabilities = this.testProfileService.capabilitiesForTest(test);
        if (capabilities & 2 /* TestRunProfileBitset.Run */) {
            testActions.push(new Action('testing.gutter.run', localize('run test', 'Run Test'), undefined, undefined, () => this.testService.runTests({
                group: 2 /* TestRunProfileBitset.Run */,
                tests: [test],
            })));
        }
        if (capabilities & 4 /* TestRunProfileBitset.Debug */) {
            testActions.push(new Action('testing.gutter.debug', localize('debug test', 'Debug Test'), undefined, undefined, () => this.testService.runTests({
                group: 4 /* TestRunProfileBitset.Debug */,
                tests: [test],
            })));
        }
        if (capabilities & 16 /* TestRunProfileBitset.HasNonDefaultProfile */) {
            testActions.push(new Action('testing.runUsing', localize('testing.runUsing', 'Execute Using Profile...'), undefined, undefined, async () => {
                const profile = await this.commandService.executeCommand('vscode.pickTestProfile', { onlyForTest: test });
                if (!profile) {
                    return;
                }
                this.testService.runResolvedTests({
                    targets: [{
                            profileGroup: profile.group,
                            profileId: profile.profileId,
                            controllerId: profile.controllerId,
                            testIds: [test.item.extId]
                        }]
                });
            }));
        }
        if (resultItem && isFailedState(resultItem.computedState)) {
            testActions.push(new Action('testing.gutter.peekFailure', localize('peek failure', 'Peek Error'), undefined, undefined, () => this.commandService.executeCommand('vscode.peekTestError', test.item.extId)));
        }
        testActions.push(new Action('testing.gutter.reveal', localize('reveal test', 'Reveal in Test Explorer'), undefined, undefined, () => this.commandService.executeCommand('_revealTestInExplorer', test.item.extId)));
        const contributed = this.getContributedTestActions(test, capabilities);
        return { object: Separator.join(testActions, contributed), dispose() { } };
    }
    getContributedTestActions(test, capabilities) {
        const contextOverlay = this.contextKeyService.createOverlay(getTestItemContextOverlay(test, capabilities));
        const menu = this.menuService.createMenu(MenuId.TestItemGutter, contextOverlay);
        try {
            const target = [];
            const arg = getContextForTestItem(this.testService.collection, test.item.extId);
            createAndFillInContextMenuActions(menu, { shouldForwardArgs: true, arg }, target);
            return target;
        }
        finally {
            menu.dispose();
        }
    }
};
RunTestDecoration = __decorate([
    __param(3, ICodeEditorService),
    __param(4, ITestService),
    __param(5, IContextMenuService),
    __param(6, ICommandService),
    __param(7, IConfigurationService),
    __param(8, ITestProfileService),
    __param(9, IContextKeyService),
    __param(10, IMenuService)
], RunTestDecoration);
class MultiRunTestDecoration extends RunTestDecoration {
    get testIds() {
        return this.tests.map(t => t.test.item.extId);
    }
    get displayedStates() {
        return this.tests.map(t => t.resultItem?.computedState);
    }
    getContextMenuActions() {
        const allActions = [];
        if (this.tests.some(({ test }) => this.testProfileService.capabilitiesForTest(test) & 2 /* TestRunProfileBitset.Run */)) {
            allActions.push(new Action('testing.gutter.runAll', localize('run all test', 'Run All Tests'), undefined, undefined, () => this.defaultRun()));
        }
        if (this.tests.some(({ test }) => this.testProfileService.capabilitiesForTest(test) & 4 /* TestRunProfileBitset.Debug */)) {
            allActions.push(new Action('testing.gutter.debugAll', localize('debug all test', 'Debug All Tests'), undefined, undefined, () => this.defaultDebug()));
        }
        const testItems = this.tests.map(testItem => ({
            currentLabel: testItem.test.item.label,
            testItem,
            parent: TestId.fromString(testItem.test.item.extId).parentId,
        }));
        const getLabelConflicts = (tests) => {
            const labelCount = new Map();
            for (const test of tests) {
                labelCount.set(test.currentLabel, (labelCount.get(test.currentLabel) || 0) + 1);
            }
            return tests.filter(e => labelCount.get(e.currentLabel) > 1);
        };
        let conflicts, hasParent = true;
        while ((conflicts = getLabelConflicts(testItems)).length && hasParent) {
            for (const conflict of conflicts) {
                if (conflict.parent) {
                    const parent = this.testService.collection.getNodeById(conflict.parent.toString());
                    conflict.currentLabel = parent?.item.label + ' > ' + conflict.currentLabel;
                    conflict.parent = conflict.parent.parentId;
                }
                else {
                    hasParent = false;
                }
            }
        }
        const disposable = new DisposableStore();
        const testSubmenus = testItems.map(({ currentLabel, testItem }) => {
            const actions = this.getTestContextMenuActions(testItem.test, testItem.resultItem);
            disposable.add(actions);
            return new SubmenuAction(testItem.test.item.extId, stripIcons(currentLabel), actions.object);
        });
        return { object: Separator.join(allActions, testSubmenus), dispose: () => disposable.dispose() };
    }
}
let RunSingleTestDecoration = class RunSingleTestDecoration extends RunTestDecoration {
    constructor(test, resultItem, model, visible, codeEditorService, testService, commandService, contextMenuService, configurationService, testProfiles, contextKeyService, menuService) {
        super([{ test, resultItem }], visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfiles, contextKeyService, menuService);
    }
    getContextMenuActions() {
        return this.getTestContextMenuActions(this.tests[0].test, this.tests[0].resultItem);
    }
};
RunSingleTestDecoration = __decorate([
    __param(4, ICodeEditorService),
    __param(5, ITestService),
    __param(6, ICommandService),
    __param(7, IContextMenuService),
    __param(8, IConfigurationService),
    __param(9, ITestProfileService),
    __param(10, IContextKeyService),
    __param(11, IMenuService)
], RunSingleTestDecoration);
const lineBreakRe = /\r?\n\s*/g;
let TestMessageDecoration = class TestMessageDecoration {
    testMessage;
    messageUri;
    peekOpener;
    static inlineClassName = 'test-message-inline-content';
    static decorationId = `testmessage-${generateUuid()}`;
    id = '';
    editorDecoration;
    location;
    line;
    contentIdClass = `test-message-inline-content-id${generateUuid()}`;
    constructor(testMessage, messageUri, textModel, peekOpener, editorService) {
        this.testMessage = testMessage;
        this.messageUri = messageUri;
        this.peekOpener = peekOpener;
        this.location = testMessage.location;
        this.line = this.location.range.startLineNumber;
        const severity = testMessage.type;
        const message = testMessage.message;
        const options = editorService.resolveDecorationOptions(TestMessageDecoration.decorationId, true);
        options.hoverMessage = typeof message === 'string' ? new MarkdownString().appendText(message) : message;
        options.zIndex = 10; // todo: in spite of the z-index, this appears behind gitlens
        options.className = `testing-inline-message-severity-${severity}`;
        options.isWholeLine = true;
        options.stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
        options.collapseOnReplaceEdit = true;
        let inlineText = renderStringAsPlaintext(message).replace(lineBreakRe, ' ');
        if (inlineText.length > MAX_INLINE_MESSAGE_LENGTH) {
            inlineText = inlineText.slice(0, MAX_INLINE_MESSAGE_LENGTH - 1) + '…';
        }
        options.after = {
            content: ' '.repeat(4) + inlineText,
            inlineClassName: `test-message-inline-content test-message-inline-content-s${severity} ${this.contentIdClass} ${messageUri ? 'test-message-inline-content-clickable' : ''}`
        };
        options.showIfCollapsed = true;
        const rulerColor = severity === 0 /* TestMessageType.Error */
            ? overviewRulerError
            : overviewRulerInfo;
        if (rulerColor) {
            options.overviewRuler = { color: themeColorFromId(rulerColor), position: OverviewRulerLane.Right };
        }
        const lineLength = textModel.getLineLength(this.location.range.startLineNumber);
        const column = lineLength ? (lineLength + 1) : this.location.range.endColumn;
        this.editorDecoration = {
            options,
            range: {
                startLineNumber: this.location.range.startLineNumber,
                startColumn: column,
                endColumn: column,
                endLineNumber: this.location.range.startLineNumber,
            }
        };
    }
    click(e) {
        if (e.event.rightButton) {
            return false;
        }
        if (!this.messageUri) {
            return false;
        }
        if (e.target.element?.className.includes(this.contentIdClass)) {
            this.peekOpener.peekUri(this.messageUri);
        }
        return false;
    }
};
TestMessageDecoration = __decorate([
    __param(3, ITestingPeekOpener),
    __param(4, ICodeEditorService)
], TestMessageDecoration);
registerThemingParticipant((theme, collector) => {
    const codeLensForeground = theme.getColor(editorCodeLensForeground);
    if (codeLensForeground) {
        collector.addRule(`.testing-diff-lens-widget { color: ${codeLensForeground}; }`);
    }
    for (const [severity, { decorationForeground }] of Object.entries(testMessageSeverityColors)) {
        collector.addRule(`.test-message-inline-content-s${severity} { color: ${theme.getColor(decorationForeground)} !important }`);
    }
});
