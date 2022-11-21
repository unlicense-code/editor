import 'vs/css!./media/panelpart';
import { Action } from 'vs/base/common/actions';
import { Action2, IAction2Options } from 'vs/platform/actions/common/actions';
import { IWorkbenchLayoutService, Position } from 'vs/workbench/services/layout/browser/layoutService';
import { ActivityAction, ToggleCompositePinnedAction, ICompositeBar } from 'vs/workbench/browser/parts/compositeBarActions';
import { IActivity } from 'vs/workbench/common/activity';
import { ContextKeyExpression } from 'vs/platform/contextkey/common/contextkey';
import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { ViewContainerLocation } from 'vs/workbench/common/views';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { ICommandActionTitle } from 'vs/platform/action/common/action';
export declare class TogglePanelAction extends Action2 {
    static readonly ID = "workbench.action.togglePanel";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
interface PanelActionConfig<T> {
    id: string;
    when: ContextKeyExpression;
    title: ICommandActionTitle;
    shortLabel: string;
    value: T;
}
export declare const PositionPanelActionConfigs: PanelActionConfig<Position>[];
export declare class SetPanelPositionAction extends Action {
    private readonly layoutService;
    constructor(id: string, label: string, layoutService: IWorkbenchLayoutService);
    run(): Promise<void>;
}
export declare class PanelActivityAction extends ActivityAction {
    private readonly viewContainerLocation;
    private readonly paneCompositeService;
    constructor(activity: IActivity, viewContainerLocation: ViewContainerLocation, paneCompositeService: IPaneCompositePartService);
    run(): Promise<void>;
    setActivity(activity: IActivity): void;
}
export declare class PlaceHolderPanelActivityAction extends PanelActivityAction {
    constructor(id: string, viewContainerLocation: ViewContainerLocation, paneCompositeService: IPaneCompositePartService);
}
export declare class PlaceHolderToggleCompositePinnedAction extends ToggleCompositePinnedAction {
    constructor(id: string, compositeBar: ICompositeBar);
    setActivity(activity: IActivity): void;
}
declare class MoveViewsBetweenPanelsAction extends Action2 {
    private readonly source;
    private readonly destination;
    constructor(source: ViewContainerLocation, destination: ViewContainerLocation, desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class MovePanelToSecondarySideBarAction extends MoveViewsBetweenPanelsAction {
    static readonly ID = "workbench.action.movePanelToSecondarySideBar";
    constructor();
}
export declare class MoveSecondarySideBarToPanelAction extends MoveViewsBetweenPanelsAction {
    static readonly ID = "workbench.action.moveSecondarySideBarToPanel";
    constructor();
}
export {};
