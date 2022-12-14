import { Disposable } from 'vs/base/common/lifecycle';
import { IDimension } from 'vs/editor/common/core/dimension';
import { Event } from 'vs/base/common/event';
export declare class ElementSizeObserver extends Disposable {
    private _onDidChange;
    readonly onDidChange: Event<void>;
    private readonly _referenceDomElement;
    private _width;
    private _height;
    private _resizeObserver;
    constructor(referenceDomElement: HTMLElement | null, dimension: IDimension | undefined);
    dispose(): void;
    getWidth(): number;
    getHeight(): number;
    startObserving(): void;
    stopObserving(): void;
    observe(dimension?: IDimension): void;
    private measureReferenceDomElement;
}
