import { ICommandHandlerDescription } from 'vs/platform/commands/common/commands';
import * as extHostTypes from 'vs/workbench/api/common/extHostTypes';
import * as extHostTypeConverter from 'vs/workbench/api/common/extHostTypeConverters';
import { ExtHostCommandsShape, ICommandDto, ICommandHandlerDescriptionDto } from './extHost.protocol';
import * as languages from 'vs/editor/common/languages';
import type * as vscode from 'vscode';
import { ILogService } from 'vs/platform/log/common/log';
import { IRange } from 'vs/editor/common/core/range';
import { IPosition } from 'vs/editor/common/core/position';
import { URI } from 'vs/base/common/uri';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ISelection } from 'vs/editor/common/core/selection';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export interface ArgumentProcessor {
    processArgument(arg: any): any;
}
export declare class ExtHostCommands implements ExtHostCommandsShape {
    #private;
    readonly _serviceBrand: undefined;
    private readonly _commands;
    private readonly _apiCommands;
    private readonly _logService;
    private readonly _argumentProcessors;
    readonly converter: CommandsConverter;
    constructor(extHostRpc: IExtHostRpcService, logService: ILogService);
    registerArgumentProcessor(processor: ArgumentProcessor): void;
    registerApiCommand(apiCommand: ApiCommand): extHostTypes.Disposable;
    registerCommand(global: boolean, id: string, callback: <T>(...args: any[]) => T | Thenable<T>, thisArg?: any, description?: ICommandHandlerDescription, extension?: IExtensionDescription): extHostTypes.Disposable;
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
    private _doExecuteCommand;
    private _executeContributedCommand;
    private _reportTelemetry;
    $executeContributedCommand(id: string, ...args: any[]): Promise<unknown>;
    getCommands(filterUnderscoreCommands?: boolean): Promise<string[]>;
    $getContributedCommandHandlerDescriptions(): Promise<{
        [id: string]: string | ICommandHandlerDescriptionDto;
    }>;
}
export interface IExtHostCommands extends ExtHostCommands {
}
export declare const IExtHostCommands: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostCommands>;
export declare class CommandsConverter implements extHostTypeConverter.Command.ICommandsConverter {
    private readonly _commands;
    private readonly _lookupApiCommand;
    private readonly _logService;
    readonly delegatingCommandId: string;
    private readonly _cache;
    private _cachIdPool;
    constructor(_commands: ExtHostCommands, _lookupApiCommand: (id: string) => ApiCommand | undefined, _logService: ILogService);
    toInternal(command: vscode.Command, disposables: DisposableStore): ICommandDto;
    toInternal(command: vscode.Command | undefined, disposables: DisposableStore): ICommandDto | undefined;
    fromInternal(command: ICommandDto): vscode.Command | undefined;
    getActualCommand(...args: any[]): vscode.Command | undefined;
    private _executeConvertedCommand;
}
export declare class ApiCommandArgument<V, O = V> {
    readonly name: string;
    readonly description: string;
    readonly validate: (v: V) => boolean;
    readonly convert: (v: V) => O;
    static readonly Uri: ApiCommandArgument<URI, URI>;
    static readonly Position: ApiCommandArgument<extHostTypes.Position, IPosition>;
    static readonly Range: ApiCommandArgument<extHostTypes.Range, IRange>;
    static readonly Selection: ApiCommandArgument<extHostTypes.Selection, ISelection>;
    static readonly Number: ApiCommandArgument<number, number>;
    static readonly String: ApiCommandArgument<string, string>;
    static readonly CallHierarchyItem: ApiCommandArgument<vscode.CallHierarchyItem, {
        _sessionId: string;
        _itemId: string;
        kind: languages.SymbolKind;
        name: string;
        detail?: string | undefined;
        uri: import("vs/base/common/uri").UriComponents;
        range: {
            readonly startLineNumber: number;
            readonly startColumn: number;
            readonly endLineNumber: number;
            readonly endColumn: number;
        };
        selectionRange: {
            readonly startLineNumber: number;
            readonly startColumn: number;
            readonly endLineNumber: number;
            readonly endColumn: number;
        };
        tags?: languages.SymbolTag[] | undefined;
    }>;
    static readonly TypeHierarchyItem: ApiCommandArgument<vscode.TypeHierarchyItem, {
        _sessionId: string;
        _itemId: string;
        kind: languages.SymbolKind;
        name: string;
        detail?: string | undefined;
        uri: import("vs/base/common/uri").UriComponents;
        range: {
            readonly startLineNumber: number;
            readonly startColumn: number;
            readonly endLineNumber: number;
            readonly endColumn: number;
        };
        selectionRange: {
            readonly startLineNumber: number;
            readonly startColumn: number;
            readonly endLineNumber: number;
            readonly endColumn: number;
        };
        tags?: languages.SymbolTag[] | undefined;
    }>;
    static readonly TestItem: ApiCommandArgument<vscode.TestItem, import("../../contrib/testing/common/testTypes").ITestItem>;
    constructor(name: string, description: string, validate: (v: V) => boolean, convert: (v: V) => O);
    optional(): ApiCommandArgument<V | undefined | null, O | undefined | null>;
    with(name: string | undefined, description: string | undefined): ApiCommandArgument<V, O>;
}
export declare class ApiCommandResult<V, O = V> {
    readonly description: string;
    readonly convert: (v: V, apiArgs: any[], cmdConverter: CommandsConverter) => O;
    static readonly Void: ApiCommandResult<void, void>;
    constructor(description: string, convert: (v: V, apiArgs: any[], cmdConverter: CommandsConverter) => O);
}
export declare class ApiCommand {
    readonly id: string;
    readonly internalId: string;
    readonly description: string;
    readonly args: ApiCommandArgument<any, any>[];
    readonly result: ApiCommandResult<any, any>;
    constructor(id: string, internalId: string, description: string, args: ApiCommandArgument<any, any>[], result: ApiCommandResult<any, any>);
}
