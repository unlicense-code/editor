export interface INLSPluginConfigAvailableLanguages {
    '*'?: string;
    [module: string]: string | undefined;
}
interface IBundledStrings {
    [moduleId: string]: string[];
}
export interface ILocalizeInfo {
    key: string;
    comment: string[];
}
interface ILocalizeFunc {
    (info: ILocalizeInfo, message: string, ...args: (string | number | boolean | undefined | null)[]): string;
    (key: string, message: string, ...args: (string | number | boolean | undefined | null)[]): string;
}
interface IBoundLocalizeFunc {
    (idx: number, defaultValue: null): string;
}
interface IConsumerAPI {
    localize: ILocalizeFunc | IBoundLocalizeFunc;
    getConfiguredDefaultLocale(stringFromLocalizeCall: string): string | undefined;
}
/**
 * Localize a message.
 *
 * `message` can contain `{n}` notation where it is replaced by the nth value in `...args`
 * For example, `localize({ key: 'sayHello', comment: ['Welcomes user'] }, 'hello {0}', name)`
 */
export declare function localize(info: ILocalizeInfo, message: string, ...args: (string | number | boolean | undefined | null)[]): string;
/**
 * Localize a message.
 *
 * `message` can contain `{n}` notation where it is replaced by the nth value in `...args`
 * For example, `localize('sayHello', 'hello {0}', name)`
 */
export declare function localize(key: string, message: string, ...args: (string | number | boolean | undefined | null)[]): string;
/**
 *
 * @param stringFromLocalizeCall You must pass in a string that was returned from a `nls.localize()` call
 * in order to ensure the loader plugin has been initialized before this function is called.
 */
export declare function getConfiguredDefaultLocale(stringFromLocalizeCall: string): string | undefined;
export declare function setPseudoTranslation(value: boolean): void;
/**
 * Invoked in a built product at run-time
 */
export declare function create(key: string, data: IBundledStrings & IConsumerAPI): IConsumerAPI;
/**
 * Invoked by the loader at run-time
 */
export declare function load(name: string, req: AMDLoader.IRelativeRequire, load: AMDLoader.IPluginLoadCallback, config: AMDLoader.IConfigurationOptions): void;
export {};
