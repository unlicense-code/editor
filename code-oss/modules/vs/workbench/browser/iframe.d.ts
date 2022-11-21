/**
 * Returns a sha-256 composed of `parentOrigin` and `salt` converted to base 32
 */
export declare function parentOriginHash(parentOrigin: string, salt: string): Promise<string>;
