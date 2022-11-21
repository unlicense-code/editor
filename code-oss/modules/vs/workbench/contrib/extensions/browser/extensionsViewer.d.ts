import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { IExtensionsWorkbenchService, IExtension } from 'vs/workbench/contrib/extensions/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IListService, WorkbenchAsyncDataTree } from 'vs/platform/list/browser/listService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IAsyncDataSource, ITreeNode } from 'vs/base/browser/ui/tree/tree';
import { IListVirtualDelegate, IListRenderer } from 'vs/base/browser/ui/list/list';
import { IColorMapping } from 'vs/platform/theme/common/styler';
import { Delegate } from 'vs/workbench/contrib/extensions/browser/extensionsList';
export declare class ExtensionsGridView extends Disposable {
    private readonly instantiationService;
    readonly element: HTMLElement;
    private readonly renderer;
    private readonly delegate;
    private readonly disposableStore;
    constructor(parent: HTMLElement, delegate: Delegate, instantiationService: IInstantiationService);
    setExtensions(extensions: IExtension[]): void;
    private renderExtension;
}
export interface IExtensionTemplateData {
    icon: HTMLImageElement;
    name: HTMLElement;
    identifier: HTMLElement;
    author: HTMLElement;
    extensionDisposables: IDisposable[];
    extensionData: IExtensionData;
}
export interface IUnknownExtensionTemplateData {
    identifier: HTMLElement;
}
export interface IExtensionData {
    extension: IExtension;
    hasChildren: boolean;
    getChildren: () => Promise<IExtensionData[] | null>;
    parent: IExtensionData | null;
}
export declare class AsyncDataSource implements IAsyncDataSource<IExtensionData, any> {
    hasChildren({ hasChildren }: IExtensionData): boolean;
    getChildren(extensionData: IExtensionData): Promise<any>;
}
export declare class VirualDelegate implements IListVirtualDelegate<IExtensionData> {
    getHeight(element: IExtensionData): number;
    getTemplateId({ extension }: IExtensionData): string;
}
export declare class ExtensionRenderer implements IListRenderer<ITreeNode<IExtensionData>, IExtensionTemplateData> {
    private readonly instantiationService;
    static readonly TEMPLATE_ID = "extension-template";
    constructor(instantiationService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IExtensionTemplateData;
    renderElement(node: ITreeNode<IExtensionData>, index: number, data: IExtensionTemplateData): void;
    disposeTemplate(templateData: IExtensionTemplateData): void;
}
export declare class UnknownExtensionRenderer implements IListRenderer<ITreeNode<IExtensionData>, IUnknownExtensionTemplateData> {
    static readonly TEMPLATE_ID = "unknown-extension-template";
    get templateId(): string;
    renderTemplate(container: HTMLElement): IUnknownExtensionTemplateData;
    renderElement(node: ITreeNode<IExtensionData>, index: number, data: IUnknownExtensionTemplateData): void;
    disposeTemplate(data: IUnknownExtensionTemplateData): void;
}
export declare class ExtensionsTree extends WorkbenchAsyncDataTree<IExtensionData, IExtensionData> {
    constructor(input: IExtensionData, container: HTMLElement, overrideStyles: IColorMapping, contextKeyService: IContextKeyService, listService: IListService, themeService: IThemeService, instantiationService: IInstantiationService, configurationService: IConfigurationService, extensionsWorkdbenchService: IExtensionsWorkbenchService);
}
export declare class ExtensionData implements IExtensionData {
    readonly extension: IExtension;
    readonly parent: IExtensionData | null;
    private readonly getChildrenExtensionIds;
    private readonly childrenExtensionIds;
    private readonly extensionsWorkbenchService;
    constructor(extension: IExtension, parent: IExtensionData | null, getChildrenExtensionIds: (extension: IExtension) => string[], extensionsWorkbenchService: IExtensionsWorkbenchService);
    get hasChildren(): boolean;
    getChildren(): Promise<IExtensionData[] | null>;
}
export declare function getExtensions(extensions: string[], extensionsWorkbenchService: IExtensionsWorkbenchService): Promise<IExtension[]>;
