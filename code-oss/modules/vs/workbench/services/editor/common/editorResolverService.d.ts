import * as glob from 'vs/base/common/glob';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IResourceEditorInput, ITextResourceEditorInput } from 'vs/platform/editor/common/editor';
import { EditorInputWithOptions, EditorInputWithOptionsAndGroup, IResourceDiffEditorInput, IResourceMergeEditorInput, IUntitledTextResourceEditorInput, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { PreferredGroup } from 'vs/workbench/services/editor/common/editorService';
import { AtLeastOne } from 'vs/base/common/types';
export declare const IEditorResolverService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEditorResolverService>;
export declare type EditorAssociation = {
    readonly viewType: string;
    readonly filenamePattern?: string;
};
export declare type EditorAssociations = readonly EditorAssociation[];
export declare const editorsAssociationsSettingId = "workbench.editorAssociations";
export interface IEditorType {
    readonly id: string;
    readonly displayName: string;
    readonly providerDisplayName: string;
}
export declare enum RegisteredEditorPriority {
    builtin = "builtin",
    option = "option",
    exclusive = "exclusive",
    default = "default"
}
/**
 * If we didn't resolve an editor dictates what to do with the opening state
 * ABORT = Do not continue with opening the editor
 * NONE = Continue as if the resolution has been disabled as the service could not resolve one
 */
export declare const enum ResolvedStatus {
    ABORT = 1,
    NONE = 2
}
export declare type ResolvedEditor = EditorInputWithOptionsAndGroup | ResolvedStatus;
export declare type RegisteredEditorOptions = {
    /**
     * If your editor cannot be opened in multiple groups for the same resource
     */
    singlePerResource?: boolean | (() => boolean);
    /**
     * Whether or not you can support opening the given resource.
     * If omitted we assume you can open everything
     */
    canSupportResource?: (resource: URI) => boolean;
};
export declare type RegisteredEditorInfo = {
    id: string;
    label: string;
    detail?: string;
    priority: RegisteredEditorPriority;
};
declare type EditorInputFactoryResult = EditorInputWithOptions | Promise<EditorInputWithOptions>;
export declare type EditorInputFactoryFunction = (editorInput: IResourceEditorInput | ITextResourceEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
export declare type UntitledEditorInputFactoryFunction = (untitledEditorInput: IUntitledTextResourceEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
export declare type DiffEditorInputFactoryFunction = (diffEditorInput: IResourceDiffEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
export declare type MergeEditorInputFactoryFunction = (mergeEditorInput: IResourceMergeEditorInput, group: IEditorGroup) => EditorInputFactoryResult;
declare type EditorInputFactories = {
    createEditorInput?: EditorInputFactoryFunction;
    createUntitledEditorInput?: UntitledEditorInputFactoryFunction;
    createDiffEditorInput?: DiffEditorInputFactoryFunction;
    createMergeEditorInput?: MergeEditorInputFactoryFunction;
};
export declare type EditorInputFactoryObject = AtLeastOne<EditorInputFactories>;
export interface IEditorResolverService {
    readonly _serviceBrand: undefined;
    /**
     * Given a resource finds the editor associations that match it from the user's settings
     * @param resource The resource to match
     * @return The matching associations
     */
    getAssociationsForResource(resource: URI): EditorAssociations;
    /**
     * Updates the user's association to include a specific editor ID as a default for the given glob pattern
     * @param globPattern The glob pattern (must be a string as settings don't support relative glob)
     * @param editorID The ID of the editor to make a user default
     */
    updateUserAssociations(globPattern: string, editorID: string): void;
    /**
     * Emitted when an editor is registered or unregistered.
     */
    readonly onDidChangeEditorRegistrations: Event<void>;
    /**
     * Given a callback, run the callback pausing the registration emitter
     */
    bufferChangeEvents(callback: Function): void;
    /**
     * Registers a specific editor. Editors with the same glob pattern and ID will be grouped together by the resolver.
     * This allows for registration of the factories in different locations
     * @param globPattern The glob pattern for this registration
     * @param editorInfo Information about the registration
     * @param options Specific options which apply to this registration
     * @param editorFactoryObject The editor input factory functions
     */
    registerEditor(globPattern: string | glob.IRelativePattern, editorInfo: RegisteredEditorInfo, options: RegisteredEditorOptions, editorFactoryObject: EditorInputFactoryObject): IDisposable;
    /**
     * Given an editor resolves it to the suitable ResolvedEitor based on user extensions, settings, and built-in editors
     * @param editor The editor to resolve
     * @param preferredGroup The group you want to open the editor in
     * @returns An EditorInputWithOptionsAndGroup if there is an available editor or a status of how to proceed
     */
    resolveEditor(editor: IUntypedEditorInput, preferredGroup: PreferredGroup | undefined): Promise<ResolvedEditor>;
    /**
     * Given a resource returns all the editor ids that match that resource. If there is exclusive editor we return an empty array
     * @param resource The resource
     * @returns A list of editor ids
     */
    getEditors(resource: URI): RegisteredEditorInfo[];
    /**
     * A set of all the editors that are registered to the editor resolver.
     */
    getEditors(): RegisteredEditorInfo[];
}
export declare function priorityToRank(priority: RegisteredEditorPriority): number;
export declare function globMatchesResource(globPattern: string | glob.IRelativePattern, resource: URI): boolean;
export {};
