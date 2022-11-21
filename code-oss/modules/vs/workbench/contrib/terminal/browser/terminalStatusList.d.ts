import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import Severity from 'vs/base/common/severity';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IHoverAction } from 'vs/workbench/services/hover/browser/hover';
/**
 * The set of _internal_ terminal statuses, other components building on the terminal should put
 * their statuses within their component.
 */
export declare const enum TerminalStatus {
    Bell = "bell",
    Disconnected = "disconnected",
    RelaunchNeeded = "relaunch-needed",
    ShellIntegrationAttentionNeeded = "shell-integration-attention-needed"
}
export interface ITerminalStatus {
    /** An internal string ID used to identify the status. */
    id: string;
    /**
     * The severity of the status, this defines both the color and how likely the status is to be
     * the "primary status".
     */
    severity: Severity;
    /**
     * An icon representing the status, if this is not specified it will not show up on the terminal
     * tab and will use the generic `info` icon when hovering.
     */
    icon?: ThemeIcon;
    /**
     * What to show for this status in the terminal's hover.
     */
    tooltip?: string | undefined;
    /**
     * Actions to expose on hover.
     */
    hoverActions?: IHoverAction[];
}
export interface ITerminalStatusList {
    /** Gets the most recent, highest severity status. */
    readonly primary: ITerminalStatus | undefined;
    /** Gets all active statues. */
    readonly statuses: ITerminalStatus[];
    readonly onDidAddStatus: Event<ITerminalStatus>;
    readonly onDidRemoveStatus: Event<ITerminalStatus>;
    readonly onDidChangePrimaryStatus: Event<ITerminalStatus | undefined>;
    /**
     * Adds a status to the list.
     * @param duration An optional duration in milliseconds of the status, when specified the status
     * will remove itself when the duration elapses unless the status gets re-added.
     */
    add(status: ITerminalStatus, duration?: number): void;
    remove(status: ITerminalStatus): void;
    remove(statusId: string): void;
    toggle(status: ITerminalStatus, value: boolean): void;
}
export declare class TerminalStatusList extends Disposable implements ITerminalStatusList {
    private readonly _configurationService;
    private readonly _statuses;
    private readonly _statusTimeouts;
    private readonly _onDidAddStatus;
    get onDidAddStatus(): Event<ITerminalStatus>;
    private readonly _onDidRemoveStatus;
    get onDidRemoveStatus(): Event<ITerminalStatus>;
    private readonly _onDidChangePrimaryStatus;
    get onDidChangePrimaryStatus(): Event<ITerminalStatus | undefined>;
    constructor(_configurationService: IConfigurationService);
    get primary(): ITerminalStatus | undefined;
    get statuses(): ITerminalStatus[];
    add(status: ITerminalStatus, duration?: number): void;
    remove(status: ITerminalStatus): void;
    remove(statusId: string): void;
    toggle(status: ITerminalStatus, value: boolean): void;
    private _applyAnimationSetting;
}
export declare function getColorForSeverity(severity: Severity): string;
