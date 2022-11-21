import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { CustomEditorInfo } from 'vs/workbench/contrib/customEditor/common/customEditor';
export declare class ContributedCustomEditors extends Disposable {
    private static readonly CUSTOM_EDITORS_STORAGE_ID;
    private static readonly CUSTOM_EDITORS_ENTRY_ID;
    private readonly _editors;
    private readonly _memento;
    constructor(storageService: IStorageService);
    private readonly _onChange;
    readonly onChange: import("vs/base/common/event").Event<void>;
    private update;
    [Symbol.iterator](): Iterator<CustomEditorInfo>;
    get(viewType: string): CustomEditorInfo | undefined;
    getContributedEditors(resource: URI): readonly CustomEditorInfo[];
    private add;
}
