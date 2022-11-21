import { Disposable } from 'vs/base/common/lifecycle';
import { ILabelService, ResourceLabelFormatter } from 'vs/platform/label/common/label';
import { MainThreadLabelServiceShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
export declare class MainThreadLabelService extends Disposable implements MainThreadLabelServiceShape {
    private readonly _labelService;
    private readonly _resourceLabelFormatters;
    constructor(_: IExtHostContext, _labelService: ILabelService);
    $registerResourceLabelFormatter(handle: number, formatter: ResourceLabelFormatter): void;
    $unregisterResourceLabelFormatter(handle: number): void;
}
