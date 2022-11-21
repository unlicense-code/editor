import { Widget } from 'vs/base/browser/ui/widget';
import { IEnvironmentVariableInfo } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { ITerminalWidget } from 'vs/workbench/contrib/terminal/browser/widgets/widgets';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
export declare class EnvironmentVariableInfoWidget extends Widget implements ITerminalWidget {
    private _info;
    private readonly _configurationService;
    private readonly _hoverService;
    readonly id = "env-var-info";
    private _domNode;
    private _container;
    private _mouseMoveListener;
    private _hoverOptions;
    get requiresAction(): boolean;
    constructor(_info: IEnvironmentVariableInfo, _configurationService: IConfigurationService, _hoverService: IHoverService);
    attach(container: HTMLElement): void;
    dispose(): void;
    focus(): void;
    private _showHover;
}
