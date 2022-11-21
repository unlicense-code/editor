import { URI } from 'vs/base/common/uri';
interface IDataTransferFile {
    readonly name: string;
    readonly uri?: URI;
    data(): Promise<Uint8Array>;
}
export interface IDataTransferItem {
    readonly id: string;
    asString(): Thenable<string>;
    asFile(): IDataTransferFile | undefined;
    value: any;
}
export declare function createStringDataTransferItem(stringOrPromise: string | Promise<string>): IDataTransferItem;
export declare function createFileDataTransferItem(fileName: string, uri: URI | undefined, data: () => Promise<Uint8Array>): IDataTransferItem;
export declare class VSDataTransfer {
    private readonly _entries;
    get size(): number;
    has(mimeType: string): boolean;
    get(mimeType: string): IDataTransferItem | undefined;
    append(mimeType: string, value: IDataTransferItem): void;
    replace(mimeType: string, value: IDataTransferItem): void;
    delete(mimeType: string): void;
    entries(): Iterable<[string, IDataTransferItem]>;
    values(): Iterable<IDataTransferItem>;
    forEach(f: (value: IDataTransferItem, key: string) => void): void;
    private toKey;
}
export declare const UriList: Readonly<{
    create: (entries: ReadonlyArray<string | URI>) => string;
    split: (str: string) => string[];
    parse: (str: string) => string[];
}>;
export {};
