import 'vs/css!./media/welcomeOverlay';
import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class WelcomeOverlayAction extends Action2 {
    static readonly ID = "workbench.action.showInterfaceOverview";
    static readonly LABEL: {
        value: string;
        original: string;
    };
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class HideWelcomeOverlayAction extends Action2 {
    static readonly ID = "workbench.action.hideInterfaceOverview";
    static readonly LABEL: {
        value: string;
        original: string;
    };
    constructor();
    run(): Promise<void>;
}
