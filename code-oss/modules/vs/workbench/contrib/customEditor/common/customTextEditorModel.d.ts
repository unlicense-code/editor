import { Event } from 'vs/base/common/event';
import { Disposable, IReference } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IResolvedTextEditorModel } from 'vs/editor/common/services/resolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IRevertOptions, ISaveOptions } from 'vs/workbench/common/editor';
import { ICustomEditorModel } from 'vs/workbench/contrib/customEditor/common/customEditor';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export declare class CustomTextEditorModel extends Disposable implements ICustomEditorModel {
    readonly viewType: string;
    private readonly _resource;
    private readonly _model;
    private readonly textFileService;
    static create(instantiationService: IInstantiationService, viewType: string, resource: URI): Promise<CustomTextEditorModel>;
    private readonly _textFileModel;
    private readonly _onDidChangeOrphaned;
    readonly onDidChangeOrphaned: Event<void>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: Event<void>;
    constructor(viewType: string, _resource: URI, _model: IReference<IResolvedTextEditorModel>, textFileService: ITextFileService);
    get resource(): URI;
    isReadonly(): boolean;
    get backupId(): undefined;
    isDirty(): boolean;
    isOrphaned(): boolean;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<void>;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    revert(options?: IRevertOptions): Promise<void>;
    saveCustomEditor(options?: ISaveOptions): Promise<URI | undefined>;
    saveCustomEditorAs(resource: URI, targetResource: URI, options?: ISaveOptions): Promise<boolean>;
}
