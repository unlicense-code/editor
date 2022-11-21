import * as vscode from 'vscode';
import { UriComponents } from 'vs/base/common/uri';
import { ExtHostTimelineShape, IMainContext } from 'vs/workbench/api/common/extHost.protocol';
import { Timeline } from 'vs/workbench/contrib/timeline/common/timeline';
import { IDisposable } from 'vs/base/common/lifecycle';
import { CommandsConverter, ExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export interface IExtHostTimeline extends ExtHostTimelineShape {
    readonly _serviceBrand: undefined;
    $getTimeline(id: string, uri: UriComponents, options: vscode.TimelineOptions, token: vscode.CancellationToken): Promise<Timeline | undefined>;
}
export declare const IExtHostTimeline: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostTimeline>;
export declare class ExtHostTimeline implements IExtHostTimeline {
    readonly _serviceBrand: undefined;
    private _proxy;
    private _providers;
    private _itemsBySourceAndUriMap;
    constructor(mainContext: IMainContext, commands: ExtHostCommands);
    $getTimeline(id: string, uri: UriComponents, options: vscode.TimelineOptions, token: vscode.CancellationToken): Promise<Timeline | undefined>;
    registerTimelineProvider(scheme: string | string[], provider: vscode.TimelineProvider, _extensionId: ExtensionIdentifier, commandConverter: CommandsConverter): IDisposable;
    private convertTimelineItem;
    private registerTimelineProviderCore;
}
