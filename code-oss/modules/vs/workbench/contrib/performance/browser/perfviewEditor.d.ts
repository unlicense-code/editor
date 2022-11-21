import { URI } from 'vs/base/common/uri';
import { TextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
export declare class PerfviewContrib {
    private readonly _registration;
    constructor(instaService: IInstantiationService, textModelResolverService: ITextModelService);
    dispose(): void;
}
export declare class PerfviewInput extends TextResourceEditorInput {
    static readonly Id = "PerfviewInput";
    static readonly Uri: URI;
    get typeId(): string;
    constructor(textModelResolverService: ITextModelService, textFileService: ITextFileService, editorService: IEditorService, fileService: IFileService, labelService: ILabelService);
}
