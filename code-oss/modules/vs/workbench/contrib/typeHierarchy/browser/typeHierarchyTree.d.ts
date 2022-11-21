import { IAsyncDataSource, ITreeRenderer, ITreeNode, ITreeSorter } from 'vs/base/browser/ui/tree/tree';
import { TypeHierarchyDirection, TypeHierarchyItem, TypeHierarchyModel } from 'vs/workbench/contrib/typeHierarchy/common/typeHierarchy';
import { IIdentityProvider, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { FuzzyScore } from 'vs/base/common/filters';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
export declare class Type {
    readonly item: TypeHierarchyItem;
    readonly model: TypeHierarchyModel;
    readonly parent: Type | undefined;
    constructor(item: TypeHierarchyItem, model: TypeHierarchyModel, parent: Type | undefined);
    static compare(a: Type, b: Type): number;
}
export declare class DataSource implements IAsyncDataSource<TypeHierarchyModel, Type> {
    getDirection: () => TypeHierarchyDirection;
    constructor(getDirection: () => TypeHierarchyDirection);
    hasChildren(): boolean;
    getChildren(element: TypeHierarchyModel | Type): Promise<Type[]>;
}
export declare class Sorter implements ITreeSorter<Type> {
    compare(element: Type, otherElement: Type): number;
}
export declare class IdentityProvider implements IIdentityProvider<Type> {
    getDirection: () => TypeHierarchyDirection;
    constructor(getDirection: () => TypeHierarchyDirection);
    getId(element: Type): {
        toString(): string;
    };
}
declare class TypeRenderingTemplate {
    readonly icon: HTMLDivElement;
    readonly label: IconLabel;
    constructor(icon: HTMLDivElement, label: IconLabel);
}
export declare class TypeRenderer implements ITreeRenderer<Type, FuzzyScore, TypeRenderingTemplate> {
    static readonly id = "TypeRenderer";
    templateId: string;
    renderTemplate(container: HTMLElement): TypeRenderingTemplate;
    renderElement(node: ITreeNode<Type, FuzzyScore>, _index: number, template: TypeRenderingTemplate): void;
    disposeTemplate(template: TypeRenderingTemplate): void;
}
export declare class VirtualDelegate implements IListVirtualDelegate<Type> {
    getHeight(_element: Type): number;
    getTemplateId(_element: Type): string;
}
export declare class AccessibilityProvider implements IListAccessibilityProvider<Type> {
    getDirection: () => TypeHierarchyDirection;
    constructor(getDirection: () => TypeHierarchyDirection);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: Type): string | null;
}
export {};
