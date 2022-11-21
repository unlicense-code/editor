import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { RGBA8 } from 'vs/editor/common/core/rgba';
import { ColorId } from 'vs/editor/common/encodedTokenAttributes';
export declare class MinimapTokensColorTracker extends Disposable {
    private static _INSTANCE;
    static getInstance(): MinimapTokensColorTracker;
    private _colors;
    private _backgroundIsLight;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private constructor();
    private _updateColorMap;
    getColor(colorId: ColorId): RGBA8;
    backgroundIsLight(): boolean;
}
