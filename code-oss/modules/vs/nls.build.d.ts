export interface ILocalizeInfo {
    key: string;
    comment: string[];
}
export declare function localize(data: ILocalizeInfo | string, message: string, ...args: (string | number | boolean | undefined | null)[]): string;
export declare function getConfiguredDefaultLocale(): string | undefined;
/**
 * Invoked by the loader at build-time
 */
export declare function load(name: string, req: AMDLoader.IRelativeRequire, load: AMDLoader.IPluginLoadCallback, config: AMDLoader.IConfigurationOptions): void;
/**
 * Invoked by the loader at build-time
 */
export declare function write(pluginName: string, moduleName: string, write: AMDLoader.IPluginWriteCallback): void;
/**
 * Invoked by the loader at build-time
 */
export declare function writeFile(pluginName: string, moduleName: string, req: AMDLoader.IRelativeRequire, write: AMDLoader.IPluginWriteFileCallback, config: AMDLoader.IConfigurationOptions): void;
/**
 * Invoked by the loader at build-time
 */
export declare function finishBuild(write: AMDLoader.IPluginWriteFileCallback): void;
