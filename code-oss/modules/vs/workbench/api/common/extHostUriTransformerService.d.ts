import { IURITransformer } from 'vs/base/common/uriIpc';
import { URI, UriComponents } from 'vs/base/common/uri';
export interface IURITransformerService extends IURITransformer {
    readonly _serviceBrand: undefined;
}
export declare const IURITransformerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IURITransformerService>;
export declare class URITransformerService implements IURITransformerService {
    readonly _serviceBrand: undefined;
    transformIncoming: (uri: UriComponents) => UriComponents;
    transformOutgoing: (uri: UriComponents) => UriComponents;
    transformOutgoingURI: (uri: URI) => URI;
    transformOutgoingScheme: (scheme: string) => string;
    constructor(delegate: IURITransformer | null);
}
