import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { IExtUri } from 'vs/base/common/resources';
export declare class UriIdentityService implements IUriIdentityService {
    private readonly _fileService;
    readonly _serviceBrand: undefined;
    readonly extUri: IExtUri;
    private readonly _dispooables;
    private readonly _canonicalUris;
    private readonly _limit;
    constructor(_fileService: IFileService);
    dispose(): void;
    asCanonicalUri(uri: URI): URI;
    private _checkTrim;
}
