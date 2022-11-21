import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ViewContainer } from 'vs/workbench/common/views';
export declare class EditSessionsDataViews extends Disposable {
    private readonly instantiationService;
    constructor(container: ViewContainer, instantiationService: IInstantiationService);
    private registerViews;
}
