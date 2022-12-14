import { VSBuffer } from 'vs/base/common/buffer';
import { URI, UriComponents } from 'vs/base/common/uri';
import { MarshalledId } from './marshallingIds';
export declare function stringify(obj: any): string;
export declare function parse(text: string): any;
export interface MarshalledObject {
    $mid: MarshalledId;
}
declare type Deserialize<T> = T extends UriComponents ? URI : T extends VSBuffer ? VSBuffer : T extends object ? Revived<T> : T;
export declare type Revived<T> = {
    [K in keyof T]: Deserialize<T[K]>;
};
export declare function revive<T = any>(obj: any, depth?: number): Revived<T>;
export {};
