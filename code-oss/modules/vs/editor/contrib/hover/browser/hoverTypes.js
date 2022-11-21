/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var HoverAnchorType;
(function (HoverAnchorType) {
    HoverAnchorType[HoverAnchorType["Range"] = 1] = "Range";
    HoverAnchorType[HoverAnchorType["ForeignElement"] = 2] = "ForeignElement";
})(HoverAnchorType || (HoverAnchorType = {}));
export class HoverRangeAnchor {
    priority;
    range;
    initialMousePosX;
    initialMousePosY;
    type = 1 /* HoverAnchorType.Range */;
    constructor(priority, range, initialMousePosX, initialMousePosY) {
        this.priority = priority;
        this.range = range;
        this.initialMousePosX = initialMousePosX;
        this.initialMousePosY = initialMousePosY;
    }
    equals(other) {
        return (other.type === 1 /* HoverAnchorType.Range */ && this.range.equalsRange(other.range));
    }
    canAdoptVisibleHover(lastAnchor, showAtPosition) {
        return (lastAnchor.type === 1 /* HoverAnchorType.Range */ && showAtPosition.lineNumber === this.range.startLineNumber);
    }
}
export class HoverForeignElementAnchor {
    priority;
    owner;
    range;
    initialMousePosX;
    initialMousePosY;
    type = 2 /* HoverAnchorType.ForeignElement */;
    constructor(priority, owner, range, initialMousePosX, initialMousePosY) {
        this.priority = priority;
        this.owner = owner;
        this.range = range;
        this.initialMousePosX = initialMousePosX;
        this.initialMousePosY = initialMousePosY;
    }
    equals(other) {
        return (other.type === 2 /* HoverAnchorType.ForeignElement */ && this.owner === other.owner);
    }
    canAdoptVisibleHover(lastAnchor, showAtPosition) {
        return (lastAnchor.type === 2 /* HoverAnchorType.ForeignElement */ && this.owner === lastAnchor.owner);
    }
}
export const HoverParticipantRegistry = (new class HoverParticipantRegistry {
    _participants = [];
    register(ctor) {
        this._participants.push(ctor);
    }
    getAll() {
        return this._participants;
    }
}());
