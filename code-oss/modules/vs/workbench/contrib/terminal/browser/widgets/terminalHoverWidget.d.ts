import { Disposable } from 'vs/base/common/lifecycle';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { ITerminalWidget } from 'vs/workbench/contrib/terminal/browser/widgets/widgets';
import type { IViewportRange } from 'xterm';
import { IHoverService, IHoverAction } from 'vs/workbench/services/hover/browser/hover';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export interface ILinkHoverTargetOptions {
    readonly viewportRange: IViewportRange;
    readonly cellDimensions: {
        width: number;
        height: number;
    };
    readonly terminalDimensions: {
        width: number;
        height: number;
    };
    readonly modifierDownCallback?: () => void;
    readonly modifierUpCallback?: () => void;
}
export declare class TerminalHover extends Disposable implements ITerminalWidget {
    private readonly _targetOptions;
    private readonly _text;
    private readonly _actions;
    private readonly _linkHandler;
    private readonly _hoverService;
    private readonly _configurationService;
    readonly id = "hover";
    constructor(_targetOptions: ILinkHoverTargetOptions, _text: IMarkdownString, _actions: IHoverAction[] | undefined, _linkHandler: (url: string) => any, _hoverService: IHoverService, _configurationService: IConfigurationService);
    dispose(): void;
    attach(container: HTMLElement): void;
}
