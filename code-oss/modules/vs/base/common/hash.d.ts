/**
 * Return a hash value for an object.
 */
export declare function hash(obj: any): number;
export declare function doHash(obj: any, hashVal: number): number;
export declare function numberHash(val: number, initialHashVal: number): number;
export declare function stringHash(s: string, hashVal: number): number;
export declare class Hasher {
    private _value;
    get value(): number;
    hash(obj: any): number;
}
export declare function toHexString(buffer: ArrayBuffer): string;
export declare function toHexString(value: number, bitsize?: number): string;
/**
 * A SHA1 implementation that works with strings and does not allocate.
 */
export declare class StringSHA1 {
    private static _bigBlock32;
    private _h0;
    private _h1;
    private _h2;
    private _h3;
    private _h4;
    private readonly _buff;
    private readonly _buffDV;
    private _buffLen;
    private _totalLen;
    private _leftoverHighSurrogate;
    private _finished;
    constructor();
    update(str: string): void;
    private _push;
    digest(): string;
    private _wrapUp;
    private _step;
}
