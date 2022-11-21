import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { ITunnelService } from 'vs/platform/tunnel/common/tunnel';
import { OmitFirstArg } from 'vs/workbench/contrib/terminal/browser/links/links';
import { ITerminalExternalLinkProvider } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalWidgetManager } from 'vs/workbench/contrib/terminal/browser/widgets/widgetManager';
import { ITerminalCapabilityStore } from 'vs/platform/terminal/common/capabilities/capabilities';
import { ITerminalProcessManager } from 'vs/workbench/contrib/terminal/common/terminal';
import type { ILink, Terminal } from 'xterm';
export declare type XtermLinkMatcherHandler = (event: MouseEvent | undefined, link: string) => Promise<void>;
export declare type XtermLinkMatcherValidationCallback = (uri: string, callback: (isValid: boolean) => void) => void;
/**
 * An object responsible for managing registration of link matchers and link providers.
 */
export declare class TerminalLinkManager extends DisposableStore {
    private readonly _xterm;
    private readonly _processManager;
    private readonly _configurationService;
    private readonly _fileService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _tunnelService;
    private _widgetManager;
    private _processCwd;
    private readonly _standardLinkProviders;
    private readonly _linkProvidersDisposables;
    private readonly _externalLinkProviders;
    private readonly _openers;
    private readonly _resolvedLinkCache;
    private _lastTopLine;
    constructor(_xterm: Terminal, _processManager: ITerminalProcessManager, capabilities: ITerminalCapabilityStore, _configurationService: IConfigurationService, _fileService: IFileService, _instantiationService: IInstantiationService, _logService: ILogService, _tunnelService: ITunnelService);
    private _setupLinkDetector;
    private _openLink;
    openRecentLink(type: 'localFile' | 'url'): Promise<ILink | undefined>;
    getLinks(extended?: boolean): Promise<IDetectedLinks>;
    private _getLinksForLine;
    protected _getLinksForType(y: number, type: 'word' | 'url' | 'localFile'): Promise<ILink[] | undefined>;
    private _tooltipCallback;
    private _showHover;
    setWidgetManager(widgetManager: TerminalWidgetManager): void;
    set processCwd(processCwd: string);
    private _clearLinkProviders;
    private _registerStandardLinkProviders;
    registerExternalLinkProvider(provideLinks: OmitFirstArg<ITerminalExternalLinkProvider['provideLinks']>): IDisposable;
    protected get _localLinkRegex(): RegExp;
    protected _isLinkActivationModifierDown(event: MouseEvent): boolean;
    private _getLinkHoverString;
    private get _osPath();
    protected _preprocessPath(link: string): string | null;
    private _resolvePath;
    /**
     * Returns url from link as link may contain line and column information.
     *
     * @param link url link which may contain line and column number.
     */
    extractLinkUrl(link: string): string | null;
}
export interface ILineColumnInfo {
    lineNumber: number;
    columnNumber: number;
}
export interface IDetectedLinks {
    wordLinks?: ILink[];
    webLinks?: ILink[];
    fileLinks?: ILink[];
    noMoreResults?: boolean;
}
