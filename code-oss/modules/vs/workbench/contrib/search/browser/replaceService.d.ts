import { URI } from 'vs/base/common/uri';
import { IReplaceService } from 'vs/workbench/contrib/search/common/replace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { Match, FileMatch, FileMatchOrMatch } from 'vs/workbench/contrib/search/common/searchModel';
import { IProgress, IProgressStep } from 'vs/platform/progress/common/progress';
import { ITextModelService, ITextModelContentProvider } from 'vs/editor/common/services/resolverService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITextModel } from 'vs/editor/common/model';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService';
import { ILabelService } from 'vs/platform/label/common/label';
export declare class ReplacePreviewContentProvider implements ITextModelContentProvider, IWorkbenchContribution {
    private readonly instantiationService;
    private readonly textModelResolverService;
    constructor(instantiationService: IInstantiationService, textModelResolverService: ITextModelService);
    provideTextContent(uri: URI): Promise<ITextModel> | null;
}
export declare class ReplaceService implements IReplaceService {
    private readonly textFileService;
    private readonly editorService;
    private readonly textModelResolverService;
    private readonly bulkEditorService;
    private readonly labelService;
    readonly _serviceBrand: undefined;
    private static readonly REPLACE_SAVE_SOURCE;
    constructor(textFileService: ITextFileService, editorService: IEditorService, textModelResolverService: ITextModelService, bulkEditorService: IBulkEditService, labelService: ILabelService);
    replace(match: Match): Promise<any>;
    replace(files: FileMatch[], progress?: IProgress<IProgressStep>): Promise<any>;
    replace(match: FileMatchOrMatch, progress?: IProgress<IProgressStep>, resource?: URI): Promise<any>;
    openReplacePreview(element: FileMatchOrMatch, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<any>;
    updateReplacePreview(fileMatch: FileMatch, override?: boolean): Promise<void>;
    private applyEditsToPreview;
    private createEdits;
    private createEdit;
}
