import * as glob from 'vs/base/common/glob';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUntypedEditorInput } from 'vs/workbench/common/editor';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { RegisteredEditorInfo, RegisteredEditorOptions, EditorAssociations, IEditorResolverService, ResolvedEditor, EditorInputFactoryObject } from 'vs/workbench/services/editor/common/editorResolverService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { PreferredGroup } from 'vs/workbench/services/editor/common/editorService';
export declare class EditorResolverService extends Disposable implements IEditorResolverService {
    private readonly editorGroupService;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly quickInputService;
    private readonly notificationService;
    private readonly telemetryService;
    private readonly storageService;
    private readonly extensionService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeEditorRegistrations;
    readonly onDidChangeEditorRegistrations: import("vs/base/common/event").Event<void>;
    private static readonly configureDefaultID;
    private static readonly cacheStorageID;
    private static readonly conflictingDefaultsStorageID;
    private _editors;
    private _flattenedEditors;
    private _shouldReFlattenEditors;
    private cache;
    constructor(editorGroupService: IEditorGroupsService, instantiationService: IInstantiationService, configurationService: IConfigurationService, quickInputService: IQuickInputService, notificationService: INotificationService, telemetryService: ITelemetryService, storageService: IStorageService, extensionService: IExtensionService, logService: ILogService);
    private resolveUntypedInputAndGroup;
    resolveEditor(editor: IUntypedEditorInput, preferredGroup: PreferredGroup | undefined): Promise<ResolvedEditor>;
    private doResolveSideBySideEditor;
    bufferChangeEvents(callback: Function): void;
    registerEditor(globPattern: string | glob.IRelativePattern, editorInfo: RegisteredEditorInfo, options: RegisteredEditorOptions, editorFactoryObject: EditorInputFactoryObject): IDisposable;
    getAssociationsForResource(resource: URI): EditorAssociations;
    private getAllUserAssociations;
    /**
     * Given the nested nature of the editors map, we merge factories of the same glob and id to make it flat
     * and easier to work with
     */
    private _flattenEditorsMap;
    /**
     * Returns all editors as an array. Possible to contain duplicates
     */
    private get _registeredEditors();
    updateUserAssociations(globPattern: string, editorID: string): void;
    private findMatchingEditors;
    getEditors(resource?: URI): RegisteredEditorInfo[];
    /**
     * Given a resource and an editorId selects the best possible editor
     * @returns The editor and whether there was another default which conflicted with it
     */
    private getEditor;
    private doResolveEditor;
    /**
     * Moves an editor with the resource and viewtype to target group if one exists
     * Additionally will close any other editors that are open for that resource and viewtype besides the first one found
     * @param resource The resource of the editor
     * @param viewType the viewtype of the editor
     * @param targetGroup The group to move it to
     * @returns An editor input if one exists, else undefined
     */
    private moveExistingEditorForResource;
    /**
     * Given a resource and an editorId, returns all editors open for that resource and editorId.
     * @param resource The resource specified
     * @param editorId The editorID
     * @returns A list of editors
     */
    private findExistingEditorsForResource;
    private doHandleConflictingDefaults;
    private mapEditorsToQuickPickEntry;
    private doPickEditor;
    private sendEditorResolutionTelemetry;
    private cacheEditors;
    private resourceMatchesCache;
}
