import { IAsyncDataSource, ITreeRenderer, ITreeNode, ITreeSorter } from 'vs/base/browser/ui/tree/tree';
import { CallHierarchyItem, CallHierarchyDirection, CallHierarchyModel } from 'vs/workbench/contrib/callHierarchy/common/callHierarchy';
import { IIdentityProvider, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { FuzzyScore } from 'vs/base/common/filters';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { Location } from 'vs/editor/common/languages';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
export declare class Call {
    readonly item: CallHierarchyItem;
    readonly locations: Location[] | undefined;
    readonly model: CallHierarchyModel;
    readonly parent: Call | undefined;
    constructor(item: CallHierarchyItem, locations: Location[] | undefined, model: CallHierarchyModel, parent: Call | undefined);
    static compare(a: Call, b: Call): number;
}
export declare class DataSource implements IAsyncDataSource<CallHierarchyModel, Call> {
    getDirection: () => CallHierarchyDirection;
    constructor(getDirection: () => CallHierarchyDirection);
    hasChildren(): boolean;
    getChildren(element: CallHierarchyModel | Call): Promise<Call[]>;
}
export declare class Sorter implements ITreeSorter<Call> {
    compare(element: Call, otherElement: Call): number;
}
export declare class IdentityProvider implements IIdentityProvider<Call> {
    getDirection: () => CallHierarchyDirection;
    constructor(getDirection: () => CallHierarchyDirection);
    getId(element: Call): {
        toString(): string;
    };
}
declare class CallRenderingTemplate {
    readonly icon: HTMLDivElement;
    readonly label: IconLabel;
    constructor(icon: HTMLDivElement, label: IconLabel);
}
export declare class CallRenderer implements ITreeRenderer<Call, FuzzyScore, CallRenderingTemplate> {
    static readonly id = "CallRenderer";
    templateId: string;
    renderTemplate(container: HTMLElement): CallRenderingTemplate;
    renderElement(node: ITreeNode<Call, FuzzyScore>, _index: number, template: CallRenderingTemplate): void;
    disposeTemplate(template: CallRenderingTemplate): void;
}
export declare class VirtualDelegate implements IListVirtualDelegate<Call> {
    getHeight(_element: Call): number;
    getTemplateId(_element: Call): string;
}
export declare class AccessibilityProvider implements IListAccessibilityProvider<Call> {
    getDirection: () => CallHierarchyDirection;
    constructor(getDirection: () => CallHierarchyDirection);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: Call): string | null;
}
export {};
