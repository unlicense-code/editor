import 'vs/platform/update/common/update.config.contribution';
import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ShowCurrentReleaseNotesAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class CheckForUpdateAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
