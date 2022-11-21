import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IViewDescriptor } from 'vs/workbench/common/views';
import { TimelinePane } from './timelinePane';
export declare class TimelinePaneDescriptor implements IViewDescriptor {
    readonly id = "timeline";
    readonly name: string;
    readonly containerIcon: import("../../../../platform/theme/common/themeService").ThemeIcon;
    readonly ctorDescriptor: SyncDescriptor<TimelinePane>;
    readonly order = 2;
    readonly weight = 30;
    readonly collapsed = true;
    readonly canToggleVisibility = true;
    readonly hideByDefault = false;
    readonly canMoveView = true;
    readonly when: import("vs/platform/contextkey/common/contextkey").RawContextKey<boolean>;
    focusCommand: {
        id: string;
    };
}
