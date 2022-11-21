import { IStorageService } from 'vs/platform/storage/common/storage';
export declare function createSuite<T extends IStorageService>(params: {
    setup: () => Promise<T>;
    teardown: (service: T) => Promise<void>;
}): void;
