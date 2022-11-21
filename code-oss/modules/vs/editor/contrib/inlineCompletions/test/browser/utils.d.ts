import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { InlineCompletion, InlineCompletionContext, InlineCompletionsProvider } from 'vs/editor/common/languages';
import { GhostTextWidgetModel } from 'vs/editor/contrib/inlineCompletions/browser/ghostText';
import { ITestCodeEditor } from 'vs/editor/test/browser/testCodeEditor';
export declare class MockInlineCompletionsProvider implements InlineCompletionsProvider {
    private returnValue;
    private delayMs;
    private callHistory;
    private calledTwiceIn50Ms;
    setReturnValue(value: InlineCompletion | undefined, delayMs?: number): void;
    setReturnValues(values: InlineCompletion[], delayMs?: number): void;
    getAndClearCallHistory(): unknown[];
    assertNotCalledTwiceWithin50ms(): void;
    private lastTimeMs;
    provideInlineCompletions(model: ITextModel, position: Position, context: InlineCompletionContext, token: CancellationToken): Promise<{
        items: InlineCompletion[];
    }>;
    freeInlineCompletions(): void;
    handleItemDidShow(): void;
}
export declare class GhostTextContext extends Disposable {
    private readonly model;
    private readonly editor;
    readonly prettyViewStates: (string | undefined)[];
    private _currentPrettyViewState;
    get currentPrettyViewState(): string | undefined;
    constructor(model: GhostTextWidgetModel, editor: ITestCodeEditor);
    private update;
    getAndClearViewStates(): (string | undefined)[];
    keyboardType(text: string): void;
    cursorUp(): void;
    cursorRight(): void;
    cursorLeft(): void;
    cursorDown(): void;
    cursorLineEnd(): void;
    leftDelete(): void;
}
