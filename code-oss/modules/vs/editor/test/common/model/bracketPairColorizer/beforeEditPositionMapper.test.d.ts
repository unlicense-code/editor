import { TextEditInfo } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper';
import { Length } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length';
export declare class TextEdit extends TextEditInfo {
    readonly newText: string;
    constructor(startOffset: Length, endOffset: Length, newText: string);
}
