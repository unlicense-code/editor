import 'vs/css!./media/extension';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { Event } from 'vs/base/common/event';
import { IExtension, IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { HoverPosition } from 'vs/base/browser/ui/hover/hoverWidget';
export declare const EXTENSION_LIST_ELEMENT_HEIGHT = 62;
export interface IExtensionsViewState {
    onFocus: Event<IExtension>;
    onBlur: Event<IExtension>;
}
export interface ITemplateData {
    root: HTMLElement;
    element: HTMLElement;
    icon: HTMLImageElement;
    name: HTMLElement;
    publisherDisplayName: HTMLElement;
    verifiedPublisherIcon: HTMLElement;
    description: HTMLElement;
    installCount: HTMLElement;
    ratings: HTMLElement;
    extension: IExtension | null;
    disposables: IDisposable[];
    extensionDisposables: IDisposable[];
    actionbar: ActionBar;
}
export declare class Delegate implements IListVirtualDelegate<IExtension> {
    getHeight(): number;
    getTemplateId(): string;
}
export declare type ExtensionListRendererOptions = {
    hoverOptions: {
        position: () => HoverPosition;
    };
};
export declare class Renderer implements IPagedRenderer<IExtension, ITemplateData> {
    private extensionViewState;
    private readonly options;
    private readonly instantiationService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly extensionManagementServerService;
    private readonly extensionsWorkbenchService;
    private readonly contextMenuService;
    constructor(extensionViewState: IExtensionsViewState, options: ExtensionListRendererOptions, instantiationService: IInstantiationService, notificationService: INotificationService, extensionService: IExtensionService, extensionManagementServerService: IExtensionManagementServerService, extensionsWorkbenchService: IExtensionsWorkbenchService, contextMenuService: IContextMenuService);
    get templateId(): string;
    renderTemplate(root: HTMLElement): ITemplateData;
    renderPlaceholder(index: number, data: ITemplateData): void;
    renderElement(extension: IExtension, index: number, data: ITemplateData): void;
    disposeElement(extension: IExtension, index: number, data: ITemplateData): void;
    disposeTemplate(data: ITemplateData): void;
}
