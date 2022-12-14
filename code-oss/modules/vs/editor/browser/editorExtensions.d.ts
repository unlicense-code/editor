import { ICodeEditor, IDiffEditor } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { IEditorContribution, IDiffEditorContribution } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { MenuId, Action2 } from 'vs/platform/actions/common/actions';
import { ICommandHandlerDescription } from 'vs/platform/commands/common/commands';
import { ContextKeyExpression } from 'vs/platform/contextkey/common/contextkey';
import { ServicesAccessor as InstantiationServicesAccessor, BrandedService, IConstructorSignature } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindings } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IDisposable } from 'vs/base/common/lifecycle';
export declare type ServicesAccessor = InstantiationServicesAccessor;
export declare type IEditorContributionCtor = IConstructorSignature<IEditorContribution, [ICodeEditor]>;
export declare type IDiffEditorContributionCtor = IConstructorSignature<IDiffEditorContribution, [IDiffEditor]>;
export declare enum EditorContributionInstantiation {
    /**
     * The contribution is created eagerly when the {@linkcode ICodeEditor} is instantiated.
     */
    Eager = 0,
    /**
     * The contribution is created on idle (or when explicitly requested).
     *
     * Idle contributions cannot participate in saving or restoring of view states.
     */
    Idle = 1
}
export interface IEditorContributionDescription {
    readonly id: string;
    readonly ctor: IEditorContributionCtor;
    readonly instantiation: EditorContributionInstantiation;
}
export interface IDiffEditorContributionDescription {
    id: string;
    ctor: IDiffEditorContributionCtor;
}
export interface ICommandKeybindingsOptions extends IKeybindings {
    kbExpr?: ContextKeyExpression | null;
    weight: number;
    /**
     * the default keybinding arguments
     */
    args?: any;
}
export interface ICommandMenuOptions {
    menuId: MenuId;
    group: string;
    order: number;
    when?: ContextKeyExpression;
    title: string;
    icon?: ThemeIcon;
}
export interface ICommandOptions {
    id: string;
    precondition: ContextKeyExpression | undefined;
    kbOpts?: ICommandKeybindingsOptions | ICommandKeybindingsOptions[];
    description?: ICommandHandlerDescription;
    menuOpts?: ICommandMenuOptions | ICommandMenuOptions[];
}
export declare abstract class Command {
    readonly id: string;
    readonly precondition: ContextKeyExpression | undefined;
    private readonly _kbOpts;
    private readonly _menuOpts;
    private readonly _description;
    constructor(opts: ICommandOptions);
    register(): void;
    private _registerMenuItem;
    abstract runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
}
/**
 * Potential override for a command.
 *
 * @return `true` if the command was successfully run. This stops other overrides from being executed.
 */
export declare type CommandImplementation = (accessor: ServicesAccessor, args: unknown) => boolean | Promise<void>;
export declare class MultiCommand extends Command {
    private readonly _implementations;
    /**
     * A higher priority gets to be looked at first
     */
    addImplementation(priority: number, name: string, implementation: CommandImplementation): IDisposable;
    runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
}
/**
 * A command that delegates to another command's implementation.
 *
 * This lets different commands be registered but share the same implementation
 */
export declare class ProxyCommand extends Command {
    private readonly command;
    constructor(command: Command, opts: ICommandOptions);
    runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
}
export interface IContributionCommandOptions<T> extends ICommandOptions {
    handler: (controller: T, args: any) => void;
}
export interface EditorControllerCommand<T extends IEditorContribution> {
    new (opts: IContributionCommandOptions<T>): EditorCommand;
}
export declare abstract class EditorCommand extends Command {
    /**
     * Create a command class that is bound to a certain editor contribution.
     */
    static bindToContribution<T extends IEditorContribution>(controllerGetter: (editor: ICodeEditor) => T | null): EditorControllerCommand<T>;
    static runEditorCommand(accessor: ServicesAccessor, args: any, precondition: ContextKeyExpression | undefined, runner: (accessor: ServicesAccessor | null, editor: ICodeEditor, args: any) => void | Promise<void>): void | Promise<void>;
    runCommand(accessor: ServicesAccessor, args: any): void | Promise<void>;
    abstract runEditorCommand(accessor: ServicesAccessor | null, editor: ICodeEditor, args: any): void | Promise<void>;
}
export interface IEditorActionContextMenuOptions {
    group: string;
    order: number;
    when?: ContextKeyExpression;
    menuId?: MenuId;
}
export interface IActionOptions extends ICommandOptions {
    label: string;
    alias: string;
    contextMenuOpts?: IEditorActionContextMenuOptions | IEditorActionContextMenuOptions[];
}
export declare abstract class EditorAction extends EditorCommand {
    private static convertOptions;
    readonly label: string;
    readonly alias: string;
    constructor(opts: IActionOptions);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void | Promise<void>;
    protected reportTelemetry(accessor: ServicesAccessor, editor: ICodeEditor): void;
    abstract run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void | Promise<void>;
}
export declare type EditorActionImplementation = (accessor: ServicesAccessor, editor: ICodeEditor, args: any) => boolean | Promise<void>;
export declare class MultiEditorAction extends EditorAction {
    private readonly _implementations;
    /**
     * A higher priority gets to be looked at first
     */
    addImplementation(priority: number, implementation: EditorActionImplementation): IDisposable;
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void | Promise<void>;
}
export declare abstract class EditorAction2 extends Action2 {
    run(accessor: ServicesAccessor, ...args: any[]): any;
    abstract runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: any[]): any;
}
export declare function registerModelAndPositionCommand(id: string, handler: (accessor: ServicesAccessor, model: ITextModel, position: Position, ...args: any[]) => any): void;
export declare function registerEditorCommand<T extends EditorCommand>(editorCommand: T): T;
export declare function registerEditorAction<T extends EditorAction>(ctor: {
    new (): T;
}): T;
export declare function registerMultiEditorAction<T extends MultiEditorAction>(action: T): T;
export declare function registerInstantiatedEditorAction(editorAction: EditorAction): void;
export declare function registerEditorContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (editor: ICodeEditor, ...services: Services): IEditorContribution;
}, instantiation?: EditorContributionInstantiation): void;
export declare function registerDiffEditorContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (editor: IDiffEditor, ...services: Services): IEditorContribution;
}): void;
export declare namespace EditorExtensionsRegistry {
    function getEditorCommand(commandId: string): EditorCommand;
    function getEditorActions(): Iterable<EditorAction>;
    function getEditorContributions(): IEditorContributionDescription[];
    function getSomeEditorContributions(ids: string[]): IEditorContributionDescription[];
    function getDiffEditorContributions(): IDiffEditorContributionDescription[];
}
export declare const UndoCommand: MultiCommand;
export declare const RedoCommand: MultiCommand;
export declare const SelectAllCommand: MultiCommand;
