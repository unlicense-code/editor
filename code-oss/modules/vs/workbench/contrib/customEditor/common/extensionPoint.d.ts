import { CustomEditorSelector } from 'vs/workbench/contrib/customEditor/common/customEditor';
declare const Fields: Readonly<{
    viewType: "viewType";
    displayName: "displayName";
    selector: "selector";
    priority: "priority";
}>;
export interface ICustomEditorsExtensionPoint {
    readonly [Fields.viewType]: string;
    readonly [Fields.displayName]: string;
    readonly [Fields.selector]?: readonly CustomEditorSelector[];
    readonly [Fields.priority]?: string;
}
export declare const customEditorsExtensionPoint: import("vs/workbench/services/extensions/common/extensionsRegistry").IExtensionPoint<ICustomEditorsExtensionPoint[]>;
export {};
