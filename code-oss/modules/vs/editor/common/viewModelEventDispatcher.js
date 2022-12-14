/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export class ViewModelEventDispatcher extends Disposable {
    _onEvent = this._register(new Emitter());
    onEvent = this._onEvent.event;
    _eventHandlers;
    _viewEventQueue;
    _isConsumingViewEventQueue;
    _collector;
    _collectorCnt;
    _outgoingEvents;
    constructor() {
        super();
        this._eventHandlers = [];
        this._viewEventQueue = null;
        this._isConsumingViewEventQueue = false;
        this._collector = null;
        this._collectorCnt = 0;
        this._outgoingEvents = [];
    }
    emitOutgoingEvent(e) {
        this._addOutgoingEvent(e);
        this._emitOutgoingEvents();
    }
    _addOutgoingEvent(e) {
        for (let i = 0, len = this._outgoingEvents.length; i < len; i++) {
            const mergeResult = (this._outgoingEvents[i].kind === e.kind ? this._outgoingEvents[i].attemptToMerge(e) : null);
            if (mergeResult) {
                this._outgoingEvents[i] = mergeResult;
                return;
            }
        }
        // not merged
        this._outgoingEvents.push(e);
    }
    _emitOutgoingEvents() {
        while (this._outgoingEvents.length > 0) {
            if (this._collector || this._isConsumingViewEventQueue) {
                // right now collecting or emitting view events, so let's postpone emitting
                return;
            }
            const event = this._outgoingEvents.shift();
            if (event.isNoOp()) {
                continue;
            }
            this._onEvent.fire(event);
        }
    }
    addViewEventHandler(eventHandler) {
        for (let i = 0, len = this._eventHandlers.length; i < len; i++) {
            if (this._eventHandlers[i] === eventHandler) {
                console.warn('Detected duplicate listener in ViewEventDispatcher', eventHandler);
            }
        }
        this._eventHandlers.push(eventHandler);
    }
    removeViewEventHandler(eventHandler) {
        for (let i = 0; i < this._eventHandlers.length; i++) {
            if (this._eventHandlers[i] === eventHandler) {
                this._eventHandlers.splice(i, 1);
                break;
            }
        }
    }
    beginEmitViewEvents() {
        this._collectorCnt++;
        if (this._collectorCnt === 1) {
            this._collector = new ViewModelEventsCollector();
        }
        return this._collector;
    }
    endEmitViewEvents() {
        this._collectorCnt--;
        if (this._collectorCnt === 0) {
            const outgoingEvents = this._collector.outgoingEvents;
            const viewEvents = this._collector.viewEvents;
            this._collector = null;
            for (const outgoingEvent of outgoingEvents) {
                this._addOutgoingEvent(outgoingEvent);
            }
            if (viewEvents.length > 0) {
                this._emitMany(viewEvents);
            }
        }
        this._emitOutgoingEvents();
    }
    emitSingleViewEvent(event) {
        try {
            const eventsCollector = this.beginEmitViewEvents();
            eventsCollector.emitViewEvent(event);
        }
        finally {
            this.endEmitViewEvents();
        }
    }
    _emitMany(events) {
        if (this._viewEventQueue) {
            this._viewEventQueue = this._viewEventQueue.concat(events);
        }
        else {
            this._viewEventQueue = events;
        }
        if (!this._isConsumingViewEventQueue) {
            this._consumeViewEventQueue();
        }
    }
    _consumeViewEventQueue() {
        try {
            this._isConsumingViewEventQueue = true;
            this._doConsumeQueue();
        }
        finally {
            this._isConsumingViewEventQueue = false;
        }
    }
    _doConsumeQueue() {
        while (this._viewEventQueue) {
            // Empty event queue, as events might come in while sending these off
            const events = this._viewEventQueue;
            this._viewEventQueue = null;
            // Use a clone of the event handlers list, as they might remove themselves
            const eventHandlers = this._eventHandlers.slice(0);
            for (const eventHandler of eventHandlers) {
                eventHandler.handleEvents(events);
            }
        }
    }
}
export class ViewModelEventsCollector {
    viewEvents;
    outgoingEvents;
    constructor() {
        this.viewEvents = [];
        this.outgoingEvents = [];
    }
    emitViewEvent(event) {
        this.viewEvents.push(event);
    }
    emitOutgoingEvent(e) {
        this.outgoingEvents.push(e);
    }
}
export var OutgoingViewModelEventKind;
(function (OutgoingViewModelEventKind) {
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ContentSizeChanged"] = 0] = "ContentSizeChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["FocusChanged"] = 1] = "FocusChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ScrollChanged"] = 2] = "ScrollChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ViewZonesChanged"] = 3] = "ViewZonesChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["HiddenAreasChanged"] = 4] = "HiddenAreasChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ReadOnlyEditAttempt"] = 5] = "ReadOnlyEditAttempt";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["CursorStateChanged"] = 6] = "CursorStateChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelDecorationsChanged"] = 7] = "ModelDecorationsChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelLanguageChanged"] = 8] = "ModelLanguageChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelLanguageConfigurationChanged"] = 9] = "ModelLanguageConfigurationChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelContentChanged"] = 10] = "ModelContentChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelOptionsChanged"] = 11] = "ModelOptionsChanged";
    OutgoingViewModelEventKind[OutgoingViewModelEventKind["ModelTokensChanged"] = 12] = "ModelTokensChanged";
})(OutgoingViewModelEventKind || (OutgoingViewModelEventKind = {}));
export class ContentSizeChangedEvent {
    kind = 0 /* OutgoingViewModelEventKind.ContentSizeChanged */;
    _oldContentWidth;
    _oldContentHeight;
    contentWidth;
    contentHeight;
    contentWidthChanged;
    contentHeightChanged;
    constructor(oldContentWidth, oldContentHeight, contentWidth, contentHeight) {
        this._oldContentWidth = oldContentWidth;
        this._oldContentHeight = oldContentHeight;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
        this.contentWidthChanged = (this._oldContentWidth !== this.contentWidth);
        this.contentHeightChanged = (this._oldContentHeight !== this.contentHeight);
    }
    isNoOp() {
        return (!this.contentWidthChanged && !this.contentHeightChanged);
    }
    attemptToMerge(other) {
        if (other.kind !== this.kind) {
            return null;
        }
        return new ContentSizeChangedEvent(this._oldContentWidth, this._oldContentHeight, other.contentWidth, other.contentHeight);
    }
}
export class FocusChangedEvent {
    kind = 1 /* OutgoingViewModelEventKind.FocusChanged */;
    oldHasFocus;
    hasFocus;
    constructor(oldHasFocus, hasFocus) {
        this.oldHasFocus = oldHasFocus;
        this.hasFocus = hasFocus;
    }
    isNoOp() {
        return (this.oldHasFocus === this.hasFocus);
    }
    attemptToMerge(other) {
        if (other.kind !== this.kind) {
            return null;
        }
        return new FocusChangedEvent(this.oldHasFocus, other.hasFocus);
    }
}
export class ScrollChangedEvent {
    kind = 2 /* OutgoingViewModelEventKind.ScrollChanged */;
    _oldScrollWidth;
    _oldScrollLeft;
    _oldScrollHeight;
    _oldScrollTop;
    scrollWidth;
    scrollLeft;
    scrollHeight;
    scrollTop;
    scrollWidthChanged;
    scrollLeftChanged;
    scrollHeightChanged;
    scrollTopChanged;
    constructor(oldScrollWidth, oldScrollLeft, oldScrollHeight, oldScrollTop, scrollWidth, scrollLeft, scrollHeight, scrollTop) {
        this._oldScrollWidth = oldScrollWidth;
        this._oldScrollLeft = oldScrollLeft;
        this._oldScrollHeight = oldScrollHeight;
        this._oldScrollTop = oldScrollTop;
        this.scrollWidth = scrollWidth;
        this.scrollLeft = scrollLeft;
        this.scrollHeight = scrollHeight;
        this.scrollTop = scrollTop;
        this.scrollWidthChanged = (this._oldScrollWidth !== this.scrollWidth);
        this.scrollLeftChanged = (this._oldScrollLeft !== this.scrollLeft);
        this.scrollHeightChanged = (this._oldScrollHeight !== this.scrollHeight);
        this.scrollTopChanged = (this._oldScrollTop !== this.scrollTop);
    }
    isNoOp() {
        return (!this.scrollWidthChanged && !this.scrollLeftChanged && !this.scrollHeightChanged && !this.scrollTopChanged);
    }
    attemptToMerge(other) {
        if (other.kind !== this.kind) {
            return null;
        }
        return new ScrollChangedEvent(this._oldScrollWidth, this._oldScrollLeft, this._oldScrollHeight, this._oldScrollTop, other.scrollWidth, other.scrollLeft, other.scrollHeight, other.scrollTop);
    }
}
export class ViewZonesChangedEvent {
    kind = 3 /* OutgoingViewModelEventKind.ViewZonesChanged */;
    constructor() {
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        if (other.kind !== this.kind) {
            return null;
        }
        return this;
    }
}
export class HiddenAreasChangedEvent {
    kind = 4 /* OutgoingViewModelEventKind.HiddenAreasChanged */;
    constructor() {
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        if (other.kind !== this.kind) {
            return null;
        }
        return this;
    }
}
export class CursorStateChangedEvent {
    kind = 6 /* OutgoingViewModelEventKind.CursorStateChanged */;
    oldSelections;
    selections;
    oldModelVersionId;
    modelVersionId;
    source;
    reason;
    reachedMaxCursorCount;
    constructor(oldSelections, selections, oldModelVersionId, modelVersionId, source, reason, reachedMaxCursorCount) {
        this.oldSelections = oldSelections;
        this.selections = selections;
        this.oldModelVersionId = oldModelVersionId;
        this.modelVersionId = modelVersionId;
        this.source = source;
        this.reason = reason;
        this.reachedMaxCursorCount = reachedMaxCursorCount;
    }
    static _selectionsAreEqual(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        const aLen = a.length;
        const bLen = b.length;
        if (aLen !== bLen) {
            return false;
        }
        for (let i = 0; i < aLen; i++) {
            if (!a[i].equalsSelection(b[i])) {
                return false;
            }
        }
        return true;
    }
    isNoOp() {
        return (CursorStateChangedEvent._selectionsAreEqual(this.oldSelections, this.selections)
            && this.oldModelVersionId === this.modelVersionId);
    }
    attemptToMerge(other) {
        if (other.kind !== this.kind) {
            return null;
        }
        return new CursorStateChangedEvent(this.oldSelections, other.selections, this.oldModelVersionId, other.modelVersionId, other.source, other.reason, this.reachedMaxCursorCount || other.reachedMaxCursorCount);
    }
}
export class ReadOnlyEditAttemptEvent {
    kind = 5 /* OutgoingViewModelEventKind.ReadOnlyEditAttempt */;
    constructor() {
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        if (other.kind !== this.kind) {
            return null;
        }
        return this;
    }
}
export class ModelDecorationsChangedEvent {
    event;
    kind = 7 /* OutgoingViewModelEventKind.ModelDecorationsChanged */;
    constructor(event) {
        this.event = event;
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        return null;
    }
}
export class ModelLanguageChangedEvent {
    event;
    kind = 8 /* OutgoingViewModelEventKind.ModelLanguageChanged */;
    constructor(event) {
        this.event = event;
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        return null;
    }
}
export class ModelLanguageConfigurationChangedEvent {
    event;
    kind = 9 /* OutgoingViewModelEventKind.ModelLanguageConfigurationChanged */;
    constructor(event) {
        this.event = event;
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        return null;
    }
}
export class ModelContentChangedEvent {
    event;
    kind = 10 /* OutgoingViewModelEventKind.ModelContentChanged */;
    constructor(event) {
        this.event = event;
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        return null;
    }
}
export class ModelOptionsChangedEvent {
    event;
    kind = 11 /* OutgoingViewModelEventKind.ModelOptionsChanged */;
    constructor(event) {
        this.event = event;
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        return null;
    }
}
export class ModelTokensChangedEvent {
    event;
    kind = 12 /* OutgoingViewModelEventKind.ModelTokensChanged */;
    constructor(event) {
        this.event = event;
    }
    isNoOp() {
        return false;
    }
    attemptToMerge(other) {
        return null;
    }
}
