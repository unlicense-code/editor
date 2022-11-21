import * as glob from 'vs/base/common/glob';
import { URI } from 'vs/base/common/uri';
import { INotebookExclusiveDocumentFilter, TransientOptions } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { RegisteredEditorPriority } from 'vs/workbench/services/editor/common/editorResolverService';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
declare type NotebookSelector = string | glob.IRelativePattern | INotebookExclusiveDocumentFilter;
export interface NotebookEditorDescriptor {
    readonly extension?: ExtensionIdentifier;
    readonly id: string;
    readonly displayName: string;
    readonly selectors: readonly {
        filenamePattern?: string;
        excludeFileNamePattern?: string;
    }[];
    readonly priority: RegisteredEditorPriority;
    readonly providerDisplayName: string;
    readonly exclusive: boolean;
}
export declare class NotebookProviderInfo {
    readonly extension?: ExtensionIdentifier;
    readonly id: string;
    readonly displayName: string;
    readonly priority: RegisteredEditorPriority;
    readonly providerDisplayName: string;
    readonly exclusive: boolean;
    private _selectors;
    get selectors(): NotebookSelector[];
    private _options;
    get options(): TransientOptions;
    constructor(descriptor: NotebookEditorDescriptor);
    update(args: {
        selectors?: NotebookSelector[];
        options?: TransientOptions;
    }): void;
    matches(resource: URI): boolean;
    static selectorMatches(selector: NotebookSelector, resource: URI): boolean;
    static possibleFileEnding(selectors: NotebookSelector[]): string | undefined;
    private static _possibleFileEnding;
}
export {};
