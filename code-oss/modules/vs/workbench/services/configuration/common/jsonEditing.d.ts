import { URI } from 'vs/base/common/uri';
import { JSONPath } from 'vs/base/common/json';
export declare const IJSONEditingService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IJSONEditingService>;
export declare const enum JSONEditingErrorCode {
    /**
     * Error when trying to write and save to the file while it is dirty in the editor.
     */
    ERROR_FILE_DIRTY = 0,
    /**
     * Error when trying to write to a file that contains JSON errors.
     */
    ERROR_INVALID_FILE = 1
}
export declare class JSONEditingError extends Error {
    code: JSONEditingErrorCode;
    constructor(message: string, code: JSONEditingErrorCode);
}
export interface IJSONValue {
    path: JSONPath;
    value: any;
}
export interface IJSONEditingService {
    readonly _serviceBrand: undefined;
    write(resource: URI, values: IJSONValue[], save: boolean): Promise<void>;
}
