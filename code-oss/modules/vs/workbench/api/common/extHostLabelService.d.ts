import { ResourceLabelFormatter } from 'vs/platform/label/common/label';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ExtHostLabelServiceShape, IMainContext } from 'vs/workbench/api/common/extHost.protocol';
export declare class ExtHostLabelService implements ExtHostLabelServiceShape {
    private readonly _proxy;
    private _handlePool;
    constructor(mainContext: IMainContext);
    $registerResourceLabelFormatter(formatter: ResourceLabelFormatter): IDisposable;
}
