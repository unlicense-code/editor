import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ToggleDevToolsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ConfigureRuntimeArgumentsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleSharedProcessAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ReloadWindowWithExtensionsDisabledAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
