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
import { PixelRatio } from 'vs/base/browser/browser';
import { append, $, addStandardDisposableListener } from 'vs/base/browser/dom';
import { BareFontInfo } from 'vs/editor/common/config/fontInfo';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchTable } from 'vs/platform/list/browser/listService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { editorBackground } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST, DISASSEMBLY_VIEW_ID, IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import * as icons from 'vs/workbench/contrib/debug/browser/debugIcons';
import { StringBuilder } from 'vs/editor/common/core/stringBuilder';
import { dispose, Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { topStackFrameColor, focusedStackFrameColor } from 'vs/workbench/contrib/debug/browser/callStackEditorContribution';
import { InstructionBreakpoint } from 'vs/workbench/contrib/debug/common/debugModel';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { isCodeEditor } from 'vs/editor/browser/editorBrowser';
import { getUriFromSource } from 'vs/workbench/contrib/debug/common/debugSource';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { Range } from 'vs/editor/common/core/range';
import { URI } from 'vs/base/common/uri';
import { isUri } from 'vs/workbench/contrib/debug/common/debugUtils';
import { isAbsolute } from 'vs/base/common/path';
import { applyFontInfo } from 'vs/editor/browser/config/domFontInfo';
import { binarySearch2 } from 'vs/base/common/arrays';
// Special entry as a placeholer when disassembly is not available
const disassemblyNotAvailable = {
    allowBreakpoint: false,
    isBreakpointSet: false,
    isBreakpointEnabled: false,
    instruction: {
        address: '-1',
        instruction: localize('instructionNotAvailable', "Disassembly not available.")
    },
    instructionAddress: BigInt(-1)
};
let DisassemblyView = class DisassemblyView extends EditorPane {
    _configurationService;
    _instantiationService;
    _debugService;
    static NUM_INSTRUCTIONS_TO_LOAD = 50;
    // Used in instruction renderer
    _fontInfo;
    _disassembledInstructions;
    _onDidChangeStackFrame;
    _previousDebuggingState;
    _instructionBpList = [];
    _enableSourceCodeRender = true;
    _loadingLock = false;
    constructor(telemetryService, themeService, storageService, _configurationService, _instantiationService, _debugService) {
        super(DISASSEMBLY_VIEW_ID, telemetryService, themeService, storageService);
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._debugService = _debugService;
        this._disassembledInstructions = undefined;
        this._onDidChangeStackFrame = new Emitter();
        this._previousDebuggingState = _debugService.state;
        this._fontInfo = BareFontInfo.createFromRawSettings(_configurationService.getValue('editor'), PixelRatio.value);
        this._register(_configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('editor')) {
                this._fontInfo = BareFontInfo.createFromRawSettings(_configurationService.getValue('editor'), PixelRatio.value);
            }
            if (e.affectsConfiguration('debug')) {
                // show/hide source code requires changing height which WorkbenchTable doesn't support dynamic height, thus force a total reload.
                const newValue = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
                if (this._enableSourceCodeRender !== newValue) {
                    this._enableSourceCodeRender = newValue;
                    this.reloadDisassembly(undefined);
                }
                else {
                    this._disassembledInstructions?.rerender();
                }
            }
        }));
    }
    get fontInfo() { return this._fontInfo; }
    get currentInstructionAddresses() {
        return this._debugService.getModel().getSessions(false).
            map(session => session.getAllThreads()).
            reduce((prev, curr) => prev.concat(curr), []).
            map(thread => thread.getTopStackFrame()).
            map(frame => frame?.instructionPointerReference);
    }
    // Instruction address of the top stack frame of the focused stack
    get focusedCurrentInstructionAddress() {
        return this._debugService.getViewModel().focusedStackFrame?.thread.getTopStackFrame()?.instructionPointerReference;
    }
    get focusedInstructionAddress() {
        return this._debugService.getViewModel().focusedStackFrame?.instructionPointerReference;
    }
    get isSourceCodeRender() { return this._enableSourceCodeRender; }
    get debugSession() {
        return this._debugService.getViewModel().focusedSession;
    }
    get onDidChangeStackFrame() { return this._onDidChangeStackFrame.event; }
    createEditor(parent) {
        this._enableSourceCodeRender = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
        const lineHeight = this.fontInfo.lineHeight;
        const thisOM = this;
        const delegate = new class {
            headerRowHeight = 0; // No header
            getHeight(row) {
                if (thisOM.isSourceCodeRender && row.instruction.location?.path && row.instruction.line) {
                    // instruction line + source lines
                    if (row.instruction.endLine) {
                        return lineHeight * (row.instruction.endLine - row.instruction.line + 2);
                    }
                    else {
                        // source is only a single line.
                        return lineHeight * 2;
                    }
                }
                // just instruction line
                return lineHeight;
            }
        };
        const instructionRenderer = this._register(this._instantiationService.createInstance(InstructionRenderer, this));
        this._disassembledInstructions = this._register(this._instantiationService.createInstance(WorkbenchTable, 'DisassemblyView', parent, delegate, [
            {
                label: '',
                tooltip: '',
                weight: 0,
                minimumWidth: this.fontInfo.lineHeight,
                maximumWidth: this.fontInfo.lineHeight,
                templateId: BreakpointRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
            {
                label: localize('disassemblyTableColumnLabel', "instructions"),
                tooltip: '',
                weight: 0.3,
                templateId: InstructionRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
        ], [
            this._instantiationService.createInstance(BreakpointRenderer, this),
            instructionRenderer,
        ], {
            identityProvider: { getId: (e) => e.instruction.address },
            horizontalScrolling: false,
            overrideStyles: {
                listBackground: editorBackground
            },
            multipleSelectionSupport: false,
            setRowLineHeight: false,
            openOnSingleClick: false,
            accessibilityProvider: new AccessibilityProvider(),
            mouseSupport: false
        }));
        this.reloadDisassembly();
        this._register(this._disassembledInstructions.onDidScroll(e => {
            if (this._loadingLock) {
                return;
            }
            if (e.oldScrollTop > e.scrollTop && e.scrollTop < e.height) {
                this._loadingLock = true;
                const topElement = Math.floor(e.scrollTop / this.fontInfo.lineHeight) + DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD;
                this.scrollUp_LoadDisassembledInstructions(DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD).then((success) => {
                    if (success) {
                        this._disassembledInstructions.reveal(topElement, 0);
                    }
                    this._loadingLock = false;
                });
            }
            else if (e.oldScrollTop < e.scrollTop && e.scrollTop + e.height > e.scrollHeight - e.height) {
                this._loadingLock = true;
                this.scrollDown_LoadDisassembledInstructions(DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD).then(() => { this._loadingLock = false; });
            }
        }));
        this._register(this._debugService.getViewModel().onDidFocusStackFrame((stackFrame) => {
            if (this._disassembledInstructions) {
                this.goToAddress();
                this._onDidChangeStackFrame.fire();
            }
        }));
        // refresh breakpoints view
        this._register(this._debugService.getModel().onDidChangeBreakpoints(bpEvent => {
            if (bpEvent && this._disassembledInstructions) {
                // draw viewable BP
                let changed = false;
                bpEvent.added?.forEach((bp) => {
                    if (bp instanceof InstructionBreakpoint) {
                        const index = this.getIndexFromAddress(bp.instructionReference);
                        if (index >= 0) {
                            this._disassembledInstructions.row(index).isBreakpointSet = true;
                            this._disassembledInstructions.row(index).isBreakpointEnabled = bp.enabled;
                            changed = true;
                        }
                    }
                });
                bpEvent.removed?.forEach((bp) => {
                    if (bp instanceof InstructionBreakpoint) {
                        const index = this.getIndexFromAddress(bp.instructionReference);
                        if (index >= 0) {
                            this._disassembledInstructions.row(index).isBreakpointSet = false;
                            changed = true;
                        }
                    }
                });
                bpEvent.changed?.forEach((bp) => {
                    if (bp instanceof InstructionBreakpoint) {
                        const index = this.getIndexFromAddress(bp.instructionReference);
                        if (index >= 0) {
                            if (this._disassembledInstructions.row(index).isBreakpointEnabled !== bp.enabled) {
                                this._disassembledInstructions.row(index).isBreakpointEnabled = bp.enabled;
                                changed = true;
                            }
                        }
                    }
                });
                // get an updated list so that items beyond the current range would render when reached.
                this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
                if (changed) {
                    this._onDidChangeStackFrame.fire();
                }
            }
        }));
        this._register(this._debugService.onDidChangeState(e => {
            if ((e === 3 /* State.Running */ || e === 2 /* State.Stopped */) &&
                (this._previousDebuggingState !== 3 /* State.Running */ && this._previousDebuggingState !== 2 /* State.Stopped */)) {
                // Just started debugging, clear the view
                this._disassembledInstructions?.splice(0, this._disassembledInstructions.length, [disassemblyNotAvailable]);
                this._enableSourceCodeRender = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
            }
            this._previousDebuggingState = e;
        }));
    }
    layout(dimension) {
        this._disassembledInstructions?.layout(dimension.height);
    }
    /**
     * Go to the address provided. If no address is provided, reveal the address of the currently focused stack frame.
     */
    goToAddress(address, focus) {
        if (!this._disassembledInstructions) {
            return;
        }
        if (!address) {
            address = this.focusedInstructionAddress;
        }
        if (!address) {
            return;
        }
        const index = this.getIndexFromAddress(address);
        if (index >= 0) {
            this._disassembledInstructions.reveal(index);
            if (focus) {
                this._disassembledInstructions.domFocus();
                this._disassembledInstructions.setFocus([index]);
            }
        }
        else if (this._debugService.state === 2 /* State.Stopped */) {
            // Address is not provided or not in the table currently, clear the table
            // and reload if we are in the state where we can load disassembly.
            this.reloadDisassembly(address);
        }
    }
    async scrollUp_LoadDisassembledInstructions(instructionCount) {
        if (this._disassembledInstructions && this._disassembledInstructions.length > 0) {
            const address = this._disassembledInstructions?.row(0).instruction.address;
            return this.loadDisassembledInstructions(address, -instructionCount, instructionCount);
        }
        return false;
    }
    async scrollDown_LoadDisassembledInstructions(instructionCount) {
        if (this._disassembledInstructions && this._disassembledInstructions.length > 0) {
            const address = this._disassembledInstructions?.row(this._disassembledInstructions?.length - 1).instruction.address;
            return this.loadDisassembledInstructions(address, 1, instructionCount);
        }
        return false;
    }
    async loadDisassembledInstructions(address, instructionOffset, instructionCount) {
        // if address is null, then use current stack frame.
        if (!address || address === '-1') {
            address = this.focusedInstructionAddress;
        }
        if (!address) {
            return false;
        }
        // console.log(`DisassemblyView: loadDisassembledInstructions ${address}, ${instructionOffset}, ${instructionCount}`);
        const session = this.debugSession;
        const resultEntries = await session?.disassemble(address, 0, instructionOffset, instructionCount);
        if (session && resultEntries && this._disassembledInstructions) {
            const newEntries = [];
            let lastLocation;
            let lastLine;
            for (let i = 0; i < resultEntries.length; i++) {
                const found = this._instructionBpList.find(p => p.instructionReference === resultEntries[i].address);
                const instruction = resultEntries[i];
                // Forward fill the missing location as detailed in the DAP spec.
                if (instruction.location) {
                    lastLocation = instruction.location;
                    lastLine = undefined;
                }
                if (instruction.line) {
                    const currentLine = {
                        startLineNumber: instruction.line,
                        startColumn: instruction.column ?? 0,
                        endLineNumber: instruction.endLine ?? instruction.line,
                        endColumn: instruction.endColumn ?? 0,
                    };
                    // Add location only to the first unique range. This will give the appearance of grouping of instructions.
                    if (!Range.equalsRange(currentLine, lastLine ?? null)) {
                        lastLine = currentLine;
                        instruction.location = lastLocation;
                    }
                }
                newEntries.push({ allowBreakpoint: true, isBreakpointSet: found !== undefined, isBreakpointEnabled: !!found?.enabled, instruction: instruction });
            }
            const specialEntriesToRemove = this._disassembledInstructions.length === 1 ? 1 : 0;
            // request is either at the start or end
            if (instructionOffset >= 0) {
                this._disassembledInstructions.splice(this._disassembledInstructions.length, specialEntriesToRemove, newEntries);
            }
            else {
                this._disassembledInstructions.splice(0, specialEntriesToRemove, newEntries);
            }
            return true;
        }
        return false;
    }
    getIndexFromAddress(instructionAddress) {
        const disassembledInstructions = this._disassembledInstructions;
        if (disassembledInstructions && disassembledInstructions.length > 0) {
            const address = BigInt(instructionAddress);
            if (address) {
                return binarySearch2(disassembledInstructions.length, index => {
                    const row = disassembledInstructions.row(index);
                    this.ensureAddressParsed(row);
                    if (row.instructionAddress > address) {
                        return 1;
                    }
                    else if (row.instructionAddress < address) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
            }
        }
        return -1;
    }
    ensureAddressParsed(entry) {
        if (entry.instructionAddress !== undefined) {
            return;
        }
        else {
            entry.instructionAddress = BigInt(entry.instruction.address);
        }
    }
    /**
     * Clears the table and reload instructions near the target address
     */
    reloadDisassembly(targetAddress) {
        if (this._disassembledInstructions) {
            this._loadingLock = true; // stop scrolling during the load.
            this._disassembledInstructions.splice(0, this._disassembledInstructions.length, [disassemblyNotAvailable]);
            this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
            this.loadDisassembledInstructions(targetAddress, -DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD * 4, DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD * 8).then(() => {
                // on load, set the target instruction in the middle of the page.
                if (this._disassembledInstructions.length > 0) {
                    const targetIndex = Math.floor(this._disassembledInstructions.length / 2);
                    this._disassembledInstructions.reveal(targetIndex, 0.5);
                    // Always focus the target address on reload, or arrow key navigation would look terrible
                    this._disassembledInstructions.domFocus();
                    this._disassembledInstructions.setFocus([targetIndex]);
                }
                this._loadingLock = false;
            });
        }
    }
};
DisassemblyView = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IStorageService),
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __param(5, IDebugService)
], DisassemblyView);
export { DisassemblyView };
let BreakpointRenderer = class BreakpointRenderer {
    _disassemblyView;
    _debugService;
    static TEMPLATE_ID = 'breakpoint';
    templateId = BreakpointRenderer.TEMPLATE_ID;
    _breakpointIcon = 'codicon-' + icons.breakpoint.regular.id;
    _breakpointDisabledIcon = 'codicon-' + icons.breakpoint.disabled.id;
    _breakpointHintIcon = 'codicon-' + icons.debugBreakpointHint.id;
    _debugStackframe = 'codicon-' + icons.debugStackframe.id;
    _debugStackframeFocused = 'codicon-' + icons.debugStackframeFocused.id;
    constructor(_disassemblyView, _debugService) {
        this._disassemblyView = _disassemblyView;
        this._debugService = _debugService;
    }
    renderTemplate(container) {
        // align from the bottom so that it lines up with instruction when source code is present.
        container.style.alignSelf = 'flex-end';
        const icon = append(container, $('.disassembly-view'));
        icon.classList.add('codicon');
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.height = this._disassemblyView.fontInfo.lineHeight + 'px';
        const currentElement = { element: undefined };
        const disposables = [
            this._disassemblyView.onDidChangeStackFrame(() => this.rerenderDebugStackframe(icon, currentElement.element)),
            addStandardDisposableListener(container, 'mouseover', () => {
                if (currentElement.element?.allowBreakpoint) {
                    icon.classList.add(this._breakpointHintIcon);
                }
            }),
            addStandardDisposableListener(container, 'mouseout', () => {
                if (currentElement.element?.allowBreakpoint) {
                    icon.classList.remove(this._breakpointHintIcon);
                }
            }),
            addStandardDisposableListener(container, 'click', () => {
                if (currentElement.element?.allowBreakpoint) {
                    // click show hint while waiting for BP to resolve.
                    icon.classList.add(this._breakpointHintIcon);
                    if (currentElement.element.isBreakpointSet) {
                        this._debugService.removeInstructionBreakpoints(currentElement.element.instruction.address);
                    }
                    else if (currentElement.element.allowBreakpoint && !currentElement.element.isBreakpointSet) {
                        this._debugService.addInstructionBreakpoint(currentElement.element.instruction.address, 0);
                    }
                }
            })
        ];
        return { currentElement, icon, disposables };
    }
    renderElement(element, index, templateData, height) {
        templateData.currentElement.element = element;
        this.rerenderDebugStackframe(templateData.icon, element);
    }
    disposeTemplate(templateData) {
        dispose(templateData.disposables);
        templateData.disposables = [];
    }
    rerenderDebugStackframe(icon, element) {
        if (element?.instruction.address === this._disassemblyView.focusedCurrentInstructionAddress) {
            icon.classList.add(this._debugStackframe);
        }
        else if (element?.instruction.address === this._disassemblyView.focusedInstructionAddress) {
            icon.classList.add(this._debugStackframeFocused);
        }
        else {
            icon.classList.remove(this._debugStackframe);
            icon.classList.remove(this._debugStackframeFocused);
        }
        icon.classList.remove(this._breakpointHintIcon);
        if (element?.isBreakpointSet) {
            if (element.isBreakpointEnabled) {
                icon.classList.add(this._breakpointIcon);
                icon.classList.remove(this._breakpointDisabledIcon);
            }
            else {
                icon.classList.remove(this._breakpointIcon);
                icon.classList.add(this._breakpointDisabledIcon);
            }
        }
        else {
            icon.classList.remove(this._breakpointIcon);
            icon.classList.remove(this._breakpointDisabledIcon);
        }
    }
};
BreakpointRenderer = __decorate([
    __param(1, IDebugService)
], BreakpointRenderer);
let InstructionRenderer = class InstructionRenderer extends Disposable {
    _disassemblyView;
    editorService;
    textModelService;
    uriService;
    static TEMPLATE_ID = 'instruction';
    static INSTRUCTION_ADDR_MIN_LENGTH = 25;
    static INSTRUCTION_BYTES_MIN_LENGTH = 30;
    templateId = InstructionRenderer.TEMPLATE_ID;
    _topStackFrameColor;
    _focusedStackFrameColor;
    constructor(_disassemblyView, themeService, editorService, textModelService, uriService) {
        super();
        this._disassemblyView = _disassemblyView;
        this.editorService = editorService;
        this.textModelService = textModelService;
        this.uriService = uriService;
        this._topStackFrameColor = themeService.getColorTheme().getColor(topStackFrameColor);
        this._focusedStackFrameColor = themeService.getColorTheme().getColor(focusedStackFrameColor);
        this._register(themeService.onDidColorThemeChange(e => {
            this._topStackFrameColor = e.getColor(topStackFrameColor);
            this._focusedStackFrameColor = e.getColor(focusedStackFrameColor);
        }));
    }
    renderTemplate(container) {
        const sourcecode = append(container, $('.sourcecode'));
        const instruction = append(container, $('.instruction'));
        this.applyFontInfo(sourcecode);
        this.applyFontInfo(instruction);
        const currentElement = { element: undefined };
        const cellDisposable = [];
        const disposables = [
            this._disassemblyView.onDidChangeStackFrame(() => this.rerenderBackground(instruction, sourcecode, currentElement.element)),
            addStandardDisposableListener(sourcecode, 'dblclick', () => this.openSourceCode(currentElement.element?.instruction)),
        ];
        return { currentElement, instruction, sourcecode, cellDisposable, disposables };
    }
    renderElement(element, index, templateData, height) {
        this.renderElementInner(element, index, templateData, height);
    }
    async renderElementInner(element, index, templateData, height) {
        templateData.currentElement.element = element;
        const instruction = element.instruction;
        templateData.sourcecode.innerText = '';
        const sb = new StringBuilder(1000);
        if (this._disassemblyView.isSourceCodeRender && instruction.location?.path && instruction.line) {
            const sourceURI = this.getUriFromSource(instruction);
            if (sourceURI) {
                let textModel = undefined;
                const sourceSB = new StringBuilder(10000);
                const ref = await this.textModelService.createModelReference(sourceURI);
                textModel = ref.object.textEditorModel;
                templateData.cellDisposable.push(ref);
                // templateData could have moved on during async.  Double check if it is still the same source.
                if (textModel && templateData.currentElement.element === element) {
                    let lineNumber = instruction.line;
                    while (lineNumber && lineNumber >= 1 && lineNumber <= textModel.getLineCount()) {
                        const lineContent = textModel.getLineContent(lineNumber);
                        sourceSB.appendString(`  ${lineNumber}: `);
                        sourceSB.appendString(lineContent + '\n');
                        if (instruction.endLine && lineNumber < instruction.endLine) {
                            lineNumber++;
                            continue;
                        }
                        break;
                    }
                    templateData.sourcecode.innerText = sourceSB.build();
                }
            }
        }
        let spacesToAppend = 10;
        if (instruction.address !== '-1') {
            sb.appendString(instruction.address);
            if (instruction.address.length < InstructionRenderer.INSTRUCTION_ADDR_MIN_LENGTH) {
                spacesToAppend = InstructionRenderer.INSTRUCTION_ADDR_MIN_LENGTH - instruction.address.length;
            }
            for (let i = 0; i < spacesToAppend; i++) {
                sb.appendString(' ');
            }
        }
        if (instruction.instructionBytes) {
            sb.appendString(instruction.instructionBytes);
            spacesToAppend = 10;
            if (instruction.instructionBytes.length < InstructionRenderer.INSTRUCTION_BYTES_MIN_LENGTH) {
                spacesToAppend = InstructionRenderer.INSTRUCTION_BYTES_MIN_LENGTH - instruction.instructionBytes.length;
            }
            for (let i = 0; i < spacesToAppend; i++) {
                sb.appendString(' ');
            }
        }
        sb.appendString(instruction.instruction);
        templateData.instruction.innerText = sb.build();
        this.rerenderBackground(templateData.instruction, templateData.sourcecode, element);
    }
    disposeElement(element, index, templateData, height) {
        dispose(templateData.cellDisposable);
        templateData.cellDisposable = [];
    }
    disposeTemplate(templateData) {
        dispose(templateData.disposables);
        templateData.disposables = [];
    }
    rerenderBackground(instruction, sourceCode, element) {
        if (element && this._disassemblyView.currentInstructionAddresses.includes(element.instruction.address)) {
            instruction.style.background = this._topStackFrameColor?.toString() || 'transparent';
        }
        else if (element?.instruction.address === this._disassemblyView.focusedInstructionAddress) {
            instruction.style.background = this._focusedStackFrameColor?.toString() || 'transparent';
        }
        else {
            instruction.style.background = 'transparent';
        }
    }
    openSourceCode(instruction) {
        if (instruction) {
            const sourceURI = this.getUriFromSource(instruction);
            const selection = instruction.endLine ? {
                startLineNumber: instruction.line,
                endLineNumber: instruction.endLine,
                startColumn: instruction.column || 1,
                endColumn: instruction.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
            } : {
                startLineNumber: instruction.line,
                endLineNumber: instruction.line,
                startColumn: instruction.column || 1,
                endColumn: instruction.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
            };
            this.editorService.openEditor({
                resource: sourceURI,
                description: localize('editorOpenedFromDisassemblyDescription', "from disassembly"),
                options: {
                    preserveFocus: false,
                    selection: selection,
                    revealIfOpened: true,
                    selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */,
                    pinned: false,
                }
            });
        }
    }
    getUriFromSource(instruction) {
        // Try to resolve path before consulting the debugSession.
        const path = instruction.location.path;
        if (path && isUri(path)) { // path looks like a uri
            return this.uriService.asCanonicalUri(URI.parse(path));
        }
        // assume a filesystem path
        if (path && isAbsolute(path)) {
            return this.uriService.asCanonicalUri(URI.file(path));
        }
        return getUriFromSource(instruction.location, instruction.location.path, this._disassemblyView.debugSession.getId(), this.uriService);
    }
    applyFontInfo(element) {
        applyFontInfo(element, this._disassemblyView.fontInfo);
        element.style.whiteSpace = 'pre';
    }
};
InstructionRenderer = __decorate([
    __param(1, IThemeService),
    __param(2, IEditorService),
    __param(3, ITextModelService),
    __param(4, IUriIdentityService)
], InstructionRenderer);
class AccessibilityProvider {
    getWidgetAriaLabel() {
        return localize('disassemblyView', "Disassembly View");
    }
    getAriaLabel(element) {
        let label = '';
        const instruction = element.instruction;
        if (instruction.address !== '-1') {
            label += `${localize('instructionAddress', "Address")}: ${instruction.address}`;
        }
        if (instruction.instructionBytes) {
            label += `, ${localize('instructionBytes', "Bytes")}: ${instruction.instructionBytes}`;
        }
        label += `, ${localize(`instructionText`, "Instruction")}: ${instruction.instruction}`;
        return label;
    }
}
let DisassemblyViewContribution = class DisassemblyViewContribution {
    _onDidActiveEditorChangeListener;
    _onDidChangeModelLanguage;
    _languageSupportsDisassemleRequest;
    constructor(editorService, debugService, contextKeyService) {
        contextKeyService.bufferChangeEvents(() => {
            this._languageSupportsDisassemleRequest = CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST.bindTo(contextKeyService);
        });
        const onDidActiveEditorChangeListener = () => {
            if (this._onDidChangeModelLanguage) {
                this._onDidChangeModelLanguage.dispose();
                this._onDidChangeModelLanguage = undefined;
            }
            const activeTextEditorControl = editorService.activeTextEditorControl;
            if (isCodeEditor(activeTextEditorControl)) {
                const language = activeTextEditorControl.getModel()?.getLanguageId();
                // TODO: instead of using idDebuggerInterestedInLanguage, have a specific ext point for languages
                // support disassembly
                this._languageSupportsDisassemleRequest?.set(!!language && debugService.getAdapterManager().someDebuggerInterestedInLanguage(language));
                this._onDidChangeModelLanguage = activeTextEditorControl.onDidChangeModelLanguage(e => {
                    this._languageSupportsDisassemleRequest?.set(debugService.getAdapterManager().someDebuggerInterestedInLanguage(e.newLanguage));
                });
            }
            else {
                this._languageSupportsDisassemleRequest?.set(false);
            }
        };
        onDidActiveEditorChangeListener();
        this._onDidActiveEditorChangeListener = editorService.onDidActiveEditorChange(onDidActiveEditorChangeListener);
    }
    dispose() {
        this._onDidActiveEditorChangeListener.dispose();
        this._onDidChangeModelLanguage?.dispose();
    }
};
DisassemblyViewContribution = __decorate([
    __param(0, IEditorService),
    __param(1, IDebugService),
    __param(2, IContextKeyService)
], DisassemblyViewContribution);
export { DisassemblyViewContribution };
