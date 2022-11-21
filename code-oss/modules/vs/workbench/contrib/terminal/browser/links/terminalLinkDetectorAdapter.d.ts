import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITerminalLinkDetector, ITerminalSimpleLink } from 'vs/workbench/contrib/terminal/browser/links/links';
import { TerminalLink } from 'vs/workbench/contrib/terminal/browser/links/terminalLink';
import { ILink, ILinkProvider, IViewportRange } from 'xterm';
export interface IActivateLinkEvent {
    link: ITerminalSimpleLink;
    event?: MouseEvent;
}
export interface IShowHoverEvent {
    link: TerminalLink;
    viewportRange: IViewportRange;
    modifierDownCallback?: () => void;
    modifierUpCallback?: () => void;
}
/**
 * Wrap a link detector object so it can be used in xterm.js
 */
export declare class TerminalLinkDetectorAdapter extends Disposable implements ILinkProvider {
    private readonly _detector;
    private readonly _instantiationService;
    private _activeLinks;
    private readonly _onDidActivateLink;
    readonly onDidActivateLink: import("vs/base/common/event").Event<IActivateLinkEvent>;
    private readonly _onDidShowHover;
    readonly onDidShowHover: import("vs/base/common/event").Event<IShowHoverEvent>;
    constructor(_detector: ITerminalLinkDetector, _instantiationService: IInstantiationService);
    provideLinks(bufferLineNumber: number, callback: (links: ILink[] | undefined) => void): Promise<void>;
    private _provideLinks;
    private _createTerminalLink;
    private _getLabel;
}
