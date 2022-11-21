import 'vs/css!./standalone-tokens';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IDiffNavigator } from 'vs/editor/browser/widget/diffNavigator';
import { IDiffEditor } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import * as languages from 'vs/editor/common/languages';
import { IWebWorkerOptions, MonacoWebWorker } from 'vs/editor/browser/services/webWorker';
import { IColorizerElementOptions, IColorizerOptions } from 'vs/editor/standalone/browser/colorizer';
import { IActionDescriptor, IStandaloneCodeEditor, IStandaloneDiffEditor, IStandaloneDiffEditorConstructionOptions, IStandaloneEditorConstructionOptions } from 'vs/editor/standalone/browser/standaloneCodeEditor';
import { IEditorOverrideServices } from 'vs/editor/standalone/browser/standaloneServices';
import { IStandaloneThemeData } from 'vs/editor/standalone/common/standaloneTheme';
import { ICommandHandler } from 'vs/platform/commands/common/commands';
import { IMarker, IMarkerData } from 'vs/platform/markers/common/markers';
/**
 * Create a new editor under `domElement`.
 * `domElement` should be empty (not contain other dom nodes).
 * The editor will read the size of `domElement`.
 */
export declare function create(domElement: HTMLElement, options?: IStandaloneEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneCodeEditor;
/**
 * Emitted when an editor is created.
 * Creating a diff editor might cause this listener to be invoked with the two editors.
 * @event
 */
export declare function onDidCreateEditor(listener: (codeEditor: ICodeEditor) => void): IDisposable;
/**
 * Emitted when an diff editor is created.
 * @event
 */
export declare function onDidCreateDiffEditor(listener: (diffEditor: IDiffEditor) => void): IDisposable;
/**
 * Get all the created editors.
 */
export declare function getEditors(): readonly ICodeEditor[];
/**
 * Get all the created diff editors.
 */
export declare function getDiffEditors(): readonly IDiffEditor[];
/**
 * Create a new diff editor under `domElement`.
 * `domElement` should be empty (not contain other dom nodes).
 * The editor will read the size of `domElement`.
 */
export declare function createDiffEditor(domElement: HTMLElement, options?: IStandaloneDiffEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneDiffEditor;
export interface IDiffNavigatorOptions {
    readonly followsCaret?: boolean;
    readonly ignoreCharChanges?: boolean;
    readonly alwaysRevealFirst?: boolean;
}
export declare function createDiffNavigator(diffEditor: IStandaloneDiffEditor, opts?: IDiffNavigatorOptions): IDiffNavigator;
/**
 * Description of a command contribution
 */
export interface ICommandDescriptor {
    /**
     * An unique identifier of the contributed command.
     */
    id: string;
    /**
     * Callback that will be executed when the command is triggered.
     */
    run: ICommandHandler;
}
/**
 * Add a command.
 */
export declare function addCommand(descriptor: ICommandDescriptor): IDisposable;
/**
 * Add an action to all editors.
 */
export declare function addEditorAction(descriptor: IActionDescriptor): IDisposable;
/**
 * A keybinding rule.
 */
export interface IKeybindingRule {
    keybinding: number;
    command?: string | null;
    commandArgs?: any;
    when?: string | null;
}
/**
 * Add a keybinding rule.
 */
export declare function addKeybindingRule(rule: IKeybindingRule): IDisposable;
/**
 * Add keybinding rules.
 */
export declare function addKeybindingRules(rules: IKeybindingRule[]): IDisposable;
/**
 * Create a new editor model.
 * You can specify the language that should be set for this model or let the language be inferred from the `uri`.
 */
export declare function createModel(value: string, language?: string, uri?: URI): ITextModel;
/**
 * Change the language for a model.
 */
export declare function setModelLanguage(model: ITextModel, mimeTypeOrLanguageId: string): void;
/**
 * Set the markers for a model.
 */
export declare function setModelMarkers(model: ITextModel, owner: string, markers: IMarkerData[]): void;
/**
 * Remove all markers of an owner.
 */
export declare function removeAllMarkers(owner: string): void;
/**
 * Get markers for owner and/or resource
 *
 * @returns list of markers
 */
export declare function getModelMarkers(filter: {
    owner?: string;
    resource?: URI;
    take?: number;
}): IMarker[];
/**
 * Emitted when markers change for a model.
 * @event
 */
export declare function onDidChangeMarkers(listener: (e: readonly URI[]) => void): IDisposable;
/**
 * Get the model that has `uri` if it exists.
 */
export declare function getModel(uri: URI): ITextModel | null;
/**
 * Get all the created models.
 */
export declare function getModels(): ITextModel[];
/**
 * Emitted when a model is created.
 * @event
 */
export declare function onDidCreateModel(listener: (model: ITextModel) => void): IDisposable;
/**
 * Emitted right before a model is disposed.
 * @event
 */
export declare function onWillDisposeModel(listener: (model: ITextModel) => void): IDisposable;
/**
 * Emitted when a different language is set to a model.
 * @event
 */
export declare function onDidChangeModelLanguage(listener: (e: {
    readonly model: ITextModel;
    readonly oldLanguage: string;
}) => void): IDisposable;
/**
 * Create a new web worker that has model syncing capabilities built in.
 * Specify an AMD module to load that will `create` an object that will be proxied.
 */
export declare function createWebWorker<T extends object>(opts: IWebWorkerOptions): MonacoWebWorker<T>;
/**
 * Colorize the contents of `domNode` using attribute `data-lang`.
 */
export declare function colorizeElement(domNode: HTMLElement, options: IColorizerElementOptions): Promise<void>;
/**
 * Colorize `text` using language `languageId`.
 */
export declare function colorize(text: string, languageId: string, options: IColorizerOptions): Promise<string>;
/**
 * Colorize a line in a model.
 */
export declare function colorizeModelLine(model: ITextModel, lineNumber: number, tabSize?: number): string;
/**
 * Tokenize `text` using language `languageId`
 */
export declare function tokenize(text: string, languageId: string): languages.Token[][];
/**
 * Define a new theme or update an existing theme.
 */
export declare function defineTheme(themeName: string, themeData: IStandaloneThemeData): void;
/**
 * Switches to a theme.
 */
export declare function setTheme(themeName: string): void;
/**
 * Clears all cached font measurements and triggers re-measurement.
 */
export declare function remeasureFonts(): void;
/**
 * Register a command.
 */
export declare function registerCommand(id: string, handler: (accessor: any, ...args: any[]) => void): IDisposable;
/**
 * @internal
 */
export declare function createMonacoEditorAPI(): typeof monaco.editor;
