/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createCancelablePromise, TimeoutTimer } from 'vs/base/common/async';
import { isCancellationError } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { isEqual } from 'vs/base/common/resources';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { Progress } from 'vs/platform/progress/common/progress';
import { getCodeActions } from './codeAction';
import { CodeActionTriggerSource } from '../common/types';
export const SUPPORTED_CODE_ACTIONS = new RawContextKey('supportedCodeAction', '');
class CodeActionOracle extends Disposable {
    _editor;
    _markerService;
    _signalChange;
    _delay;
    _autoTriggerTimer = this._register(new TimeoutTimer());
    constructor(_editor, _markerService, _signalChange, _delay = 250) {
        super();
        this._editor = _editor;
        this._markerService = _markerService;
        this._signalChange = _signalChange;
        this._delay = _delay;
        this._register(this._markerService.onMarkerChanged(e => this._onMarkerChanges(e)));
        this._register(this._editor.onDidChangeCursorPosition(() => this._onCursorChange()));
    }
    trigger(trigger) {
        const selection = this._getRangeOfSelectionUnlessWhitespaceEnclosed(trigger);
        return this._createEventAndSignalChange(trigger, selection);
    }
    _onMarkerChanges(resources) {
        const model = this._editor.getModel();
        if (!model) {
            return;
        }
        if (resources.some(resource => isEqual(resource, model.uri))) {
            this._autoTriggerTimer.cancelAndSet(() => {
                this.trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default });
            }, this._delay);
        }
    }
    _onCursorChange() {
        this._autoTriggerTimer.cancelAndSet(() => {
            this.trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default });
        }, this._delay);
    }
    _getRangeOfSelectionUnlessWhitespaceEnclosed(trigger) {
        if (!this._editor.hasModel()) {
            return undefined;
        }
        const model = this._editor.getModel();
        const selection = this._editor.getSelection();
        if (selection.isEmpty() && trigger.type === 2 /* CodeActionTriggerType.Auto */) {
            const { lineNumber, column } = selection.getPosition();
            const line = model.getLineContent(lineNumber);
            if (line.length === 0) {
                // empty line
                return undefined;
            }
            else if (column === 1) {
                // look only right
                if (/\s/.test(line[0])) {
                    return undefined;
                }
            }
            else if (column === model.getLineMaxColumn(lineNumber)) {
                // look only left
                if (/\s/.test(line[line.length - 1])) {
                    return undefined;
                }
            }
            else {
                // look left and right
                if (/\s/.test(line[column - 2]) && /\s/.test(line[column - 1])) {
                    return undefined;
                }
            }
        }
        return selection;
    }
    _createEventAndSignalChange(trigger, selection) {
        const model = this._editor.getModel();
        if (!selection || !model) {
            // cancel
            this._signalChange(undefined);
            return undefined;
        }
        const e = {
            trigger,
            selection,
            position: selection.getStartPosition(),
        };
        this._signalChange(e);
        return e;
    }
}
export var CodeActionsState;
(function (CodeActionsState) {
    let Type;
    (function (Type) {
        Type[Type["Empty"] = 0] = "Empty";
        Type[Type["Triggered"] = 1] = "Triggered";
    })(Type = CodeActionsState.Type || (CodeActionsState.Type = {}));
    CodeActionsState.Empty = { type: 0 /* Type.Empty */ };
    class Triggered {
        trigger;
        rangeOrSelection;
        position;
        _cancellablePromise;
        type = 1 /* Type.Triggered */;
        actions;
        constructor(trigger, rangeOrSelection, position, _cancellablePromise) {
            this.trigger = trigger;
            this.rangeOrSelection = rangeOrSelection;
            this.position = position;
            this._cancellablePromise = _cancellablePromise;
            this.actions = _cancellablePromise.catch((e) => {
                if (isCancellationError(e)) {
                    return emptyCodeActionSet;
                }
                throw e;
            });
        }
        cancel() {
            this._cancellablePromise.cancel();
        }
    }
    CodeActionsState.Triggered = Triggered;
})(CodeActionsState || (CodeActionsState = {}));
const emptyCodeActionSet = {
    allActions: [],
    validActions: [],
    dispose: () => { },
    documentation: [],
    hasAutoFix: false
};
export class CodeActionModel extends Disposable {
    _editor;
    _registry;
    _markerService;
    _progressService;
    _codeActionOracle = this._register(new MutableDisposable());
    _state = CodeActionsState.Empty;
    _supportedCodeActions;
    _onDidChangeState = this._register(new Emitter());
    onDidChangeState = this._onDidChangeState.event;
    #isDisposed = false;
    constructor(_editor, _registry, _markerService, contextKeyService, _progressService) {
        super();
        this._editor = _editor;
        this._registry = _registry;
        this._markerService = _markerService;
        this._progressService = _progressService;
        this._supportedCodeActions = SUPPORTED_CODE_ACTIONS.bindTo(contextKeyService);
        this._register(this._editor.onDidChangeModel(() => this._update()));
        this._register(this._editor.onDidChangeModelLanguage(() => this._update()));
        this._register(this._registry.onDidChange(() => this._update()));
        this._update();
    }
    dispose() {
        if (this.#isDisposed) {
            return;
        }
        this.#isDisposed = true;
        super.dispose();
        this.setState(CodeActionsState.Empty, true);
    }
    _update() {
        if (this.#isDisposed) {
            return;
        }
        this._codeActionOracle.value = undefined;
        this.setState(CodeActionsState.Empty);
        const model = this._editor.getModel();
        if (model
            && this._registry.has(model)
            && !this._editor.getOption(82 /* EditorOption.readOnly */)) {
            const supportedActions = [];
            for (const provider of this._registry.all(model)) {
                if (Array.isArray(provider.providedCodeActionKinds)) {
                    supportedActions.push(...provider.providedCodeActionKinds);
                }
            }
            this._supportedCodeActions.set(supportedActions.join(' '));
            this._codeActionOracle.value = new CodeActionOracle(this._editor, this._markerService, trigger => {
                if (!trigger) {
                    this.setState(CodeActionsState.Empty);
                    return;
                }
                const actions = createCancelablePromise(token => getCodeActions(this._registry, model, trigger.selection, trigger.trigger, Progress.None, token));
                if (trigger.trigger.type === 1 /* CodeActionTriggerType.Invoke */) {
                    this._progressService?.showWhile(actions, 250);
                }
                this.setState(new CodeActionsState.Triggered(trigger.trigger, trigger.selection, trigger.position, actions));
            }, undefined);
            this._codeActionOracle.value.trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default });
        }
        else {
            this._supportedCodeActions.reset();
        }
    }
    trigger(trigger) {
        this._codeActionOracle.value?.trigger(trigger);
    }
    setState(newState, skipNotify) {
        if (newState === this._state) {
            return;
        }
        // Cancel old request
        if (this._state.type === 1 /* CodeActionsState.Type.Triggered */) {
            this._state.cancel();
        }
        this._state = newState;
        if (!skipNotify && !this.#isDisposed) {
            this._onDidChangeState.fire(newState);
        }
    }
}
