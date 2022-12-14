import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { BareFontInfo, FontInfo } from 'vs/editor/common/config/fontInfo';
/**
 * Serializable font information.
 */
export interface ISerializedFontInfo {
    readonly version: number;
    readonly pixelRatio: number;
    readonly fontFamily: string;
    readonly fontWeight: string;
    readonly fontSize: number;
    readonly fontFeatureSettings: string;
    readonly lineHeight: number;
    readonly letterSpacing: number;
    readonly isMonospace: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly typicalFullwidthCharacterWidth: number;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly spaceWidth: number;
    readonly middotWidth: number;
    readonly wsmiddotWidth: number;
    readonly maxDigitWidth: number;
}
export declare class FontMeasurementsImpl extends Disposable {
    private _cache;
    private _evictUntrustedReadingsTimeout;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    constructor();
    dispose(): void;
    /**
     * Clear all cached font information and trigger a change event.
     */
    clearAllFontInfos(): void;
    private _writeToCache;
    private _evictUntrustedReadings;
    /**
     * Serialized currently cached font information.
     */
    serializeFontInfo(): ISerializedFontInfo[];
    /**
     * Restore previously serialized font informations.
     */
    restoreFontInfo(savedFontInfos: ISerializedFontInfo[]): void;
    /**
     * Read font information.
     */
    readFontInfo(bareFontInfo: BareFontInfo): FontInfo;
    private _createRequest;
    private _actualReadFontInfo;
}
export declare const FontMeasurements: FontMeasurementsImpl;
