import { IViewLineTokens } from 'vs/editor/common/tokens/lineTokens';
import { ColorId, ITokenPresentation } from 'vs/editor/common/encodedTokenAttributes';
/**
 * A token on a line.
 */
export declare class TestLineToken {
    /**
     * last char index of this token (not inclusive).
     */
    readonly endIndex: number;
    private readonly _metadata;
    constructor(endIndex: number, metadata: number);
    getForeground(): ColorId;
    getType(): string;
    getInlineStyle(colorMap: string[]): string;
    getPresentation(): ITokenPresentation;
    private static _equals;
    static equalsArr(a: TestLineToken[], b: TestLineToken[]): boolean;
}
export declare class TestLineTokens implements IViewLineTokens {
    private readonly _actual;
    constructor(actual: TestLineToken[]);
    equals(other: IViewLineTokens): boolean;
    getCount(): number;
    getForeground(tokenIndex: number): ColorId;
    getEndOffset(tokenIndex: number): number;
    getClassName(tokenIndex: number): string;
    getInlineStyle(tokenIndex: number, colorMap: string[]): string;
    getPresentation(tokenIndex: number): ITokenPresentation;
    findTokenIndexAtOffset(offset: number): number;
    getLineContent(): string;
    getMetadata(tokenIndex: number): number;
    getLanguageId(tokenIndex: number): string;
}
export declare class TestLineTokenFactory {
    static inflateArr(tokens: Uint32Array): TestLineToken[];
}
