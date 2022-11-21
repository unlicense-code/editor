import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorSerializer } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { ITextEditorService } from 'vs/workbench/services/textfile/common/textEditorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { FileEditorInput } from 'vs/workbench/contrib/files/browser/editors/fileEditorInput';
import { IFileService } from 'vs/platform/files/common/files';
export declare class FileEditorInputSerializer implements IEditorSerializer {
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FileEditorInput;
}
export declare class FileEditorWorkingCopyEditorHandler extends Disposable implements IWorkbenchContribution {
    private readonly workingCopyEditorService;
    private readonly textEditorService;
    private readonly fileService;
    constructor(workingCopyEditorService: IWorkingCopyEditorService, textEditorService: ITextEditorService, fileService: IFileService);
    private installHandler;
}
