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
import 'vs/css!./media/editorstatus';
import { localize } from 'vs/nls';
import { runAtThisOrScheduleAtNextAnimationFrame } from 'vs/base/browser/dom';
import { format, compare, splitLines } from 'vs/base/common/strings';
import { extname, basename, isEqual } from 'vs/base/common/resources';
import { areFunctions, assertIsDefined, withNullAsUndefined, withUndefinedAsNull } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { Action } from 'vs/base/common/actions';
import { Language } from 'vs/base/common/platform';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { Disposable, MutableDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { TrimTrailingWhitespaceAction } from 'vs/editor/contrib/linesOperations/browser/linesOperations';
import { IndentUsingSpaces, IndentUsingTabs, ChangeTabDisplaySize, DetectIndentation, IndentationToSpacesAction, IndentationToTabsAction } from 'vs/editor/contrib/indentation/browser/indentation';
import { BaseBinaryResourceEditor } from 'vs/workbench/browser/parts/editor/binaryEditor';
import { BinaryResourceDiffEditor } from 'vs/workbench/browser/parts/editor/binaryDiffEditor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IFileService, FILES_ASSOCIATIONS_CONFIG } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { TabFocus } from 'vs/editor/browser/config/tabFocus';
import { ICommandService, CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { SUPPORTED_ENCODINGS } from 'vs/workbench/services/textfile/common/encoding';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { deepClone } from 'vs/base/common/objects';
import { getCodeEditor } from 'vs/editor/browser/editorBrowser';
import { Schemas } from 'vs/base/common/network';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { getIconClassesForLanguageId } from 'vs/editor/common/services/getIconClasses';
import { Promises, timeout } from 'vs/base/common/async';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { Event } from 'vs/base/common/event';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IMarkerService, MarkerSeverity, IMarkerData } from 'vs/platform/markers/common/markers';
import { STATUS_BAR_PROMINENT_ITEM_BACKGROUND, STATUS_BAR_PROMINENT_ITEM_FOREGROUND } from 'vs/workbench/common/theme';
import { themeColorFromId } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { SideBySideEditorInput } from 'vs/workbench/common/editor/sideBySideEditorInput';
import { AutomaticLanguageDetectionLikelyWrongId, ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
class SideBySideEditorEncodingSupport {
    primary;
    secondary;
    constructor(primary, secondary) {
        this.primary = primary;
        this.secondary = secondary;
    }
    getEncoding() {
        return this.primary.getEncoding(); // always report from modified (right hand) side
    }
    async setEncoding(encoding, mode) {
        await Promises.settled([this.primary, this.secondary].map(editor => editor.setEncoding(encoding, mode)));
    }
}
class SideBySideEditorLanguageSupport {
    primary;
    secondary;
    constructor(primary, secondary) {
        this.primary = primary;
        this.secondary = secondary;
    }
    setLanguageId(languageId, source) {
        [this.primary, this.secondary].forEach(editor => editor.setLanguageId(languageId, source));
    }
}
function toEditorWithEncodingSupport(input) {
    // Untitled Text Editor
    if (input instanceof UntitledTextEditorInput) {
        return input;
    }
    // Side by Side (diff) Editor
    if (input instanceof SideBySideEditorInput) {
        const primaryEncodingSupport = toEditorWithEncodingSupport(input.primary);
        const secondaryEncodingSupport = toEditorWithEncodingSupport(input.secondary);
        if (primaryEncodingSupport && secondaryEncodingSupport) {
            return new SideBySideEditorEncodingSupport(primaryEncodingSupport, secondaryEncodingSupport);
        }
        return primaryEncodingSupport;
    }
    // File or Resource Editor
    const encodingSupport = input;
    if (areFunctions(encodingSupport.setEncoding, encodingSupport.getEncoding)) {
        return encodingSupport;
    }
    // Unsupported for any other editor
    return null;
}
function toEditorWithLanguageSupport(input) {
    // Untitled Text Editor
    if (input instanceof UntitledTextEditorInput) {
        return input;
    }
    // Side by Side (diff) Editor
    if (input instanceof SideBySideEditorInput) {
        const primaryLanguageSupport = toEditorWithLanguageSupport(input.primary);
        const secondaryLanguageSupport = toEditorWithLanguageSupport(input.secondary);
        if (primaryLanguageSupport && secondaryLanguageSupport) {
            return new SideBySideEditorLanguageSupport(primaryLanguageSupport, secondaryLanguageSupport);
        }
        return primaryLanguageSupport;
    }
    // File or Resource Editor
    const languageSupport = input;
    if (typeof languageSupport.setLanguageId === 'function') {
        return languageSupport;
    }
    // Unsupported for any other editor
    return null;
}
class StateChange {
    indentation = false;
    selectionStatus = false;
    languageId = false;
    languageStatus = false;
    encoding = false;
    EOL = false;
    tabFocusMode = false;
    columnSelectionMode = false;
    screenReaderMode = false;
    metadata = false;
    combine(other) {
        this.indentation = this.indentation || other.indentation;
        this.selectionStatus = this.selectionStatus || other.selectionStatus;
        this.languageId = this.languageId || other.languageId;
        this.languageStatus = this.languageStatus || other.languageStatus;
        this.encoding = this.encoding || other.encoding;
        this.EOL = this.EOL || other.EOL;
        this.tabFocusMode = this.tabFocusMode || other.tabFocusMode;
        this.columnSelectionMode = this.columnSelectionMode || other.columnSelectionMode;
        this.screenReaderMode = this.screenReaderMode || other.screenReaderMode;
        this.metadata = this.metadata || other.metadata;
    }
    hasChanges() {
        return this.indentation
            || this.selectionStatus
            || this.languageId
            || this.languageStatus
            || this.encoding
            || this.EOL
            || this.tabFocusMode
            || this.columnSelectionMode
            || this.screenReaderMode
            || this.metadata;
    }
}
class State {
    _selectionStatus;
    get selectionStatus() { return this._selectionStatus; }
    _languageId;
    get languageId() { return this._languageId; }
    _encoding;
    get encoding() { return this._encoding; }
    _EOL;
    get EOL() { return this._EOL; }
    _indentation;
    get indentation() { return this._indentation; }
    _tabFocusMode;
    get tabFocusMode() { return this._tabFocusMode; }
    _columnSelectionMode;
    get columnSelectionMode() { return this._columnSelectionMode; }
    _screenReaderMode;
    get screenReaderMode() { return this._screenReaderMode; }
    _metadata;
    get metadata() { return this._metadata; }
    update(update) {
        const change = new StateChange();
        switch (update.type) {
            case 'selectionStatus':
                if (this._selectionStatus !== update.selectionStatus) {
                    this._selectionStatus = update.selectionStatus;
                    change.selectionStatus = true;
                }
                break;
            case 'indentation':
                if (this._indentation !== update.indentation) {
                    this._indentation = update.indentation;
                    change.indentation = true;
                }
                break;
            case 'languageId':
                if (this._languageId !== update.languageId) {
                    this._languageId = update.languageId;
                    change.languageId = true;
                }
                break;
            case 'encoding':
                if (this._encoding !== update.encoding) {
                    this._encoding = update.encoding;
                    change.encoding = true;
                }
                break;
            case 'EOL':
                if (this._EOL !== update.EOL) {
                    this._EOL = update.EOL;
                    change.EOL = true;
                }
                break;
            case 'tabFocusMode':
                if (this._tabFocusMode !== update.tabFocusMode) {
                    this._tabFocusMode = update.tabFocusMode;
                    change.tabFocusMode = true;
                }
                break;
            case 'columnSelectionMode':
                if (this._columnSelectionMode !== update.columnSelectionMode) {
                    this._columnSelectionMode = update.columnSelectionMode;
                    change.columnSelectionMode = true;
                }
                break;
            case 'screenReaderMode':
                if (this._screenReaderMode !== update.screenReaderMode) {
                    this._screenReaderMode = update.screenReaderMode;
                    change.screenReaderMode = true;
                }
                break;
            case 'metadata':
                if (this._metadata !== update.metadata) {
                    this._metadata = update.metadata;
                    change.metadata = true;
                }
                break;
        }
        return change;
    }
}
const nlsSingleSelectionRange = localize('singleSelectionRange', "Ln {0}, Col {1} ({2} selected)");
const nlsSingleSelection = localize('singleSelection', "Ln {0}, Col {1}");
const nlsMultiSelectionRange = localize('multiSelectionRange', "{0} selections ({1} characters selected)");
const nlsMultiSelection = localize('multiSelection', "{0} selections");
const nlsEOLLF = localize('endOfLineLineFeed', "LF");
const nlsEOLCRLF = localize('endOfLineCarriageReturnLineFeed', "CRLF");
let EditorStatus = class EditorStatus extends Disposable {
    editorService;
    quickInputService;
    languageService;
    textFileService;
    configurationService;
    notificationService;
    accessibilityService;
    statusbarService;
    instantiationService;
    tabFocusModeElement = this._register(new MutableDisposable());
    columnSelectionModeElement = this._register(new MutableDisposable());
    screenRedearModeElement = this._register(new MutableDisposable());
    indentationElement = this._register(new MutableDisposable());
    selectionElement = this._register(new MutableDisposable());
    encodingElement = this._register(new MutableDisposable());
    eolElement = this._register(new MutableDisposable());
    languageElement = this._register(new MutableDisposable());
    metadataElement = this._register(new MutableDisposable());
    currentProblemStatus = this._register(this.instantiationService.createInstance(ShowCurrentMarkerInStatusbarContribution));
    state = new State();
    activeEditorListeners = this._register(new DisposableStore());
    delayedRender = this._register(new MutableDisposable());
    toRender = null;
    screenReaderNotification = null;
    promptedScreenReader = false;
    constructor(editorService, quickInputService, languageService, textFileService, configurationService, notificationService, accessibilityService, statusbarService, instantiationService) {
        super();
        this.editorService = editorService;
        this.quickInputService = quickInputService;
        this.languageService = languageService;
        this.textFileService = textFileService;
        this.configurationService = configurationService;
        this.notificationService = notificationService;
        this.accessibilityService = accessibilityService;
        this.statusbarService = statusbarService;
        this.instantiationService = instantiationService;
        this.registerCommands();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.editorService.onDidActiveEditorChange(() => this.updateStatusBar()));
        this._register(this.textFileService.untitled.onDidChangeEncoding(model => this.onResourceEncodingChange(model.resource)));
        this._register(this.textFileService.files.onDidChangeEncoding(model => this.onResourceEncodingChange((model.resource))));
        this._register(TabFocus.onDidChangeTabFocus(() => this.onTabFocusModeChange()));
    }
    registerCommands() {
        CommandsRegistry.registerCommand({ id: 'showEditorScreenReaderNotification', handler: () => this.showScreenReaderNotification() });
        CommandsRegistry.registerCommand({ id: 'changeEditorIndentation', handler: () => this.showIndentationPicker() });
    }
    showScreenReaderNotification() {
        if (!this.screenReaderNotification) {
            this.screenReaderNotification = this.notificationService.prompt(Severity.Info, localize('screenReaderDetectedExplanation.question', "Are you using a screen reader to operate VS Code?"), [{
                    label: localize('screenReaderDetectedExplanation.answerYes', "Yes"),
                    run: () => {
                        this.configurationService.updateValue('editor.accessibilitySupport', 'on');
                    }
                }, {
                    label: localize('screenReaderDetectedExplanation.answerNo', "No"),
                    run: () => {
                        this.configurationService.updateValue('editor.accessibilitySupport', 'off');
                    }
                }], { sticky: true });
            Event.once(this.screenReaderNotification.onDidClose)(() => this.screenReaderNotification = null);
        }
    }
    async showIndentationPicker() {
        const activeTextEditorControl = getCodeEditor(this.editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            return this.quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
        }
        if (this.editorService.activeEditor?.hasCapability(2 /* EditorInputCapabilities.Readonly */)) {
            return this.quickInputService.pick([{ label: localize('noWritableCodeEditor', "The active code editor is read-only.") }]);
        }
        const picks = [
            assertIsDefined(activeTextEditorControl.getAction(IndentUsingSpaces.ID)),
            assertIsDefined(activeTextEditorControl.getAction(IndentUsingTabs.ID)),
            assertIsDefined(activeTextEditorControl.getAction(ChangeTabDisplaySize.ID)),
            assertIsDefined(activeTextEditorControl.getAction(DetectIndentation.ID)),
            assertIsDefined(activeTextEditorControl.getAction(IndentationToSpacesAction.ID)),
            assertIsDefined(activeTextEditorControl.getAction(IndentationToTabsAction.ID)),
            assertIsDefined(activeTextEditorControl.getAction(TrimTrailingWhitespaceAction.ID))
        ].map((a) => {
            return {
                id: a.id,
                label: a.label,
                detail: (Language.isDefaultVariant() || a.label === a.alias) ? undefined : a.alias,
                run: () => {
                    activeTextEditorControl.focus();
                    a.run();
                }
            };
        });
        picks.splice(3, 0, { type: 'separator', label: localize('indentConvert', "convert file") });
        picks.unshift({ type: 'separator', label: localize('indentView', "change view") });
        const action = await this.quickInputService.pick(picks, { placeHolder: localize('pickAction', "Select Action"), matchOnDetail: true });
        return action?.run();
    }
    updateTabFocusModeElement(visible) {
        if (visible) {
            if (!this.tabFocusModeElement.value) {
                const text = localize('tabFocusModeEnabled', "Tab Moves Focus");
                this.tabFocusModeElement.value = this.statusbarService.addEntry({
                    name: localize('status.editor.tabFocusMode', "Accessibility Mode"),
                    text,
                    ariaLabel: text,
                    tooltip: localize('disableTabMode', "Disable Accessibility Mode"),
                    command: 'editor.action.toggleTabFocusMode',
                    backgroundColor: themeColorFromId(STATUS_BAR_PROMINENT_ITEM_BACKGROUND),
                    color: themeColorFromId(STATUS_BAR_PROMINENT_ITEM_FOREGROUND)
                }, 'status.editor.tabFocusMode', 1 /* StatusbarAlignment.RIGHT */, 100.7);
            }
        }
        else {
            this.tabFocusModeElement.clear();
        }
    }
    updateColumnSelectionModeElement(visible) {
        if (visible) {
            if (!this.columnSelectionModeElement.value) {
                const text = localize('columnSelectionModeEnabled', "Column Selection");
                this.columnSelectionModeElement.value = this.statusbarService.addEntry({
                    name: localize('status.editor.columnSelectionMode', "Column Selection Mode"),
                    text,
                    ariaLabel: text,
                    tooltip: localize('disableColumnSelectionMode', "Disable Column Selection Mode"),
                    command: 'editor.action.toggleColumnSelection',
                    backgroundColor: themeColorFromId(STATUS_BAR_PROMINENT_ITEM_BACKGROUND),
                    color: themeColorFromId(STATUS_BAR_PROMINENT_ITEM_FOREGROUND)
                }, 'status.editor.columnSelectionMode', 1 /* StatusbarAlignment.RIGHT */, 100.8);
            }
        }
        else {
            this.columnSelectionModeElement.clear();
        }
    }
    updateScreenReaderModeElement(visible) {
        if (visible) {
            if (!this.screenRedearModeElement.value) {
                const text = localize('screenReaderDetected', "Screen Reader Optimized");
                this.screenRedearModeElement.value = this.statusbarService.addEntry({
                    name: localize('status.editor.screenReaderMode', "Screen Reader Mode"),
                    text,
                    ariaLabel: text,
                    command: 'showEditorScreenReaderNotification',
                    backgroundColor: themeColorFromId(STATUS_BAR_PROMINENT_ITEM_BACKGROUND),
                    color: themeColorFromId(STATUS_BAR_PROMINENT_ITEM_FOREGROUND)
                }, 'status.editor.screenReaderMode', 1 /* StatusbarAlignment.RIGHT */, 100.6);
            }
        }
        else {
            this.screenRedearModeElement.clear();
        }
    }
    updateSelectionElement(text) {
        if (!text) {
            this.selectionElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.selection', "Editor Selection"),
            text,
            ariaLabel: text,
            tooltip: localize('gotoLine', "Go to Line/Column"),
            command: 'workbench.action.gotoLine'
        };
        this.updateElement(this.selectionElement, props, 'status.editor.selection', 1 /* StatusbarAlignment.RIGHT */, 100.5);
    }
    updateIndentationElement(text) {
        if (!text) {
            this.indentationElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.indentation', "Editor Indentation"),
            text,
            ariaLabel: text,
            tooltip: localize('selectIndentation', "Select Indentation"),
            command: 'changeEditorIndentation'
        };
        this.updateElement(this.indentationElement, props, 'status.editor.indentation', 1 /* StatusbarAlignment.RIGHT */, 100.4);
    }
    updateEncodingElement(text) {
        if (!text) {
            this.encodingElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.encoding', "Editor Encoding"),
            text,
            ariaLabel: text,
            tooltip: localize('selectEncoding', "Select Encoding"),
            command: 'workbench.action.editor.changeEncoding'
        };
        this.updateElement(this.encodingElement, props, 'status.editor.encoding', 1 /* StatusbarAlignment.RIGHT */, 100.3);
    }
    updateEOLElement(text) {
        if (!text) {
            this.eolElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.eol', "Editor End of Line"),
            text,
            ariaLabel: text,
            tooltip: localize('selectEOL', "Select End of Line Sequence"),
            command: 'workbench.action.editor.changeEOL'
        };
        this.updateElement(this.eolElement, props, 'status.editor.eol', 1 /* StatusbarAlignment.RIGHT */, 100.2);
    }
    updateLanguageIdElement(text) {
        if (!text) {
            this.languageElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.mode', "Editor Language"),
            text,
            ariaLabel: text,
            tooltip: localize('selectLanguageMode', "Select Language Mode"),
            command: 'workbench.action.editor.changeLanguageMode'
        };
        this.updateElement(this.languageElement, props, 'status.editor.mode', 1 /* StatusbarAlignment.RIGHT */, 100.1);
    }
    updateMetadataElement(text) {
        if (!text) {
            this.metadataElement.clear();
            return;
        }
        const props = {
            name: localize('status.editor.info', "File Information"),
            text,
            ariaLabel: text,
            tooltip: localize('fileInfo', "File Information")
        };
        this.updateElement(this.metadataElement, props, 'status.editor.info', 1 /* StatusbarAlignment.RIGHT */, 100);
    }
    updateElement(element, props, id, alignment, priority) {
        if (!element.value) {
            element.value = this.statusbarService.addEntry(props, id, alignment, priority);
        }
        else {
            element.value.update(props);
        }
    }
    updateState(update) {
        const changed = this.state.update(update);
        if (!changed.hasChanges()) {
            return; // Nothing really changed
        }
        if (!this.toRender) {
            this.toRender = changed;
            this.delayedRender.value = runAtThisOrScheduleAtNextAnimationFrame(() => {
                this.delayedRender.clear();
                const toRender = this.toRender;
                this.toRender = null;
                if (toRender) {
                    this.doRenderNow(toRender);
                }
            });
        }
        else {
            this.toRender.combine(changed);
        }
    }
    doRenderNow(changed) {
        this.updateTabFocusModeElement(!!this.state.tabFocusMode);
        this.updateColumnSelectionModeElement(!!this.state.columnSelectionMode);
        this.updateScreenReaderModeElement(!!this.state.screenReaderMode);
        this.updateIndentationElement(this.state.indentation);
        this.updateSelectionElement(this.state.selectionStatus);
        this.updateEncodingElement(this.state.encoding);
        this.updateEOLElement(this.state.EOL ? this.state.EOL === '\r\n' ? nlsEOLCRLF : nlsEOLLF : undefined);
        this.updateLanguageIdElement(this.state.languageId);
        this.updateMetadataElement(this.state.metadata);
    }
    getSelectionLabel(info) {
        if (!info || !info.selections) {
            return undefined;
        }
        if (info.selections.length === 1) {
            if (info.charactersSelected) {
                return format(nlsSingleSelectionRange, info.selections[0].positionLineNumber, info.selections[0].positionColumn, info.charactersSelected);
            }
            return format(nlsSingleSelection, info.selections[0].positionLineNumber, info.selections[0].positionColumn);
        }
        if (info.charactersSelected) {
            return format(nlsMultiSelectionRange, info.selections.length, info.charactersSelected);
        }
        if (info.selections.length > 0) {
            return format(nlsMultiSelection, info.selections.length);
        }
        return undefined;
    }
    updateStatusBar() {
        const activeInput = this.editorService.activeEditor;
        const activeEditorPane = this.editorService.activeEditorPane;
        const activeCodeEditor = activeEditorPane ? withNullAsUndefined(getCodeEditor(activeEditorPane.getControl())) : undefined;
        // Update all states
        this.onColumnSelectionModeChange(activeCodeEditor);
        this.onScreenReaderModeChange(activeCodeEditor);
        this.onSelectionChange(activeCodeEditor);
        this.onLanguageChange(activeCodeEditor, activeInput);
        this.onEOLChange(activeCodeEditor);
        this.onEncodingChange(activeEditorPane, activeCodeEditor);
        this.onIndentationChange(activeCodeEditor);
        this.onMetadataChange(activeEditorPane);
        this.currentProblemStatus.update(activeCodeEditor);
        // Dispose old active editor listeners
        this.activeEditorListeners.clear();
        // Attach new listeners to active editor
        if (activeEditorPane) {
            this.activeEditorListeners.add(activeEditorPane.onDidChangeControl(() => {
                // Since our editor status is mainly observing the
                // active editor control, do a full update whenever
                // the control changes.
                this.updateStatusBar();
            }));
        }
        // Attach new listeners to active code editor
        if (activeCodeEditor) {
            // Hook Listener for Configuration changes
            this.activeEditorListeners.add(activeCodeEditor.onDidChangeConfiguration((event) => {
                if (event.hasChanged(18 /* EditorOption.columnSelection */)) {
                    this.onColumnSelectionModeChange(activeCodeEditor);
                }
                if (event.hasChanged(2 /* EditorOption.accessibilitySupport */)) {
                    this.onScreenReaderModeChange(activeCodeEditor);
                }
            }));
            // Hook Listener for Selection changes
            this.activeEditorListeners.add(Event.defer(activeCodeEditor.onDidChangeCursorPosition)(() => {
                this.onSelectionChange(activeCodeEditor);
                this.currentProblemStatus.update(activeCodeEditor);
            }));
            // Hook Listener for language changes
            this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelLanguage(() => {
                this.onLanguageChange(activeCodeEditor, activeInput);
            }));
            // Hook Listener for content changes
            this.activeEditorListeners.add(Event.accumulate(activeCodeEditor.onDidChangeModelContent)(e => {
                this.onEOLChange(activeCodeEditor);
                this.currentProblemStatus.update(activeCodeEditor);
                const selections = activeCodeEditor.getSelections();
                if (selections) {
                    for (const inner of e) {
                        for (const change of inner.changes) {
                            if (selections.some(selection => Range.areIntersecting(selection, change.range))) {
                                this.onSelectionChange(activeCodeEditor);
                                break;
                            }
                        }
                    }
                }
            }));
            // Hook Listener for content options changes
            this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelOptions(() => {
                this.onIndentationChange(activeCodeEditor);
            }));
        }
        // Handle binary editors
        else if (activeEditorPane instanceof BaseBinaryResourceEditor || activeEditorPane instanceof BinaryResourceDiffEditor) {
            const binaryEditors = [];
            if (activeEditorPane instanceof BinaryResourceDiffEditor) {
                const primary = activeEditorPane.getPrimaryEditorPane();
                if (primary instanceof BaseBinaryResourceEditor) {
                    binaryEditors.push(primary);
                }
                const secondary = activeEditorPane.getSecondaryEditorPane();
                if (secondary instanceof BaseBinaryResourceEditor) {
                    binaryEditors.push(secondary);
                }
            }
            else {
                binaryEditors.push(activeEditorPane);
            }
            for (const editor of binaryEditors) {
                this.activeEditorListeners.add(editor.onDidChangeMetadata(() => {
                    this.onMetadataChange(activeEditorPane);
                }));
                this.activeEditorListeners.add(editor.onDidOpenInPlace(() => {
                    this.updateStatusBar();
                }));
            }
        }
    }
    onLanguageChange(editorWidget, editorInput) {
        const info = { type: 'languageId', languageId: undefined };
        // We only support text based editors
        if (editorWidget && editorInput && toEditorWithLanguageSupport(editorInput)) {
            const textModel = editorWidget.getModel();
            if (textModel) {
                const languageId = textModel.getLanguageId();
                info.languageId = withNullAsUndefined(this.languageService.getLanguageName(languageId));
            }
        }
        this.updateState(info);
    }
    onIndentationChange(editorWidget) {
        const update = { type: 'indentation', indentation: undefined };
        if (editorWidget) {
            const model = editorWidget.getModel();
            if (model) {
                const modelOpts = model.getOptions();
                update.indentation = (modelOpts.insertSpaces
                    ? modelOpts.tabSize === modelOpts.indentSize
                        ? localize('spacesSize', "Spaces: {0}", modelOpts.indentSize)
                        : localize('spacesAndTabsSize', "Spaces: {0} (Tab Size: {1})", modelOpts.indentSize, modelOpts.tabSize)
                    : localize({ key: 'tabSize', comment: ['Tab corresponds to the tab key'] }, "Tab Size: {0}", modelOpts.tabSize));
            }
        }
        this.updateState(update);
    }
    onMetadataChange(editor) {
        const update = { type: 'metadata', metadata: undefined };
        if (editor instanceof BaseBinaryResourceEditor || editor instanceof BinaryResourceDiffEditor) {
            update.metadata = editor.getMetadata();
        }
        this.updateState(update);
    }
    onColumnSelectionModeChange(editorWidget) {
        const info = { type: 'columnSelectionMode', columnSelectionMode: false };
        if (editorWidget?.getOption(18 /* EditorOption.columnSelection */)) {
            info.columnSelectionMode = true;
        }
        this.updateState(info);
    }
    onScreenReaderModeChange(editorWidget) {
        let screenReaderMode = false;
        // We only support text based editors
        if (editorWidget) {
            const screenReaderDetected = this.accessibilityService.isScreenReaderOptimized();
            if (screenReaderDetected) {
                const screenReaderConfiguration = this.configurationService.getValue('editor')?.accessibilitySupport;
                if (screenReaderConfiguration === 'auto') {
                    if (!this.promptedScreenReader) {
                        this.promptedScreenReader = true;
                        setTimeout(() => this.showScreenReaderNotification(), 100);
                    }
                }
            }
            screenReaderMode = (editorWidget.getOption(2 /* EditorOption.accessibilitySupport */) === 2 /* AccessibilitySupport.Enabled */);
        }
        if (screenReaderMode === false && this.screenReaderNotification) {
            this.screenReaderNotification.close();
        }
        this.updateState({ type: 'screenReaderMode', screenReaderMode: screenReaderMode });
    }
    onSelectionChange(editorWidget) {
        const info = Object.create(null);
        // We only support text based editors
        if (editorWidget) {
            // Compute selection(s)
            info.selections = editorWidget.getSelections() || [];
            // Compute selection length
            info.charactersSelected = 0;
            const textModel = editorWidget.getModel();
            if (textModel) {
                for (const selection of info.selections) {
                    if (typeof info.charactersSelected !== 'number') {
                        info.charactersSelected = 0;
                    }
                    info.charactersSelected += textModel.getCharacterCountInRange(selection);
                }
            }
            // Compute the visible column for one selection. This will properly handle tabs and their configured widths
            if (info.selections.length === 1) {
                const editorPosition = editorWidget.getPosition();
                const selectionClone = new Selection(info.selections[0].selectionStartLineNumber, info.selections[0].selectionStartColumn, info.selections[0].positionLineNumber, editorPosition ? editorWidget.getStatusbarColumn(editorPosition) : info.selections[0].positionColumn);
                info.selections[0] = selectionClone;
            }
        }
        this.updateState({ type: 'selectionStatus', selectionStatus: this.getSelectionLabel(info) });
    }
    onEOLChange(editorWidget) {
        const info = { type: 'EOL', EOL: undefined };
        if (editorWidget && !editorWidget.getOption(82 /* EditorOption.readOnly */)) {
            const codeEditorModel = editorWidget.getModel();
            if (codeEditorModel) {
                info.EOL = codeEditorModel.getEOL();
            }
        }
        this.updateState(info);
    }
    onEncodingChange(editor, editorWidget) {
        if (editor && !this.isActiveEditor(editor)) {
            return;
        }
        const info = { type: 'encoding', encoding: undefined };
        // We only support text based editors that have a model associated
        // This ensures we do not show the encoding picker while an editor
        // is still loading.
        if (editor && editorWidget?.hasModel()) {
            const encodingSupport = editor.input ? toEditorWithEncodingSupport(editor.input) : null;
            if (encodingSupport) {
                const rawEncoding = encodingSupport.getEncoding();
                const encodingInfo = typeof rawEncoding === 'string' ? SUPPORTED_ENCODINGS[rawEncoding] : undefined;
                if (encodingInfo) {
                    info.encoding = encodingInfo.labelShort; // if we have a label, take it from there
                }
                else {
                    info.encoding = rawEncoding; // otherwise use it raw
                }
            }
        }
        this.updateState(info);
    }
    onResourceEncodingChange(resource) {
        const activeEditorPane = this.editorService.activeEditorPane;
        if (activeEditorPane) {
            const activeResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input, { supportSideBySide: SideBySideEditor.PRIMARY });
            if (activeResource && isEqual(activeResource, resource)) {
                const activeCodeEditor = withNullAsUndefined(getCodeEditor(activeEditorPane.getControl()));
                return this.onEncodingChange(activeEditorPane, activeCodeEditor); // only update if the encoding changed for the active resource
            }
        }
    }
    onTabFocusModeChange() {
        const info = { type: 'tabFocusMode', tabFocusMode: TabFocus.getTabFocusMode() };
        this.updateState(info);
    }
    isActiveEditor(control) {
        const activeEditorPane = this.editorService.activeEditorPane;
        return !!activeEditorPane && activeEditorPane === control;
    }
};
EditorStatus = __decorate([
    __param(0, IEditorService),
    __param(1, IQuickInputService),
    __param(2, ILanguageService),
    __param(3, ITextFileService),
    __param(4, IConfigurationService),
    __param(5, INotificationService),
    __param(6, IAccessibilityService),
    __param(7, IStatusbarService),
    __param(8, IInstantiationService)
], EditorStatus);
export { EditorStatus };
let ShowCurrentMarkerInStatusbarContribution = class ShowCurrentMarkerInStatusbarContribution extends Disposable {
    statusbarService;
    markerService;
    configurationService;
    statusBarEntryAccessor;
    editor = undefined;
    markers = [];
    currentMarker = null;
    constructor(statusbarService, markerService, configurationService) {
        super();
        this.statusbarService = statusbarService;
        this.markerService = markerService;
        this.configurationService = configurationService;
        this.statusBarEntryAccessor = this._register(new MutableDisposable());
        this._register(markerService.onMarkerChanged(changedResources => this.onMarkerChanged(changedResources)));
        this._register(Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('problems.showCurrentInStatus'))(() => this.updateStatus()));
    }
    update(editor) {
        this.editor = editor;
        this.updateMarkers();
        this.updateStatus();
    }
    updateStatus() {
        const previousMarker = this.currentMarker;
        this.currentMarker = this.getMarker();
        if (this.hasToUpdateStatus(previousMarker, this.currentMarker)) {
            if (this.currentMarker) {
                const line = splitLines(this.currentMarker.message)[0];
                const text = `${this.getType(this.currentMarker)} ${line}`;
                if (!this.statusBarEntryAccessor.value) {
                    this.statusBarEntryAccessor.value = this.statusbarService.addEntry({ name: localize('currentProblem', "Current Problem"), text: '', ariaLabel: '' }, 'statusbar.currentProblem', 0 /* StatusbarAlignment.LEFT */);
                }
                this.statusBarEntryAccessor.value.update({ name: localize('currentProblem', "Current Problem"), text, ariaLabel: text });
            }
            else {
                this.statusBarEntryAccessor.clear();
            }
        }
    }
    hasToUpdateStatus(previousMarker, currentMarker) {
        if (!currentMarker) {
            return true;
        }
        if (!previousMarker) {
            return true;
        }
        return IMarkerData.makeKey(previousMarker) !== IMarkerData.makeKey(currentMarker);
    }
    getType(marker) {
        switch (marker.severity) {
            case MarkerSeverity.Error: return '$(error)';
            case MarkerSeverity.Warning: return '$(warning)';
            case MarkerSeverity.Info: return '$(info)';
        }
        return '';
    }
    getMarker() {
        if (!this.configurationService.getValue('problems.showCurrentInStatus')) {
            return null;
        }
        if (!this.editor) {
            return null;
        }
        const model = this.editor.getModel();
        if (!model) {
            return null;
        }
        const position = this.editor.getPosition();
        if (!position) {
            return null;
        }
        return this.markers.find(marker => Range.containsPosition(marker, position)) || null;
    }
    onMarkerChanged(changedResources) {
        if (!this.editor) {
            return;
        }
        const model = this.editor.getModel();
        if (!model) {
            return;
        }
        if (model && !changedResources.some(r => isEqual(model.uri, r))) {
            return;
        }
        this.updateMarkers();
    }
    updateMarkers() {
        if (!this.editor) {
            return;
        }
        const model = this.editor.getModel();
        if (!model) {
            return;
        }
        if (model) {
            this.markers = this.markerService.read({
                resource: model.uri,
                severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info
            });
            this.markers.sort(compareMarker);
        }
        else {
            this.markers = [];
        }
        this.updateStatus();
    }
};
ShowCurrentMarkerInStatusbarContribution = __decorate([
    __param(0, IStatusbarService),
    __param(1, IMarkerService),
    __param(2, IConfigurationService)
], ShowCurrentMarkerInStatusbarContribution);
function compareMarker(a, b) {
    let res = compare(a.resource.toString(), b.resource.toString());
    if (res === 0) {
        res = MarkerSeverity.compare(a.severity, b.severity);
    }
    if (res === 0) {
        res = Range.compareRangesUsingStarts(a, b);
    }
    return res;
}
let ShowLanguageExtensionsAction = class ShowLanguageExtensionsAction extends Action {
    fileExtension;
    commandService;
    static ID = 'workbench.action.showLanguageExtensions';
    constructor(fileExtension, commandService, galleryService) {
        super(ShowLanguageExtensionsAction.ID, localize('showLanguageExtensions', "Search Marketplace Extensions for '{0}'...", fileExtension));
        this.fileExtension = fileExtension;
        this.commandService = commandService;
        this.enabled = galleryService.isEnabled();
    }
    async run() {
        await this.commandService.executeCommand('workbench.extensions.action.showExtensionsForLanguage', this.fileExtension);
    }
};
ShowLanguageExtensionsAction = __decorate([
    __param(1, ICommandService),
    __param(2, IExtensionGalleryService)
], ShowLanguageExtensionsAction);
export { ShowLanguageExtensionsAction };
let ChangeLanguageAction = class ChangeLanguageAction extends Action {
    languageService;
    editorService;
    configurationService;
    quickInputService;
    preferencesService;
    instantiationService;
    textFileService;
    telemetryService;
    languageDetectionService;
    static ID = 'workbench.action.editor.changeLanguageMode';
    static LABEL = localize('changeMode', "Change Language Mode");
    constructor(actionId, actionLabel, languageService, editorService, configurationService, quickInputService, preferencesService, instantiationService, textFileService, telemetryService, languageDetectionService) {
        super(actionId, actionLabel);
        this.languageService = languageService;
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.quickInputService = quickInputService;
        this.preferencesService = preferencesService;
        this.instantiationService = instantiationService;
        this.textFileService = textFileService;
        this.telemetryService = telemetryService;
        this.languageDetectionService = languageDetectionService;
    }
    async run(event, data) {
        const activeTextEditorControl = getCodeEditor(this.editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            await this.quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        const textModel = activeTextEditorControl.getModel();
        const resource = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
        // Compute language
        let currentLanguageName;
        let currentLanguageId;
        if (textModel) {
            currentLanguageId = textModel.getLanguageId();
            currentLanguageName = withNullAsUndefined(this.languageService.getLanguageName(currentLanguageId));
        }
        let hasLanguageSupport = !!resource;
        if (resource?.scheme === Schemas.untitled && !this.textFileService.untitled.get(resource)?.hasAssociatedFilePath) {
            hasLanguageSupport = false; // no configuration for untitled resources (e.g. "Untitled-1")
        }
        // All languages are valid picks
        const languages = this.languageService.getSortedRegisteredLanguageNames();
        const picks = languages
            .map(({ languageName, languageId }) => {
            const extensions = this.languageService.getExtensions(languageId).join(' ');
            let description;
            if (currentLanguageName === languageName) {
                description = localize('languageDescription', "({0}) - Configured Language", languageId);
            }
            else {
                description = localize('languageDescriptionConfigured', "({0})", languageId);
            }
            return {
                label: languageName,
                meta: extensions,
                iconClasses: getIconClassesForLanguageId(languageId),
                description
            };
        });
        picks.unshift({ type: 'separator', label: localize('languagesPicks', "languages (identifier)") });
        // Offer action to configure via settings
        let configureLanguageAssociations;
        let configureLanguageSettings;
        let galleryAction;
        if (hasLanguageSupport && resource) {
            const ext = extname(resource) || basename(resource);
            galleryAction = this.instantiationService.createInstance(ShowLanguageExtensionsAction, ext);
            if (galleryAction.enabled) {
                picks.unshift(galleryAction);
            }
            configureLanguageSettings = { label: localize('configureModeSettings', "Configure '{0}' language based settings...", currentLanguageName) };
            picks.unshift(configureLanguageSettings);
            configureLanguageAssociations = { label: localize('configureAssociationsExt', "Configure File Association for '{0}'...", ext) };
            picks.unshift(configureLanguageAssociations);
        }
        // Offer to "Auto Detect"
        const autoDetectLanguage = {
            label: localize('autoDetect', "Auto Detect")
        };
        picks.unshift(autoDetectLanguage);
        const pick = await this.quickInputService.pick(picks, { placeHolder: localize('pickLanguage', "Select Language Mode"), matchOnDescription: true });
        if (!pick) {
            return;
        }
        if (pick === galleryAction) {
            galleryAction.run();
            return;
        }
        // User decided to permanently configure associations, return right after
        if (pick === configureLanguageAssociations) {
            if (resource) {
                this.configureFileAssociation(resource);
            }
            return;
        }
        // User decided to configure settings for current language
        if (pick === configureLanguageSettings) {
            this.preferencesService.openUserSettings({ jsonEditor: true, revealSetting: { key: `[${withUndefinedAsNull(currentLanguageId)}]`, edit: true } });
            return;
        }
        // Change language for active editor
        const activeEditor = this.editorService.activeEditor;
        if (activeEditor) {
            const languageSupport = toEditorWithLanguageSupport(activeEditor);
            if (languageSupport) {
                // Find language
                let languageSelection;
                let detectedLanguage;
                if (pick === autoDetectLanguage) {
                    if (textModel) {
                        const resource = EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
                        if (resource) {
                            // Detect languages since we are in an untitled file
                            let languageId = withNullAsUndefined(this.languageService.guessLanguageIdByFilepathOrFirstLine(resource, textModel.getLineContent(1)));
                            if (!languageId || languageId === 'unknown') {
                                detectedLanguage = await this.languageDetectionService.detectLanguage(resource);
                                languageId = detectedLanguage;
                            }
                            if (languageId) {
                                languageSelection = this.languageService.createById(languageId);
                            }
                        }
                    }
                }
                else {
                    const languageId = this.languageService.getLanguageIdByLanguageName(pick.label);
                    languageSelection = this.languageService.createById(languageId);
                    if (resource) {
                        // fire and forget to not slow things down
                        this.languageDetectionService.detectLanguage(resource).then(detectedLanguageId => {
                            const chosenLanguageId = this.languageService.getLanguageIdByLanguageName(pick.label) || 'unknown';
                            if (detectedLanguageId === currentLanguageId && currentLanguageId !== chosenLanguageId) {
                                // If they didn't choose the detected language (which should also be the active language if automatic detection is enabled)
                                // then the automatic language detection was likely wrong and the user is correcting it. In this case, we want telemetry.
                                // Keep track of what model was preferred and length of input to help track down potential differences between the result quality across models and content size.
                                const modelPreference = this.configurationService.getValue('workbench.editor.preferHistoryBasedLanguageDetection') ? 'history' : 'classic';
                                this.telemetryService.publicLog2(AutomaticLanguageDetectionLikelyWrongId, {
                                    currentLanguageId: currentLanguageName ?? 'unknown',
                                    nextLanguageId: pick.label,
                                    lineCount: textModel?.getLineCount() ?? -1,
                                    modelPreference,
                                });
                            }
                        });
                    }
                }
                // Change language
                if (typeof languageSelection !== 'undefined') {
                    languageSupport.setLanguageId(languageSelection.languageId, ChangeLanguageAction.ID);
                    if (resource?.scheme === Schemas.untitled) {
                        const modelPreference = this.configurationService.getValue('workbench.editor.preferHistoryBasedLanguageDetection') ? 'history' : 'classic';
                        this.telemetryService.publicLog2('setUntitledDocumentLanguage', {
                            to: languageSelection.languageId,
                            from: currentLanguageId ?? 'none',
                            modelPreference,
                        });
                    }
                }
            }
            activeTextEditorControl.focus();
        }
    }
    configureFileAssociation(resource) {
        const extension = extname(resource);
        const base = basename(resource);
        const currentAssociation = this.languageService.guessLanguageIdByFilepathOrFirstLine(URI.file(base));
        const languages = this.languageService.getSortedRegisteredLanguageNames();
        const picks = languages.map(({ languageName, languageId }) => {
            return {
                id: languageId,
                label: languageName,
                iconClasses: getIconClassesForLanguageId(languageId),
                description: (languageId === currentAssociation) ? localize('currentAssociation', "Current Association") : undefined
            };
        });
        setTimeout(async () => {
            const language = await this.quickInputService.pick(picks, { placeHolder: localize('pickLanguageToConfigure', "Select Language Mode to Associate with '{0}'", extension || base) });
            if (language) {
                const fileAssociationsConfig = this.configurationService.inspect(FILES_ASSOCIATIONS_CONFIG);
                let associationKey;
                if (extension && base[0] !== '.') {
                    associationKey = `*${extension}`; // only use "*.ext" if the file path is in the form of <name>.<ext>
                }
                else {
                    associationKey = base; // otherwise use the basename (e.g. .gitignore, Dockerfile)
                }
                // If the association is already being made in the workspace, make sure to target workspace settings
                let target = 2 /* ConfigurationTarget.USER */;
                if (fileAssociationsConfig.workspaceValue && !!fileAssociationsConfig.workspaceValue[associationKey]) {
                    target = 5 /* ConfigurationTarget.WORKSPACE */;
                }
                // Make sure to write into the value of the target and not the merged value from USER and WORKSPACE config
                const currentAssociations = deepClone((target === 5 /* ConfigurationTarget.WORKSPACE */) ? fileAssociationsConfig.workspaceValue : fileAssociationsConfig.userValue) || Object.create(null);
                currentAssociations[associationKey] = language.id;
                this.configurationService.updateValue(FILES_ASSOCIATIONS_CONFIG, currentAssociations, target);
            }
        }, 50 /* quick input is sensitive to being opened so soon after another */);
    }
};
ChangeLanguageAction = __decorate([
    __param(2, ILanguageService),
    __param(3, IEditorService),
    __param(4, IConfigurationService),
    __param(5, IQuickInputService),
    __param(6, IPreferencesService),
    __param(7, IInstantiationService),
    __param(8, ITextFileService),
    __param(9, ITelemetryService),
    __param(10, ILanguageDetectionService)
], ChangeLanguageAction);
export { ChangeLanguageAction };
let ChangeEOLAction = class ChangeEOLAction extends Action {
    editorService;
    quickInputService;
    static ID = 'workbench.action.editor.changeEOL';
    static LABEL = localize('changeEndOfLine', "Change End of Line Sequence");
    constructor(actionId, actionLabel, editorService, quickInputService) {
        super(actionId, actionLabel);
        this.editorService = editorService;
        this.quickInputService = quickInputService;
    }
    async run() {
        const activeTextEditorControl = getCodeEditor(this.editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            await this.quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        if (this.editorService.activeEditor?.hasCapability(2 /* EditorInputCapabilities.Readonly */)) {
            await this.quickInputService.pick([{ label: localize('noWritableCodeEditor', "The active code editor is read-only.") }]);
            return;
        }
        let textModel = activeTextEditorControl.getModel();
        const EOLOptions = [
            { label: nlsEOLLF, eol: 0 /* EndOfLineSequence.LF */ },
            { label: nlsEOLCRLF, eol: 1 /* EndOfLineSequence.CRLF */ },
        ];
        const selectedIndex = (textModel?.getEOL() === '\n') ? 0 : 1;
        const eol = await this.quickInputService.pick(EOLOptions, { placeHolder: localize('pickEndOfLine', "Select End of Line Sequence"), activeItem: EOLOptions[selectedIndex] });
        if (eol) {
            const activeCodeEditor = getCodeEditor(this.editorService.activeTextEditorControl);
            if (activeCodeEditor?.hasModel() && !this.editorService.activeEditor?.hasCapability(2 /* EditorInputCapabilities.Readonly */)) {
                textModel = activeCodeEditor.getModel();
                textModel.pushStackElement();
                textModel.pushEOL(eol.eol);
                textModel.pushStackElement();
            }
        }
        activeTextEditorControl.focus();
    }
};
ChangeEOLAction = __decorate([
    __param(2, IEditorService),
    __param(3, IQuickInputService)
], ChangeEOLAction);
export { ChangeEOLAction };
let ChangeEncodingAction = class ChangeEncodingAction extends Action {
    editorService;
    quickInputService;
    textResourceConfigurationService;
    fileService;
    textFileService;
    static ID = 'workbench.action.editor.changeEncoding';
    static LABEL = localize('changeEncoding', "Change File Encoding");
    constructor(actionId, actionLabel, editorService, quickInputService, textResourceConfigurationService, fileService, textFileService) {
        super(actionId, actionLabel);
        this.editorService = editorService;
        this.quickInputService = quickInputService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.fileService = fileService;
        this.textFileService = textFileService;
    }
    async run() {
        const activeTextEditorControl = getCodeEditor(this.editorService.activeTextEditorControl);
        if (!activeTextEditorControl) {
            await this.quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        const activeEditorPane = this.editorService.activeEditorPane;
        if (!activeEditorPane) {
            await this.quickInputService.pick([{ label: localize('noEditor', "No text editor active at this time") }]);
            return;
        }
        const encodingSupport = toEditorWithEncodingSupport(activeEditorPane.input);
        if (!encodingSupport) {
            await this.quickInputService.pick([{ label: localize('noFileEditor', "No file active at this time") }]);
            return;
        }
        const saveWithEncodingPick = { label: localize('saveWithEncoding', "Save with Encoding") };
        const reopenWithEncodingPick = { label: localize('reopenWithEncoding', "Reopen with Encoding") };
        if (!Language.isDefaultVariant()) {
            const saveWithEncodingAlias = 'Save with Encoding';
            if (saveWithEncodingAlias !== saveWithEncodingPick.label) {
                saveWithEncodingPick.detail = saveWithEncodingAlias;
            }
            const reopenWithEncodingAlias = 'Reopen with Encoding';
            if (reopenWithEncodingAlias !== reopenWithEncodingPick.label) {
                reopenWithEncodingPick.detail = reopenWithEncodingAlias;
            }
        }
        let action;
        if (encodingSupport instanceof UntitledTextEditorInput) {
            action = saveWithEncodingPick;
        }
        else if (activeEditorPane.input.hasCapability(2 /* EditorInputCapabilities.Readonly */)) {
            action = reopenWithEncodingPick;
        }
        else {
            action = await this.quickInputService.pick([reopenWithEncodingPick, saveWithEncodingPick], { placeHolder: localize('pickAction', "Select Action"), matchOnDetail: true });
        }
        if (!action) {
            return;
        }
        await timeout(50); // quick input is sensitive to being opened so soon after another
        const resource = EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: SideBySideEditor.PRIMARY });
        if (!resource || (!this.fileService.hasProvider(resource) && resource.scheme !== Schemas.untitled)) {
            return; // encoding detection only possible for resources the file service can handle or that are untitled
        }
        let guessedEncoding = undefined;
        if (this.fileService.hasProvider(resource)) {
            const content = await this.textFileService.readStream(resource, { autoGuessEncoding: true });
            guessedEncoding = content.encoding;
        }
        const isReopenWithEncoding = (action === reopenWithEncodingPick);
        const configuredEncoding = this.textResourceConfigurationService.getValue(withNullAsUndefined(resource), 'files.encoding');
        let directMatchIndex;
        let aliasMatchIndex;
        // All encodings are valid picks
        const picks = Object.keys(SUPPORTED_ENCODINGS)
            .sort((k1, k2) => {
            if (k1 === configuredEncoding) {
                return -1;
            }
            else if (k2 === configuredEncoding) {
                return 1;
            }
            return SUPPORTED_ENCODINGS[k1].order - SUPPORTED_ENCODINGS[k2].order;
        })
            .filter(k => {
            if (k === guessedEncoding && guessedEncoding !== configuredEncoding) {
                return false; // do not show encoding if it is the guessed encoding that does not match the configured
            }
            return !isReopenWithEncoding || !SUPPORTED_ENCODINGS[k].encodeOnly; // hide those that can only be used for encoding if we are about to decode
        })
            .map((key, index) => {
            if (key === encodingSupport.getEncoding()) {
                directMatchIndex = index;
            }
            else if (SUPPORTED_ENCODINGS[key].alias === encodingSupport.getEncoding()) {
                aliasMatchIndex = index;
            }
            return { id: key, label: SUPPORTED_ENCODINGS[key].labelLong, description: key };
        });
        const items = picks.slice();
        // If we have a guessed encoding, show it first unless it matches the configured encoding
        if (guessedEncoding && configuredEncoding !== guessedEncoding && SUPPORTED_ENCODINGS[guessedEncoding]) {
            picks.unshift({ type: 'separator' });
            picks.unshift({ id: guessedEncoding, label: SUPPORTED_ENCODINGS[guessedEncoding].labelLong, description: localize('guessedEncoding', "Guessed from content") });
        }
        const encoding = await this.quickInputService.pick(picks, {
            placeHolder: isReopenWithEncoding ? localize('pickEncodingForReopen', "Select File Encoding to Reopen File") : localize('pickEncodingForSave', "Select File Encoding to Save with"),
            activeItem: items[typeof directMatchIndex === 'number' ? directMatchIndex : typeof aliasMatchIndex === 'number' ? aliasMatchIndex : -1]
        });
        if (!encoding) {
            return;
        }
        if (!this.editorService.activeEditorPane) {
            return;
        }
        const activeEncodingSupport = toEditorWithEncodingSupport(this.editorService.activeEditorPane.input);
        if (typeof encoding.id !== 'undefined' && activeEncodingSupport) {
            await activeEncodingSupport.setEncoding(encoding.id, isReopenWithEncoding ? 1 /* EncodingMode.Decode */ : 0 /* EncodingMode.Encode */); // Set new encoding
        }
        activeTextEditorControl.focus();
    }
};
ChangeEncodingAction = __decorate([
    __param(2, IEditorService),
    __param(3, IQuickInputService),
    __param(4, ITextResourceConfigurationService),
    __param(5, IFileService),
    __param(6, ITextFileService)
], ChangeEncodingAction);
export { ChangeEncodingAction };
