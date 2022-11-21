import { Event } from 'vs/base/common/event';
import { IDisposable, IReference } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IRevertOptions, ISaveOptions } from 'vs/workbench/common/editor';
import { RegisteredEditorPriority } from 'vs/workbench/services/editor/common/editorResolverService';
export declare const ICustomEditorService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ICustomEditorService>;
export declare const CONTEXT_ACTIVE_CUSTOM_EDITOR_ID: RawContextKey<string>;
export declare const CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE: RawContextKey<boolean>;
export interface CustomEditorCapabilities {
    readonly supportsMultipleEditorsPerDocument?: boolean;
}
export interface ICustomEditorService {
    _serviceBrand: any;
    readonly models: ICustomEditorModelManager;
    getCustomEditor(viewType: string): CustomEditorInfo | undefined;
    getAllCustomEditors(resource: URI): CustomEditorInfoCollection;
    getContributedCustomEditors(resource: URI): CustomEditorInfoCollection;
    getUserConfiguredCustomEditors(resource: URI): CustomEditorInfoCollection;
    registerCustomEditorCapabilities(viewType: string, options: CustomEditorCapabilities): IDisposable;
    getCustomEditorCapabilities(viewType: string): CustomEditorCapabilities | undefined;
}
export interface ICustomEditorModelManager {
    getAllModels(resource: URI): Promise<ICustomEditorModel[]>;
    get(resource: URI, viewType: string): Promise<ICustomEditorModel | undefined>;
    tryRetain(resource: URI, viewType: string): Promise<IReference<ICustomEditorModel>> | undefined;
    add(resource: URI, viewType: string, model: Promise<ICustomEditorModel>): Promise<IReference<ICustomEditorModel>>;
    disposeAllModelsForView(viewType: string): void;
}
export interface ICustomEditorModel extends IDisposable {
    readonly viewType: string;
    readonly resource: URI;
    readonly backupId: string | undefined;
    isReadonly(): boolean;
    readonly onDidChangeReadonly: Event<void>;
    isOrphaned(): boolean;
    readonly onDidChangeOrphaned: Event<void>;
    isDirty(): boolean;
    readonly onDidChangeDirty: Event<void>;
    revert(options?: IRevertOptions): Promise<void>;
    saveCustomEditor(options?: ISaveOptions): Promise<URI | undefined>;
    saveCustomEditorAs(resource: URI, targetResource: URI, currentOptions?: ISaveOptions): Promise<boolean>;
}
export declare const enum CustomEditorPriority {
    default = "default",
    builtin = "builtin",
    option = "option"
}
export interface CustomEditorSelector {
    readonly filenamePattern?: string;
}
export interface CustomEditorDescriptor {
    readonly id: string;
    readonly displayName: string;
    readonly providerDisplayName: string;
    readonly priority: RegisteredEditorPriority;
    readonly selector: readonly CustomEditorSelector[];
}
export declare class CustomEditorInfo implements CustomEditorDescriptor {
    readonly id: string;
    readonly displayName: string;
    readonly providerDisplayName: string;
    readonly priority: RegisteredEditorPriority;
    readonly selector: readonly CustomEditorSelector[];
    constructor(descriptor: CustomEditorDescriptor);
    matches(resource: URI): boolean;
}
export declare class CustomEditorInfoCollection {
    readonly allEditors: readonly CustomEditorInfo[];
    constructor(editors: readonly CustomEditorInfo[]);
    get length(): number;
    /**
     * Find the single default editor to use (if any) by looking at the editor's priority and the
     * other contributed editors.
     */
    get defaultEditor(): CustomEditorInfo | undefined;
    /**
     * Find the best available editor to use.
     *
     * Unlike the `defaultEditor`, a bestAvailableEditor can exist even if there are other editors with
     * the same priority.
     */
    get bestAvailableEditor(): CustomEditorInfo | undefined;
}
