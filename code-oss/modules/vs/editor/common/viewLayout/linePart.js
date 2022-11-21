/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var LinePartMetadata;
(function (LinePartMetadata) {
    LinePartMetadata[LinePartMetadata["IS_WHITESPACE"] = 1] = "IS_WHITESPACE";
    LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE"] = 2] = "PSEUDO_BEFORE";
    LinePartMetadata[LinePartMetadata["PSEUDO_AFTER"] = 4] = "PSEUDO_AFTER";
    LinePartMetadata[LinePartMetadata["IS_WHITESPACE_MASK"] = 1] = "IS_WHITESPACE_MASK";
    LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE_MASK"] = 2] = "PSEUDO_BEFORE_MASK";
    LinePartMetadata[LinePartMetadata["PSEUDO_AFTER_MASK"] = 4] = "PSEUDO_AFTER_MASK";
})(LinePartMetadata || (LinePartMetadata = {}));
export class LinePart {
    endIndex;
    type;
    metadata;
    containsRTL;
    _linePartBrand = undefined;
    constructor(
    /**
     * last char index of this token (not inclusive).
     */
    endIndex, type, metadata, containsRTL) {
        this.endIndex = endIndex;
        this.type = type;
        this.metadata = metadata;
        this.containsRTL = containsRTL;
    }
    isWhitespace() {
        return (this.metadata & 1 /* LinePartMetadata.IS_WHITESPACE_MASK */ ? true : false);
    }
    isPseudoAfter() {
        return (this.metadata & 4 /* LinePartMetadata.PSEUDO_AFTER_MASK */ ? true : false);
    }
}
