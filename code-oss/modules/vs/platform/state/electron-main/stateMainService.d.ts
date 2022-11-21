import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { StateService } from 'vs/platform/state/node/stateService';
export declare class StateMainService extends StateService implements IStateMainService {
    readonly _serviceBrand: undefined;
    setItem(key: string, data?: object | string | number | boolean | undefined | null): void;
    setItems(items: readonly {
        key: string;
        data?: object | string | number | boolean | undefined | null;
    }[]): void;
    removeItem(key: string): void;
    close(): Promise<void>;
}
