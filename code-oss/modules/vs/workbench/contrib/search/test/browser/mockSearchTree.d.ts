import { ITreeNavigator } from 'vs/base/browser/ui/tree/tree';
import { IDisposable } from 'vs/base/common/lifecycle';
import { RenderableMatch } from 'vs/workbench/contrib/search/common/searchModel';
/**
 * Add stub methods as needed
 */
export declare class MockObjectTree<T, TRef> implements IDisposable {
    private elements;
    get onDidChangeFocus(): import("vs/base/common/event").Event<unknown>;
    get onDidChangeSelection(): import("vs/base/common/event").Event<unknown>;
    get onDidOpen(): import("vs/base/common/event").Event<unknown>;
    get onMouseClick(): import("vs/base/common/event").Event<unknown>;
    get onMouseDblClick(): import("vs/base/common/event").Event<unknown>;
    get onContextMenu(): import("vs/base/common/event").Event<unknown>;
    get onKeyDown(): import("vs/base/common/event").Event<unknown>;
    get onKeyUp(): import("vs/base/common/event").Event<unknown>;
    get onKeyPress(): import("vs/base/common/event").Event<unknown>;
    get onDidFocus(): import("vs/base/common/event").Event<unknown>;
    get onDidBlur(): import("vs/base/common/event").Event<unknown>;
    get onDidChangeCollapseState(): import("vs/base/common/event").Event<unknown>;
    get onDidChangeRenderNodeCount(): import("vs/base/common/event").Event<unknown>;
    get onDidDispose(): import("vs/base/common/event").Event<unknown>;
    get lastVisibleElement(): any;
    constructor(elements: any[]);
    domFocus(): void;
    collapse(location: TRef, recursive?: boolean): boolean;
    expand(location: TRef, recursive?: boolean): boolean;
    navigate(start?: TRef): ITreeNavigator<T>;
    getParentElement(elem: RenderableMatch): import("vs/workbench/contrib/search/common/searchModel").FileMatch | import("vs/workbench/contrib/search/common/searchModel").FolderMatch | import("vs/workbench/contrib/search/common/searchModel").SearchResult;
    dispose(): void;
}
