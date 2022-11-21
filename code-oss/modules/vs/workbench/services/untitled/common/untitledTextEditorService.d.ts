import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { UntitledTextEditorModel, IUntitledTextEditorModel } from 'vs/workbench/services/untitled/common/untitledTextEditorModel';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export declare const IUntitledTextEditorService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUntitledTextEditorService>;
export interface INewUntitledTextEditorOptions {
    /**
     * Initial value of the untitled editor. An untitled editor with initial
     * value is dirty right from the beginning.
     */
    initialValue?: string;
    /**
     * Preferred language id to use when saving the untitled editor.
     */
    languageId?: string;
    /**
     * Preferred encoding to use when saving the untitled editor.
     */
    encoding?: string;
}
export interface IExistingUntitledTextEditorOptions extends INewUntitledTextEditorOptions {
    /**
     * A resource to identify the untitled editor to create or return
     * if already existing.
     *
     * Note: the resource will not be used unless the scheme is `untitled`.
     */
    untitledResource?: URI;
}
export interface INewUntitledTextEditorWithAssociatedResourceOptions extends INewUntitledTextEditorOptions {
    /**
     * Resource components to associate with the untitled editor. When saving
     * the untitled editor, the associated components will be used and the user
     * is not being asked to provide a file path.
     *
     * Note: currently it is not possible to specify the `scheme` to use. The
     * untitled editor will saved to the default local or remote resource.
     */
    associatedResource?: {
        authority: string;
        path: string;
        query: string;
        fragment: string;
    };
}
declare type IInternalUntitledTextEditorOptions = IExistingUntitledTextEditorOptions & INewUntitledTextEditorWithAssociatedResourceOptions;
export interface IUntitledTextEditorModelManager {
    /**
     * Events for when untitled text editors change (e.g. getting dirty, saved or reverted).
     */
    readonly onDidChangeDirty: Event<IUntitledTextEditorModel>;
    /**
     * Events for when untitled text editor encodings change.
     */
    readonly onDidChangeEncoding: Event<IUntitledTextEditorModel>;
    /**
     * Events for when untitled text editor labels change.
     */
    readonly onDidChangeLabel: Event<IUntitledTextEditorModel>;
    /**
     * Events for when untitled text editors are about to be disposed.
     */
    readonly onWillDispose: Event<IUntitledTextEditorModel>;
    /**
     * Creates a new untitled editor model with the provided options. If the `untitledResource`
     * property is provided and the untitled editor exists, it will return that existing
     * instance instead of creating a new one.
     */
    create(options?: INewUntitledTextEditorOptions): IUntitledTextEditorModel;
    create(options?: INewUntitledTextEditorWithAssociatedResourceOptions): IUntitledTextEditorModel;
    create(options?: IExistingUntitledTextEditorOptions): IUntitledTextEditorModel;
    /**
     * Returns an existing untitled editor model if already created before.
     */
    get(resource: URI): IUntitledTextEditorModel | undefined;
    /**
     * Returns the value of the untitled editor, undefined if none exists
     * @param resource The URI of the untitled file
     * @returns The content, or undefined
     */
    getValue(resource: URI): string | undefined;
    /**
     * Resolves an untitled editor model from the provided options. If the `untitledResource`
     * property is provided and the untitled editor exists, it will return that existing
     * instance instead of creating a new one.
     */
    resolve(options?: INewUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: INewUntitledTextEditorWithAssociatedResourceOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: IExistingUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
}
export interface IUntitledTextEditorService extends IUntitledTextEditorModelManager {
    readonly _serviceBrand: undefined;
}
export declare class UntitledTextEditorService extends Disposable implements IUntitledTextEditorService {
    private readonly instantiationService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<IUntitledTextEditorModel>;
    private readonly _onDidChangeEncoding;
    readonly onDidChangeEncoding: Event<IUntitledTextEditorModel>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<IUntitledTextEditorModel>;
    private readonly _onDidChangeLabel;
    readonly onDidChangeLabel: Event<IUntitledTextEditorModel>;
    private readonly mapResourceToModel;
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService);
    get(resource: URI): UntitledTextEditorModel | undefined;
    getValue(resource: URI): string | undefined;
    resolve(options?: IInternalUntitledTextEditorOptions): Promise<UntitledTextEditorModel>;
    create(options?: IInternalUntitledTextEditorOptions): UntitledTextEditorModel;
    private doCreateOrGet;
    private massageOptions;
    private doCreate;
    private registerModel;
}
export {};
