import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class InstallShellScriptAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class UninstallShellScriptAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
