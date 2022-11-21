import { IDebuggerContribution, IDebugSession, IConfigPresentation } from 'vs/workbench/contrib/debug/common/debug';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare function formatPII(value: string, excludePII: boolean, args: {
    [key: string]: string;
} | undefined): string;
/**
 * Filters exceptions (keys marked with "!") from the given object. Used to
 * ensure exception data is not sent on web remotes, see #97628.
 */
export declare function filterExceptionsFromTelemetry<T extends {
    [key: string]: unknown;
}>(data: T): Partial<T>;
export declare function isSessionAttach(session: IDebugSession): boolean;
/**
 * Returns the session or any parent which is an extension host debug session.
 * Returns undefined if there's none.
 */
export declare function getExtensionHostDebugSession(session: IDebugSession): IDebugSession | void;
export declare function isDebuggerMainContribution(dbg: IDebuggerContribution): string | undefined;
export declare function getExactExpressionStartAndEnd(lineContent: string, looseStart: number, looseEnd: number): {
    start: number;
    end: number;
};
export declare function isUri(s: string | undefined): boolean;
export declare function convertToDAPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function convertToVSCPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function getVisibleAndSorted<T extends {
    presentation?: IConfigPresentation;
}>(array: T[]): T[];
export declare function saveAllBeforeDebugStart(configurationService: IConfigurationService, editorService: IEditorService): Promise<void>;
