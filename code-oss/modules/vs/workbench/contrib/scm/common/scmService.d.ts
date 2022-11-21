import { Event } from 'vs/base/common/event';
import { ISCMService, ISCMProvider, ISCMRepository } from './scm';
import { ILogService } from 'vs/platform/log/common/log';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class SCMService implements ISCMService {
    private readonly logService;
    private storageService;
    readonly _serviceBrand: undefined;
    _repositories: Map<string, ISCMRepository>;
    get repositories(): Iterable<ISCMRepository>;
    get repositoryCount(): number;
    private providerCount;
    private readonly _onDidAddProvider;
    readonly onDidAddRepository: Event<ISCMRepository>;
    private readonly _onDidRemoveProvider;
    readonly onDidRemoveRepository: Event<ISCMRepository>;
    constructor(logService: ILogService, contextKeyService: IContextKeyService, storageService: IStorageService);
    registerSCMProvider(provider: ISCMProvider): ISCMRepository;
    getRepository(id: string): ISCMRepository | undefined;
}
