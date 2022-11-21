import { ISCMResource, ISCMRepository, ISCMResourceGroup, ISCMInput, ISCMActionButton } from 'vs/workbench/contrib/scm/common/scm';
import { IMenu } from 'vs/platform/actions/common/actions';
import { ActionBar, IActionViewItemProvider } from 'vs/base/browser/ui/actionbar/actionbar';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Action, IAction } from 'vs/base/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { Command } from 'vs/editor/common/languages';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare function isSCMRepository(element: any): element is ISCMRepository;
export declare function isSCMInput(element: any): element is ISCMInput;
export declare function isSCMActionButton(element: any): element is ISCMActionButton;
export declare function isSCMResourceGroup(element: any): element is ISCMResourceGroup;
export declare function isSCMResource(element: any): element is ISCMResource;
export declare function connectPrimaryMenu(menu: IMenu, callback: (primary: IAction[], secondary: IAction[]) => void, primaryGroup?: string): IDisposable;
export declare function connectPrimaryMenuToInlineActionBar(menu: IMenu, actionBar: ActionBar): IDisposable;
export declare function collectContextMenuActions(menu: IMenu): IAction[];
export declare class StatusBarAction extends Action {
    private command;
    private commandService;
    constructor(command: Command, commandService: ICommandService);
    run(): Promise<void>;
}
export declare function getActionViewItemProvider(instaService: IInstantiationService): IActionViewItemProvider;
