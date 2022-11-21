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
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { Event } from 'vs/base/common/event';
import { isCodeEditor, isDiffEditor } from 'vs/editor/browser/editorBrowser';
import { IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { FoldingController } from 'vs/editor/contrib/folding/browser/folding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { GhostTextController } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextController';
import { autorun, autorunDelta, constObservable, debouncedObservable, derived, observableFromEvent, observableFromPromise, wasEventTriggeredRecently } from 'vs/base/common/observable';
import { AudioCue, IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
let AudioCueLineFeatureContribution = class AudioCueLineFeatureContribution extends Disposable {
    editorService;
    instantiationService;
    audioCueService;
    store = this._register(new DisposableStore());
    features = [
        this.instantiationService.createInstance(MarkerLineFeature, AudioCue.error, MarkerSeverity.Error),
        this.instantiationService.createInstance(MarkerLineFeature, AudioCue.warning, MarkerSeverity.Warning),
        this.instantiationService.createInstance(FoldedAreaLineFeature),
        this.instantiationService.createInstance(BreakpointLineFeature),
        this.instantiationService.createInstance(InlineCompletionLineFeature),
    ];
    constructor(editorService, instantiationService, audioCueService) {
        super();
        this.editorService = editorService;
        this.instantiationService = instantiationService;
        this.audioCueService = audioCueService;
        const someAudioCueFeatureIsEnabled = derived('someAudioCueFeatureIsEnabled', (reader) => this.features.some((feature) => this.audioCueService.isEnabled(feature.audioCue).read(reader)));
        const activeEditorObservable = observableFromEvent(this.editorService.onDidActiveEditorChange, (_) => {
            const activeTextEditorControl = this.editorService.activeTextEditorControl;
            const editor = isDiffEditor(activeTextEditorControl)
                ? activeTextEditorControl.getOriginalEditor()
                : isCodeEditor(activeTextEditorControl)
                    ? activeTextEditorControl
                    : undefined;
            return editor && editor.hasModel() ? { editor, model: editor.getModel() } : undefined;
        });
        this._register(autorun('updateAudioCuesEnabled', (reader) => {
            this.store.clear();
            if (!someAudioCueFeatureIsEnabled.read(reader)) {
                return;
            }
            const activeEditor = activeEditorObservable.read(reader);
            if (activeEditor) {
                this.registerAudioCuesForEditor(activeEditor.editor, activeEditor.model, this.store);
            }
        }));
    }
    registerAudioCuesForEditor(editor, editorModel, store) {
        const curLineNumber = observableFromEvent(editor.onDidChangeCursorPosition, (args) => {
            /** @description editor.onDidChangeCursorPosition (caused by user) */
            if (args &&
                args.reason !== 3 /* CursorChangeReason.Explicit */ &&
                args.reason !== 0 /* CursorChangeReason.NotSet */) {
                // Ignore cursor changes caused by navigation (e.g. which happens when execution is paused).
                return undefined;
            }
            return editor.getPosition()?.lineNumber;
        });
        const debouncedLineNumber = debouncedObservable(curLineNumber, 300, store);
        const isTyping = wasEventTriggeredRecently(editorModel.onDidChangeContent.bind(editorModel), 1000, store);
        const featureStates = this.features.map((feature) => {
            const lineFeatureState = feature.getObservableState(editor, editorModel);
            const isFeaturePresent = derived(`isPresentInLine:${feature.audioCue.name}`, (reader) => {
                if (!this.audioCueService.isEnabled(feature.audioCue).read(reader)) {
                    return false;
                }
                const lineNumber = debouncedLineNumber.read(reader);
                return lineNumber === undefined
                    ? false
                    : lineFeatureState.read(reader).isPresent(lineNumber);
            });
            return derived(`typingDebouncedFeatureState:\n${feature.audioCue.name}`, (reader) => feature.debounceWhileTyping && isTyping.read(reader)
                ? (debouncedLineNumber.read(reader), isFeaturePresent.get())
                : isFeaturePresent.read(reader));
        });
        const state = derived('states', (reader) => ({
            lineNumber: debouncedLineNumber.read(reader),
            featureStates: new Map(this.features.map((feature, idx) => [
                feature,
                featureStates[idx].read(reader),
            ])),
        }));
        store.add(autorunDelta('Play Audio Cue', state, ({ lastValue, newValue }) => {
            const newFeatures = this.features.filter(feature => newValue?.featureStates.get(feature) &&
                (!lastValue?.featureStates?.get(feature) || newValue.lineNumber !== lastValue.lineNumber));
            this.audioCueService.playAudioCues(newFeatures.map(f => f.audioCue));
        }));
    }
};
AudioCueLineFeatureContribution = __decorate([
    __param(0, IEditorService),
    __param(1, IInstantiationService),
    __param(2, IAudioCueService)
], AudioCueLineFeatureContribution);
export { AudioCueLineFeatureContribution };
let MarkerLineFeature = class MarkerLineFeature {
    audioCue;
    severity;
    markerService;
    debounceWhileTyping = true;
    constructor(audioCue, severity, markerService) {
        this.audioCue = audioCue;
        this.severity = severity;
        this.markerService = markerService;
    }
    getObservableState(editor, model) {
        return observableFromEvent(Event.filter(this.markerService.onMarkerChanged, (changedUris) => changedUris.some((u) => u.toString() === model.uri.toString())), () => /** @description this.markerService.onMarkerChanged */ ({
            isPresent: (lineNumber) => {
                const hasMarker = this.markerService
                    .read({ resource: model.uri })
                    .some((m) => m.severity === this.severity &&
                    m.startLineNumber <= lineNumber &&
                    lineNumber <= m.endLineNumber);
                return hasMarker;
            },
        }));
    }
};
MarkerLineFeature = __decorate([
    __param(2, IMarkerService)
], MarkerLineFeature);
class FoldedAreaLineFeature {
    audioCue = AudioCue.foldedArea;
    getObservableState(editor, model) {
        const foldingController = FoldingController.get(editor);
        if (!foldingController) {
            return constObservable({
                isPresent: () => false,
            });
        }
        const foldingModel = observableFromPromise(foldingController.getFoldingModel() ?? Promise.resolve(undefined));
        return foldingModel.map((v) => ({
            isPresent: (lineNumber) => {
                const regionAtLine = v.value?.getRegionAtLine(lineNumber);
                const hasFolding = !regionAtLine
                    ? false
                    : regionAtLine.isCollapsed &&
                        regionAtLine.startLineNumber === lineNumber;
                return hasFolding;
            },
        }));
    }
}
let BreakpointLineFeature = class BreakpointLineFeature {
    debugService;
    audioCue = AudioCue.break;
    constructor(debugService) {
        this.debugService = debugService;
    }
    getObservableState(editor, model) {
        return observableFromEvent(this.debugService.getModel().onDidChangeBreakpoints, () => /** @description debugService.getModel().onDidChangeBreakpoints */ ({
            isPresent: (lineNumber) => {
                const breakpoints = this.debugService
                    .getModel()
                    .getBreakpoints({ uri: model.uri, lineNumber });
                const hasBreakpoints = breakpoints.length > 0;
                return hasBreakpoints;
            },
        }));
    }
};
BreakpointLineFeature = __decorate([
    __param(0, IDebugService)
], BreakpointLineFeature);
class InlineCompletionLineFeature {
    audioCue = AudioCue.inlineSuggestion;
    getObservableState(editor, _model) {
        const ghostTextController = GhostTextController.get(editor);
        if (!ghostTextController) {
            return constObservable({
                isPresent: () => false,
            });
        }
        const activeGhostText = observableFromEvent(ghostTextController.onActiveModelDidChange, () => /** @description ghostTextController.onActiveModelDidChange */ ghostTextController.activeModel).map((activeModel) => (activeModel
            ? observableFromEvent(activeModel.inlineCompletionsModel.onDidChange, () => /** @description activeModel.inlineCompletionsModel.onDidChange */ activeModel.inlineCompletionsModel.ghostText)
            : undefined));
        return derived('ghostText', reader => {
            const ghostText = activeGhostText.read(reader)?.read(reader);
            return {
                isPresent(lineNumber) {
                    return ghostText?.lineNumber === lineNumber;
                }
            };
        });
    }
}
