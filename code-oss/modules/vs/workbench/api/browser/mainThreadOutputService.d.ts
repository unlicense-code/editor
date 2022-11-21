import { IOutputService, OutputChannelUpdateMode } from 'vs/workbench/services/output/common/output';
import { MainThreadOutputServiceShape } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { UriComponents } from 'vs/base/common/uri';
import { Disposable } from 'vs/base/common/lifecycle';
import { IViewsService } from 'vs/workbench/common/views';
export declare class MainThreadOutputService extends Disposable implements MainThreadOutputServiceShape {
    private static _extensionIdPool;
    private readonly _proxy;
    private readonly _outputService;
    private readonly _viewsService;
    constructor(extHostContext: IExtHostContext, outputService: IOutputService, viewsService: IViewsService);
    $register(label: string, file: UriComponents, log: boolean, languageId: string | undefined, extensionId: string): Promise<string>;
    $update(channelId: string, mode: OutputChannelUpdateMode, till?: number): Promise<void>;
    $reveal(channelId: string, preserveFocus: boolean): Promise<void>;
    $close(channelId: string): Promise<void>;
    $dispose(channelId: string): Promise<void>;
    private _getChannel;
}
