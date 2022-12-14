export declare const LANGUAGE_DEFAULT = "en";
export interface IProcessEnvironment {
    [key: string]: string | undefined;
}
/**
 * This interface is intentionally not identical to node.js
 * process because it also works in sandboxed environments
 * where the process object is implemented differently. We
 * define the properties here that we need for `platform`
 * to work and nothing else.
 */
export interface INodeProcess {
    platform: string;
    arch: string;
    env: IProcessEnvironment;
    versions?: {
        electron?: string;
    };
    type?: string;
    cwd: () => string;
}
export declare const globals: any;
export declare const enum Platform {
    Web = 0,
    Mac = 1,
    Linux = 2,
    Windows = 3
}
export declare function PlatformToString(platform: Platform): "Windows" | "Linux" | "Web" | "Mac";
export declare const isWindows: boolean;
export declare const isMacintosh: boolean;
export declare const isLinux: boolean;
export declare const isLinuxSnap: boolean;
export declare const isNative: boolean;
export declare const isElectron: boolean;
export declare const isWeb: boolean;
export declare const isWebWorker: boolean;
export declare const isIOS: boolean;
export declare const isMobile: boolean;
/**
 * Whether we run inside a CI environment, such as
 * GH actions or Azure Pipelines.
 */
export declare const isCI: boolean;
export declare const platform: Platform;
export declare const userAgent: string | undefined;
/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */
export declare const language: string;
export declare namespace Language {
    function value(): string;
    function isDefaultVariant(): boolean;
    function isDefault(): boolean;
}
/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */
export declare const locale: string | undefined;
/**
 * The translations that are available through language packs.
 */
export declare const translationsConfigFile: string | undefined;
export declare const setTimeout0IsFaster: boolean;
/**
 * See https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#:~:text=than%204%2C%20then-,set%20timeout%20to%204,-.
 *
 * Works similarly to `setTimeout(0)` but doesn't suffer from the 4ms artificial delay
 * that browsers set when the nesting level is > 5.
 */
export declare const setTimeout0: (callback: () => void) => void;
export declare const enum OperatingSystem {
    Windows = 1,
    Macintosh = 2,
    Linux = 3
}
export declare const OS: OperatingSystem;
export declare function isLittleEndian(): boolean;
export declare const isChrome: boolean;
export declare const isFirefox: boolean;
export declare const isSafari: boolean;
export declare const isEdge: boolean;
export declare const isAndroid: boolean;
