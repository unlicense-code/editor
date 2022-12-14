import { Event } from 'vs/base/common/event';
declare class PixelRatioFacade {
    private _pixelRatioMonitor;
    private _getOrCreatePixelRatioMonitor;
    /**
     * Get the current value.
     */
    get value(): number;
    /**
     * Listen for changes.
     */
    get onDidChange(): Event<number>;
}
export declare function addMatchMediaChangeListener(query: string | MediaQueryList, callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void;
/**
 * Returns the pixel ratio.
 *
 * This is useful for rendering <canvas> elements at native screen resolution or for being used as
 * a cache key when storing font measurements. Fonts might render differently depending on resolution
 * and any measurements need to be discarded for example when a window is moved from a monitor to another.
 */
export declare const PixelRatio: PixelRatioFacade;
/** A zoom index, e.g. 1, 2, 3 */
export declare function setZoomLevel(zoomLevel: number, isTrusted: boolean): void;
export declare function getZoomLevel(): number;
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
export declare function getZoomFactor(): number;
export declare function setZoomFactor(zoomFactor: number): void;
export declare function setFullscreen(fullscreen: boolean): void;
export declare function isFullscreen(): boolean;
export declare const onDidChangeFullscreen: Event<void>;
export declare const isFirefox: boolean;
export declare const isWebKit: boolean;
export declare const isChrome: boolean;
export declare const isSafari: boolean;
export declare const isWebkitWebView: boolean;
export declare const isElectron: boolean;
export declare const isAndroid: boolean;
export declare function isStandalone(): boolean;
export declare function isWCOVisible(): boolean;
export {};
