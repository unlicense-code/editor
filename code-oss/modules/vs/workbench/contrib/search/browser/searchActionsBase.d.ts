import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { WorkbenchCompressibleObjectTree } from 'vs/platform/list/browser/listService';
import { IViewsService } from 'vs/workbench/common/views';
import { SearchView } from 'vs/workbench/contrib/search/browser/searchView';
import { RenderableMatch } from 'vs/workbench/contrib/search/common/searchModel';
import { ISearchConfigurationProperties } from 'vs/workbench/services/search/common/search';
export declare const category: {
    value: string;
    original: string;
};
export declare function isSearchViewFocused(viewsService: IViewsService): boolean;
export declare function appendKeyBindingLabel(label: string, inputKeyBinding: number | ResolvedKeybinding | undefined, keyBindingService2: IKeybindingService): string;
export declare function getSearchView(viewsService: IViewsService): SearchView | undefined;
export declare function getElementsToOperateOnInfo(viewer: WorkbenchCompressibleObjectTree<RenderableMatch, void>, currElement: RenderableMatch | undefined, sortConfig: ISearchConfigurationProperties): {
    elements: RenderableMatch[];
    mustReselect: boolean;
};
export declare function openSearchView(viewsService: IViewsService, focus?: boolean): Promise<SearchView | undefined>;
