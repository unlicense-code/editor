import { IAction } from 'vs/base/common/actions';
import { IMenu } from 'vs/platform/actions/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
export declare function openContextMenu(event: MouseEvent, parent: HTMLElement, menu: IMenu, contextMenuService: IContextMenuService, extraActions?: IAction[]): void;
