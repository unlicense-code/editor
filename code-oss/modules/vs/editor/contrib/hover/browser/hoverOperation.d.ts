import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export interface IHoverComputer<T> {
    /**
     * This is called after half the hover time
     */
    computeAsync?: (token: CancellationToken) => AsyncIterableObject<T>;
    /**
     * This is called after all the hover time
     */
    computeSync?: () => T[];
}
export declare const enum HoverStartMode {
    Delayed = 0,
    Immediate = 1
}
export declare const enum HoverStartSource {
    Mouse = 0,
    Keyboard = 1
}
export declare class HoverResult<T> {
    readonly value: T[];
    readonly isComplete: boolean;
    readonly hasLoadingMessage: boolean;
    constructor(value: T[], isComplete: boolean, hasLoadingMessage: boolean);
}
/**
 * Computing the hover is very fine tuned.
 *
 * Suppose the hover delay is 300ms (the default). Then, when resting the mouse at an anchor:
 * - at 150ms, the async computation is triggered (i.e. semantic hover)
 *   - if async results already come in, they are not rendered yet.
 * - at 300ms, the sync computation is triggered (i.e. decorations, markers)
 *   - if there are sync or async results, they are rendered.
 * - at 900ms, if the async computation hasn't finished, a "Loading..." result is added.
 */
export declare class HoverOperation<T> extends Disposable {
    private readonly _editor;
    private readonly _computer;
    private readonly _onResult;
    readonly onResult: import("vs/base/common/event").Event<HoverResult<T>>;
    private readonly _firstWaitScheduler;
    private readonly _secondWaitScheduler;
    private readonly _loadingMessageScheduler;
    private _state;
    private _asyncIterable;
    private _asyncIterableDone;
    private _result;
    constructor(_editor: ICodeEditor, _computer: IHoverComputer<T>);
    dispose(): void;
    private get _hoverTime();
    private get _firstWaitTime();
    private get _secondWaitTime();
    private get _loadingMessageTime();
    private _setState;
    private _triggerAsyncComputation;
    private _triggerSyncComputation;
    private _triggerLoadingMessage;
    private _fireResult;
    start(mode: HoverStartMode): void;
    cancel(): void;
}
