export interface ILocalizeInfo {
    key: string;
    comment: string[];
}
export declare function localize(data: ILocalizeInfo | string, message: string, ...args: any[]): string;
export declare function getConfiguredDefaultLocale(_: string): undefined;
