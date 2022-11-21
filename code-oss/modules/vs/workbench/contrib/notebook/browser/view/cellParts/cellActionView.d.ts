import { MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
export declare class CodiconActionViewItem extends MenuEntryActionViewItem {
    protected updateLabel(): void;
}
export declare class ActionViewWithLabel extends MenuEntryActionViewItem {
    private _actionLabel?;
    render(container: HTMLElement): void;
    protected updateLabel(): void;
}
