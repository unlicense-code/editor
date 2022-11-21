import { Event } from 'vs/base/common/event';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { SimpleFindWidget } from 'vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget';
export interface WebviewFindDelegate {
    readonly hasFindResult: Event<boolean>;
    readonly onDidStopFind: Event<void>;
    readonly checkImeCompletionState: boolean;
    find(value: string, previous: boolean): void;
    updateFind(value: string): void;
    stopFind(keepSelection?: boolean): void;
    focus(): void;
}
export declare class WebviewFindWidget extends SimpleFindWidget {
    private readonly _delegate;
    protected _getResultCount(dataChanged?: boolean): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected readonly _findWidgetFocused: IContextKey<boolean>;
    constructor(_delegate: WebviewFindDelegate, contextViewService: IContextViewService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    find(previous: boolean): void;
    hide(animated?: boolean): void;
    protected _onInputChanged(): boolean;
    protected _onFocusTrackerFocus(): void;
    protected _onFocusTrackerBlur(): void;
    protected _onFindInputFocusTrackerFocus(): void;
    protected _onFindInputFocusTrackerBlur(): void;
    protected findFirst(): void;
}
