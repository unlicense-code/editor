import { BrandedService } from 'vs/platform/instantiation/common/instantiation';
import { INotebookEditor, INotebookEditorContribution, INotebookEditorContributionDescription } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
export declare function registerNotebookContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (editor: INotebookEditor, ...services: Services): INotebookEditorContribution;
}): void;
export declare namespace NotebookEditorExtensionsRegistry {
    function getEditorContributions(): INotebookEditorContributionDescription[];
    function getSomeEditorContributions(ids: string[]): INotebookEditorContributionDescription[];
}
