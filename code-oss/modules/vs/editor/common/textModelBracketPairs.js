/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class BracketInfo {
    range;
    nestingLevel;
    nestingLevelOfEqualBracketType;
    isInvalid;
    constructor(range, 
    /** 0-based level */
    nestingLevel, nestingLevelOfEqualBracketType, isInvalid) {
        this.range = range;
        this.nestingLevel = nestingLevel;
        this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
        this.isInvalid = isInvalid;
    }
}
export class BracketPairInfo {
    range;
    openingBracketRange;
    closingBracketRange;
    nestingLevel;
    nestingLevelOfEqualBracketType;
    bracketPairNode;
    constructor(range, openingBracketRange, closingBracketRange, 
    /** 0-based */
    nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode) {
        this.range = range;
        this.openingBracketRange = openingBracketRange;
        this.closingBracketRange = closingBracketRange;
        this.nestingLevel = nestingLevel;
        this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
        this.bracketPairNode = bracketPairNode;
    }
    get openingBracketInfo() {
        return this.bracketPairNode.openingBracket.bracketInfo;
    }
    get closingBracketInfo() {
        return this.bracketPairNode.closingBracket?.bracketInfo;
    }
}
export class BracketPairWithMinIndentationInfo extends BracketPairInfo {
    minVisibleColumnIndentation;
    constructor(range, openingBracketRange, closingBracketRange, 
    /**
     * 0-based
    */
    nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode, 
    /**
     * -1 if not requested, otherwise the size of the minimum indentation in the bracket pair in terms of visible columns.
    */
    minVisibleColumnIndentation) {
        super(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode);
        this.minVisibleColumnIndentation = minVisibleColumnIndentation;
    }
}
