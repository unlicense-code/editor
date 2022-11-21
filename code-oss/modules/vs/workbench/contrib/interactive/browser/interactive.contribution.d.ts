import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorSerializer } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { InteractiveEditorInput } from 'vs/workbench/contrib/interactive/browser/interactiveEditorInput';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class InteractiveDocumentContribution extends Disposable implements IWorkbenchContribution {
    constructor(notebookService: INotebookService, editorResolverService: IEditorResolverService, editorService: IEditorService);
}
export declare class InteractiveEditorSerializer implements IEditorSerializer {
    private configurationService;
    static readonly ID: string;
    constructor(configurationService: IConfigurationService);
    canSerialize(): boolean;
    serialize(input: EditorInput): string;
    deserialize(instantiationService: IInstantiationService, raw: string): InteractiveEditorInput | undefined;
}
