import { IHoverDelegate } from 'vs/base/browser/ui/iconLabel/iconHoverDelegate';
import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { WindowTitle } from 'vs/workbench/browser/parts/titlebar/windowTitle';
export declare class CommandCenterControl {
    private readonly _disposables;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<void>;
    readonly element: HTMLElement;
    constructor(windowTitle: WindowTitle, hoverDelegate: IHoverDelegate, instantiationService: IInstantiationService, quickInputService: IQuickInputService, keybindingService: IKeybindingService);
    private _setVisibility;
    dispose(): void;
}
