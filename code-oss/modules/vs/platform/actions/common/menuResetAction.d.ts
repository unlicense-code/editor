import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class MenuHiddenStatesReset extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
