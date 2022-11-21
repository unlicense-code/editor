import { IAnchor } from 'vs/base/browser/ui/contextview/contextview';
import 'vs/css!./actionWidget';
import { IListMenuItem } from 'vs/platform/actionWidget/browser/actionList';
import { ActionSet, IActionItem } from 'vs/platform/actionWidget/common/actionWidget';
export interface IRenderDelegate<T extends IActionItem> {
    onHide(didCancel?: boolean): void;
    onSelect(action: IActionItem, preview?: boolean): Promise<any>;
}
export interface IActionShowOptions {
    readonly includeDisabledActions: boolean;
    readonly fromLightbulb?: boolean;
    readonly showHeaders?: boolean;
}
export declare const IActionWidgetService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IActionWidgetService>;
export interface IActionWidgetService {
    readonly _serviceBrand: undefined;
    show(user: string, toMenuItems: (inputQuickFixes: readonly any[], showHeaders: boolean) => IListMenuItem<IActionItem>[], delegate: IRenderDelegate<any>, actions: ActionSet<any>, anchor: IAnchor, container: HTMLElement | undefined, options: IActionShowOptions): Promise<void>;
    hide(): void;
    readonly isVisible: boolean;
}
