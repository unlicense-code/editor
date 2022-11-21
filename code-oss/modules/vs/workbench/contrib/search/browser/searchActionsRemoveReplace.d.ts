import { WorkbenchCompressibleObjectTree } from 'vs/platform/list/browser/listService';
import { RenderableMatch } from 'vs/workbench/contrib/search/common/searchModel';
export interface ISearchActionContext {
    readonly viewer: WorkbenchCompressibleObjectTree<RenderableMatch>;
    readonly element: RenderableMatch;
}
export interface IFindInFilesArgs {
    query?: string;
    replace?: string;
    preserveCase?: boolean;
    triggerSearch?: boolean;
    filesToInclude?: string;
    filesToExclude?: string;
    isRegex?: boolean;
    isCaseSensitive?: boolean;
    matchWholeWord?: boolean;
    useExcludeSettingsAndIgnoreFiles?: boolean;
    onlyOpenEditors?: boolean;
}
/**
 * Returns element to focus after removing the given element
 */
export declare function getElementToFocusAfterRemoved(viewer: WorkbenchCompressibleObjectTree<RenderableMatch>, element: RenderableMatch, elementsToRemove: RenderableMatch[]): RenderableMatch | undefined;
/***
 * Finds the last element in the tree with the same type as `element`
 */
export declare function getLastNodeFromSameType(viewer: WorkbenchCompressibleObjectTree<RenderableMatch>, element: RenderableMatch): RenderableMatch | undefined;
