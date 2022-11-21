import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
export declare const IInteractiveHistoryService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IInteractiveHistoryService>;
export interface IInteractiveHistoryService {
    readonly _serviceBrand: undefined;
    addToHistory(uri: URI, value: string): void;
    getPreviousValue(uri: URI): string | null;
    getNextValue(uri: URI): string | null;
    replaceLast(uri: URI, value: string): void;
    clearHistory(uri: URI): void;
    has(uri: URI): boolean;
}
export declare class InteractiveHistoryService extends Disposable implements IInteractiveHistoryService {
    #private;
    readonly _serviceBrand: undefined;
    constructor();
    addToHistory(uri: URI, value: string): void;
    getPreviousValue(uri: URI): string | null;
    getNextValue(uri: URI): string | null;
    replaceLast(uri: URI, value: string): void;
    clearHistory(uri: URI): void;
    has(uri: URI): boolean;
}
