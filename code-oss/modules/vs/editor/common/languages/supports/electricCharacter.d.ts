import { ScopedLineTokens } from 'vs/editor/common/languages/supports';
import { RichEditBrackets } from 'vs/editor/common/languages/supports/richEditBrackets';
/**
 * Interface used to support electric characters
 * @internal
 */
export interface IElectricAction {
    matchOpenBracket: string;
}
export declare class BracketElectricCharacterSupport {
    private readonly _richEditBrackets;
    constructor(richEditBrackets: RichEditBrackets | null);
    getElectricCharacters(): string[];
    onElectricCharacter(character: string, context: ScopedLineTokens, column: number): IElectricAction | null;
}
