import { IStateService } from 'vs/platform/state/node/state';
export declare const IStateMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IStateMainService>;
export interface IStateMainService extends IStateService {
    readonly _serviceBrand: undefined;
    setItem(key: string, data?: object | string | number | boolean | undefined | null): void;
    setItems(items: readonly {
        key: string;
        data?: object | string | number | boolean | undefined | null;
    }[]): void;
    removeItem(key: string): void;
    close(): Promise<void>;
}
