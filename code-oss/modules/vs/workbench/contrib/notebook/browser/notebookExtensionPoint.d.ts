import { ContributedNotebookRendererEntrypoint, RendererMessagingSpec } from 'vs/workbench/contrib/notebook/common/notebookCommon';
declare const NotebookEditorContribution: Readonly<{
    type: "type";
    displayName: "displayName";
    selector: "selector";
    priority: "priority";
}>;
export interface INotebookEditorContribution {
    readonly [NotebookEditorContribution.type]: string;
    readonly [NotebookEditorContribution.displayName]: string;
    readonly [NotebookEditorContribution.selector]?: readonly {
        filenamePattern?: string;
        excludeFileNamePattern?: string;
    }[];
    readonly [NotebookEditorContribution.priority]?: string;
}
declare const NotebookRendererContribution: Readonly<{
    id: "id";
    displayName: "displayName";
    mimeTypes: "mimeTypes";
    entrypoint: "entrypoint";
    hardDependencies: "dependencies";
    optionalDependencies: "optionalDependencies";
    requiresMessaging: "requiresMessaging";
}>;
export interface INotebookRendererContribution {
    readonly [NotebookRendererContribution.id]?: string;
    readonly [NotebookRendererContribution.displayName]: string;
    readonly [NotebookRendererContribution.mimeTypes]?: readonly string[];
    readonly [NotebookRendererContribution.entrypoint]: ContributedNotebookRendererEntrypoint;
    readonly [NotebookRendererContribution.hardDependencies]: readonly string[];
    readonly [NotebookRendererContribution.optionalDependencies]: readonly string[];
    readonly [NotebookRendererContribution.requiresMessaging]: RendererMessagingSpec;
}
declare const NotebookPreloadContribution: Readonly<{
    type: "type";
    entrypoint: "entrypoint";
}>;
interface INotebookPreloadContribution {
    readonly [NotebookPreloadContribution.type]: string;
    readonly [NotebookPreloadContribution.entrypoint]: string;
}
export declare const notebooksExtensionPoint: import("vs/workbench/services/extensions/common/extensionsRegistry").IExtensionPoint<INotebookEditorContribution[]>;
export declare const notebookRendererExtensionPoint: import("vs/workbench/services/extensions/common/extensionsRegistry").IExtensionPoint<INotebookRendererContribution[]>;
export declare const notebookPreloadExtensionPoint: import("vs/workbench/services/extensions/common/extensionsRegistry").IExtensionPoint<INotebookPreloadContribution[]>;
export {};
