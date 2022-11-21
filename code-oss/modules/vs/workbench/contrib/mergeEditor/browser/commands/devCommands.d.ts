import { URI } from 'vs/base/common/uri';
import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class MergeEditorCopyContentsToJSON extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class MergeEditorSaveContentsToFolder extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class MergeEditorLoadContentsFromFolder extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, args?: {
        folderUri?: URI;
        resultState?: 'initial' | 'current';
    }): Promise<void>;
}
