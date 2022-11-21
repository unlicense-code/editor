import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers';
export declare class MainThreadWebviewManager extends Disposable {
    constructor(context: IExtHostContext, instantiationService: IInstantiationService);
}
