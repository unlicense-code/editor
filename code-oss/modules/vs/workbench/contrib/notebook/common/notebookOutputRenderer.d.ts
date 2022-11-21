import { URI } from 'vs/base/common/uri';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { INotebookRendererInfo, ContributedNotebookRendererEntrypoint, NotebookRendererMatch, RendererMessagingSpec, NotebookRendererEntrypoint, INotebookStaticPreloadInfo as INotebookStaticPreloadInfo } from 'vs/workbench/contrib/notebook/common/notebookCommon';
declare class DependencyList {
    private readonly value;
    readonly defined: boolean;
    constructor(value: Iterable<string>);
    /** Gets whether any of the 'available' dependencies match the ones in this list */
    matches(available: ReadonlyArray<string>): boolean;
}
export declare class NotebookOutputRendererInfo implements INotebookRendererInfo {
    readonly id: string;
    readonly entrypoint: NotebookRendererEntrypoint;
    readonly displayName: string;
    readonly extensionLocation: URI;
    readonly extensionId: ExtensionIdentifier;
    readonly hardDependencies: DependencyList;
    readonly optionalDependencies: DependencyList;
    readonly messaging: RendererMessagingSpec;
    readonly mimeTypes: readonly string[];
    private readonly mimeTypeGlobs;
    readonly isBuiltin: boolean;
    constructor(descriptor: {
        readonly id: string;
        readonly displayName: string;
        readonly entrypoint: ContributedNotebookRendererEntrypoint;
        readonly mimeTypes: readonly string[];
        readonly extension: IExtensionDescription;
        readonly dependencies: readonly string[] | undefined;
        readonly optionalDependencies: readonly string[] | undefined;
        readonly requiresMessaging: RendererMessagingSpec | undefined;
    });
    matchesWithoutKernel(mimeType: string): NotebookRendererMatch;
    matches(mimeType: string, kernelProvides: ReadonlyArray<string>): NotebookRendererMatch;
    private matchesMimeTypeOnly;
}
export declare class NotebookStaticPreloadInfo implements INotebookStaticPreloadInfo {
    readonly type: string;
    readonly entrypoint: URI;
    readonly extensionLocation: URI;
    constructor(descriptor: {
        readonly type: string;
        readonly entrypoint: string;
        readonly extension: IExtensionDescription;
    });
}
export {};
