import { CancellationToken } from 'vs/base/common/cancellation';
import { IStringDictionary } from 'vs/base/common/collections';
import { FormattingOptions } from 'vs/base/common/jsonFormatter';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IHeaders, IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { IRequestService } from 'vs/platform/request/common/request';
import { IUserData, IUserDataSyncUtilService, SyncResource, IUserDataSynchroniser, IUserDataResourceManifest } from 'vs/platform/userDataSync/common/userDataSync';
export declare class UserDataSyncClient extends Disposable {
    readonly testServer: UserDataSyncTestServer;
    readonly instantiationService: TestInstantiationService;
    constructor(testServer?: UserDataSyncTestServer);
    setUp(empty?: boolean): Promise<void>;
    sync(): Promise<void>;
    read(resource: SyncResource, collection?: string): Promise<IUserData>;
    getResourceManifest(): Promise<IUserDataResourceManifest | null>;
    getSynchronizer(source: SyncResource): IUserDataSynchroniser;
}
export declare class UserDataSyncTestServer implements IRequestService {
    private readonly rateLimit;
    private readonly retryAfter?;
    _serviceBrand: any;
    readonly url: string;
    private session;
    private readonly collections;
    private readonly data;
    private _requests;
    get requests(): {
        url: string;
        type: string;
        headers?: IHeaders;
    }[];
    private _requestsWithAllHeaders;
    get requestsWithAllHeaders(): {
        url: string;
        type: string;
        headers?: IHeaders;
    }[];
    private _responses;
    get responses(): {
        status: number;
    }[];
    reset(): void;
    private manifestRef;
    private collectionCounter;
    constructor(rateLimit?: number, retryAfter?: number | undefined);
    resolveProxy(url: string): Promise<string | undefined>;
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    private doRequest;
    private getManifest;
    private getResourceData;
    private writeData;
    private deleteResourceData;
    private createCollection;
    clear(headers?: IHeaders): Promise<IRequestContext>;
    private toResponse;
}
export declare class TestUserDataSyncUtilService implements IUserDataSyncUtilService {
    _serviceBrand: any;
    resolveDefaultIgnoredSettings(): Promise<string[]>;
    resolveUserBindings(userbindings: string[]): Promise<IStringDictionary<string>>;
    resolveFormattingOptions(file?: URI): Promise<FormattingOptions>;
}
