import { Disposable } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { BracketInfo, BracketPairWithMinIndentationInfo, IFoundBracket } from 'vs/editor/common/textModelBracketPairs';
import { TextModel } from 'vs/editor/common/model/textModel';
import { IModelContentChangedEvent, IModelTokensChangedEvent } from 'vs/editor/common/textModelEvents';
import { ResolvedLanguageConfiguration } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { Position } from 'vs/editor/common/core/position';
import { CallbackIterable } from 'vs/base/common/arrays';
export declare class BracketPairsTree extends Disposable {
    private readonly textModel;
    private readonly getLanguageConfiguration;
    private readonly didChangeEmitter;
    private initialAstWithoutTokens;
    private astWithTokens;
    private readonly denseKeyProvider;
    private readonly brackets;
    didLanguageChange(languageId: string): boolean;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    private queuedTextEditsForInitialAstWithoutTokens;
    private queuedTextEdits;
    constructor(textModel: TextModel, getLanguageConfiguration: (languageId: string) => ResolvedLanguageConfiguration);
    handleDidChangeBackgroundTokenizationState(): void;
    handleDidChangeTokens({ ranges }: IModelTokensChangedEvent): void;
    handleContentChanged(change: IModelContentChangedEvent): void;
    private handleEdits;
    private flushQueue;
    /**
     * @pure (only if isPure = true)
    */
    private parseDocumentFromTextBuffer;
    getBracketsInRange(range: Range): CallbackIterable<BracketInfo>;
    getBracketPairsInRange(range: Range, includeMinIndentation: boolean): CallbackIterable<BracketPairWithMinIndentationInfo>;
    getFirstBracketAfter(position: Position): IFoundBracket | null;
    getFirstBracketBefore(position: Position): IFoundBracket | null;
}
