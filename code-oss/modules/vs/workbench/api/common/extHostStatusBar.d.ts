import { StatusBarAlignment as ExtHostStatusBarAlignment, Disposable, ThemeColor } from './extHostTypes';
import type * as vscode from 'vscode';
import { MainThreadStatusBarShape, IMainContext } from './extHost.protocol';
import { CommandsConverter } from 'vs/workbench/api/common/extHostCommands';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class ExtHostStatusBarEntry implements vscode.StatusBarItem {
    #private;
    private static ID_GEN;
    private static ALLOWED_BACKGROUND_COLORS;
    private _entryId;
    private _extension?;
    private _id?;
    private _alignment;
    private _priority?;
    private _disposed;
    private _visible;
    private _text;
    private _tooltip?;
    private _name?;
    private _color?;
    private _backgroundColor?;
    private readonly _internalCommandRegistration;
    private _command?;
    private _timeoutHandle;
    private _accessibilityInformation?;
    constructor(proxy: MainThreadStatusBarShape, commands: CommandsConverter, extension: IExtensionDescription, id?: string, alignment?: ExtHostStatusBarAlignment, priority?: number);
    constructor(proxy: MainThreadStatusBarShape, commands: CommandsConverter, extension: IExtensionDescription | undefined, id: string, alignment?: ExtHostStatusBarAlignment, priority?: number);
    private validatePriority;
    get id(): string;
    get alignment(): vscode.StatusBarAlignment;
    get priority(): number | undefined;
    get text(): string;
    get name(): string | undefined;
    get tooltip(): vscode.MarkdownString | string | undefined;
    get color(): string | ThemeColor | undefined;
    get backgroundColor(): ThemeColor | undefined;
    get command(): string | vscode.Command | undefined;
    get accessibilityInformation(): vscode.AccessibilityInformation | undefined;
    set text(text: string);
    set name(name: string | undefined);
    set tooltip(tooltip: vscode.MarkdownString | string | undefined);
    set color(color: string | ThemeColor | undefined);
    set backgroundColor(color: ThemeColor | undefined);
    set command(command: string | vscode.Command | undefined);
    set accessibilityInformation(accessibilityInformation: vscode.AccessibilityInformation | undefined);
    show(): void;
    hide(): void;
    private update;
    dispose(): void;
}
export declare class ExtHostStatusBar {
    private readonly _proxy;
    private readonly _commands;
    private _statusMessage;
    constructor(mainContext: IMainContext, commands: CommandsConverter);
    createStatusBarEntry(extension: IExtensionDescription | undefined, id: string, alignment?: ExtHostStatusBarAlignment, priority?: number): vscode.StatusBarItem;
    createStatusBarEntry(extension: IExtensionDescription, id?: string, alignment?: ExtHostStatusBarAlignment, priority?: number): vscode.StatusBarItem;
    setStatusBarMessage(text: string, timeoutOrThenable?: number | Thenable<any>): Disposable;
}
