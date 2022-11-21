import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IOutputChannel } from 'vs/workbench/services/output/common/output';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ViewPane, IViewPaneOptions } from 'vs/workbench/browser/parts/views/viewPane';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
export declare class OutputViewPane extends ViewPane {
    private readonly editor;
    private channelId;
    private editorPromise;
    private readonly scrollLockContextKey;
    get scrollLock(): boolean;
    set scrollLock(scrollLock: boolean);
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService);
    showChannel(channel: IOutputChannel, preserveFocus: boolean): void;
    focus(): void;
    protected renderBody(container: HTMLElement): void;
    layoutBody(height: number, width: number): void;
    private onDidChangeVisibility;
    private setInput;
    private clearInput;
    private createInput;
}
