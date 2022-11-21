import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataManifest, IUserDataSyncLogService, IUserDataSyncStoreService } from 'vs/platform/userDataSync/common/userDataSync';
interface IMachineData {
    id: string;
    name: string;
    disabled?: boolean;
    platform?: string;
}
export declare type IUserDataSyncMachine = Readonly<IMachineData> & {
    readonly isCurrent: boolean;
};
export declare const IUserDataSyncMachinesService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataSyncMachinesService>;
export interface IUserDataSyncMachinesService {
    _serviceBrand: any;
    readonly onDidChange: Event<void>;
    getMachines(manifest?: IUserDataManifest): Promise<IUserDataSyncMachine[]>;
    addCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    removeCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    renameMachine(machineId: string, name: string): Promise<void>;
    setEnablements(enbalements: [string, boolean][]): Promise<void>;
}
export declare function isWebPlatform(platform: string): boolean;
export declare class UserDataSyncMachinesService extends Disposable implements IUserDataSyncMachinesService {
    private readonly storageService;
    private readonly userDataSyncStoreService;
    private readonly logService;
    private readonly productService;
    private static readonly VERSION;
    private static readonly RESOURCE;
    _serviceBrand: any;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private readonly currentMachineIdPromise;
    private userData;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, logService: IUserDataSyncLogService, productService: IProductService);
    getMachines(manifest?: IUserDataManifest): Promise<IUserDataSyncMachine[]>;
    addCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    removeCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    renameMachine(machineId: string, name: string, manifest?: IUserDataManifest): Promise<void>;
    setEnablements(enablements: [string, boolean][]): Promise<void>;
    private computeCurrentMachineName;
    private readMachinesData;
    private writeMachinesData;
    private readUserData;
    private parse;
}
export {};
