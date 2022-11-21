/// <reference types="node" />
/// <reference types="node" />
import * as http from 'http';
import * as url from 'url';
import { ServerParsedArgs } from 'vs/server/node/serverEnvironmentService';
export declare const enum ServerConnectionTokenType {
    None = 0,
    Optional = 1,
    Mandatory = 2
}
export declare class NoneServerConnectionToken {
    readonly type = ServerConnectionTokenType.None;
    validate(connectionToken: any): boolean;
}
export declare class OptionalServerConnectionToken {
    readonly value: string;
    readonly type = ServerConnectionTokenType.Optional;
    constructor(value: string);
    validate(connectionToken: any): boolean;
}
export declare class MandatoryServerConnectionToken {
    readonly value: string;
    readonly type = ServerConnectionTokenType.Mandatory;
    constructor(value: string);
    validate(connectionToken: any): boolean;
}
export declare type ServerConnectionToken = NoneServerConnectionToken | OptionalServerConnectionToken | MandatoryServerConnectionToken;
export declare class ServerConnectionTokenParseError {
    readonly message: string;
    constructor(message: string);
}
export declare function parseServerConnectionToken(args: ServerParsedArgs, defaultValue: () => Promise<string>): Promise<ServerConnectionToken | ServerConnectionTokenParseError>;
export declare function determineServerConnectionToken(args: ServerParsedArgs): Promise<ServerConnectionToken | ServerConnectionTokenParseError>;
export declare function requestHasValidConnectionToken(connectionToken: ServerConnectionToken, req: http.IncomingMessage, parsedUrl: url.UrlWithParsedQuery): boolean;
