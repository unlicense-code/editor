import 'vs/css!./media/keybindings';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { Widget } from 'vs/base/browser/ui/widget';
import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import * as dom from 'vs/base/browser/dom';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { SearchWidget, SearchOptions } from 'vs/workbench/contrib/preferences/browser/preferencesWidgets';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
export interface KeybindingsSearchOptions extends SearchOptions {
    recordEnter?: boolean;
    quoteRecordedKeys?: boolean;
}
export declare class KeybindingsSearchWidget extends SearchWidget {
    private _firstPart;
    private _chordPart;
    private _inputValue;
    private readonly recordDisposables;
    private _onKeybinding;
    readonly onKeybinding: Event<[ResolvedKeybinding | null, ResolvedKeybinding | null]>;
    private _onEnter;
    readonly onEnter: Event<void>;
    private _onEscape;
    readonly onEscape: Event<void>;
    private _onBlur;
    readonly onBlur: Event<void>;
    constructor(parent: HTMLElement, options: KeybindingsSearchOptions, contextViewService: IContextViewService, instantiationService: IInstantiationService, themeService: IThemeService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    clear(): void;
    startRecordingKeys(): void;
    stopRecordingKeys(): void;
    setInputValue(value: string): void;
    private _reset;
    private _onKeyDown;
    private printKeybinding;
}
export declare class DefineKeybindingWidget extends Widget {
    private readonly instantiationService;
    private readonly themeService;
    private static readonly WIDTH;
    private static readonly HEIGHT;
    private _domNode;
    private _keybindingInputWidget;
    private _outputNode;
    private _showExistingKeybindingsNode;
    private _firstPart;
    private _chordPart;
    private _isVisible;
    private _onHide;
    private _onDidChange;
    onDidChange: Event<string>;
    private _onShowExistingKeybindings;
    readonly onShowExistingKeybidings: Event<string | null>;
    constructor(parent: HTMLElement | null, instantiationService: IInstantiationService, themeService: IThemeService);
    get domNode(): HTMLElement;
    define(): Promise<string | null>;
    layout(layout: dom.Dimension): void;
    printExisting(numberOfExisting: number): void;
    private onKeybinding;
    private getUserSettingsLabel;
    private onCancel;
    private hide;
}
export declare class DefineKeybindingOverlayWidget extends Disposable implements IOverlayWidget {
    private _editor;
    private static readonly ID;
    private readonly _widget;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
    dispose(): void;
    start(): Promise<string | null>;
}
