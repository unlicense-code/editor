import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
export declare const Extensions: {
    WorkbenchActions: string;
};
export interface IWorkbenchActionRegistry {
    /**
     * Registers a workbench action to the platform. Workbench actions are not
     * visible by default and can only be invoked through a keybinding if provided.
     * @deprecated Register directly with KeybindingsRegistry and MenuRegistry or use registerAction2 instead.
     */
    registerWorkbenchAction(descriptor: SyncActionDescriptor, alias: string, category?: string, when?: ContextKeyExpr): IDisposable;
}
