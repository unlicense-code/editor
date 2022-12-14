import { CharacterClassifier } from 'vs/editor/common/core/characterClassifier';
export declare const enum WordCharacterClass {
    Regular = 0,
    Whitespace = 1,
    WordSeparator = 2
}
export declare class WordCharacterClassifier extends CharacterClassifier<WordCharacterClass> {
    constructor(wordSeparators: string);
}
export declare const getMapForWordSeparators: (input: string) => WordCharacterClassifier;
