import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor, IDiffEditor, IDiffEditorConstructionOptions } from 'vs/editor/browser/editorBrowser';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { DiffEditorWidget } from 'vs/editor/browser/widget/diffEditorWidget';
import { IDiffEditorOptions, IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { ITextModel } from 'vs/editor/common/model';
import { IStandaloneThemeService } from 'vs/editor/standalone/common/standaloneTheme';
import { ICommandHandler, ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyValue, IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IEditorProgressService } from 'vs/platform/progress/common/progress';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { URI } from 'vs/base/common/uri';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { IEditorConstructionOptions } from 'vs/editor/browser/config/editorConfiguration';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
/**
 * Description of an action contribution
 */
export interface IActionDescriptor {
    /**
     * An unique identifier of the contributed action.
     */
    id: string;
    /**
     * A label of the action that will be presented to the user.
     */
    label: string;
    /**
     * Precondition rule.
     */
    precondition?: string;
    /**
     * An array of keybindings for the action.
     */
    keybindings?: number[];
    /**
     * The keybinding rule (condition on top of precondition).
     */
    keybindingContext?: string;
    /**
     * Control if the action should show up in the context menu and where.
     * The context menu of the editor has these default:
     *   navigation - The navigation group comes first in all cases.
     *   1_modification - This group comes next and contains commands that modify your code.
     *   9_cutcopypaste - The last default group with the basic editing commands.
     * You can also create your own group.
     * Defaults to null (don't show in context menu).
     */
    contextMenuGroupId?: string;
    /**
     * Control the order in the context menu group.
     */
    contextMenuOrder?: number;
    /**
     * Method that will be executed when the action is triggered.
     * @param editor The editor instance is passed in as a convenience
     */
    run(editor: ICodeEditor, ...args: any[]): void | Promise<void>;
}
/**
 * Options which apply for all editors.
 */
export interface IGlobalEditorOptions {
    /**
     * The number of spaces a tab is equal to.
     * This setting is overridden based on the file contents when `detectIndentation` is on.
     * Defaults to 4.
     */
    tabSize?: number;
    /**
     * Insert spaces when pressing `Tab`.
     * This setting is overridden based on the file contents when `detectIndentation` is on.
     * Defaults to true.
     */
    insertSpaces?: boolean;
    /**
     * Controls whether `tabSize` and `insertSpaces` will be automatically detected when a file is opened based on the file contents.
     * Defaults to true.
     */
    detectIndentation?: boolean;
    /**
     * Remove trailing auto inserted whitespace.
     * Defaults to true.
     */
    trimAutoWhitespace?: boolean;
    /**
     * Special handling for large files to disable certain memory intensive features.
     * Defaults to true.
     */
    largeFileOptimizations?: boolean;
    /**
     * Controls whether completions should be computed based on words in the document.
     * Defaults to true.
     */
    wordBasedSuggestions?: boolean;
    /**
     * Controls whether word based completions should be included from opened documents of the same language or any language.
     */
    wordBasedSuggestionsOnlySameLanguage?: boolean;
    /**
     * Controls whether the semanticHighlighting is shown for the languages that support it.
     * true: semanticHighlighting is enabled for all themes
     * false: semanticHighlighting is disabled for all themes
     * 'configuredByTheme': semanticHighlighting is controlled by the current color theme's semanticHighlighting setting.
     * Defaults to 'byTheme'.
     */
    'semanticHighlighting.enabled'?: true | false | 'configuredByTheme';
    /**
     * Keep peek editors open even when double clicking their content or when hitting `Escape`.
     * Defaults to false.
     */
    stablePeek?: boolean;
    /**
     * Lines above this length will not be tokenized for performance reasons.
     * Defaults to 20000.
     */
    maxTokenizationLineLength?: number;
    /**
     * Theme to be used for rendering.
     * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black', 'hc-light'.
     * You can create custom themes via `monaco.editor.defineTheme`.
     * To switch a theme, use `monaco.editor.setTheme`.
     * **NOTE**: The theme might be overwritten if the OS is in high contrast mode, unless `autoDetectHighContrast` is set to false.
     */
    theme?: string;
    /**
     * If enabled, will automatically change to high contrast theme if the OS is using a high contrast theme.
     * Defaults to true.
     */
    autoDetectHighContrast?: boolean;
}
/**
 * The options to create an editor.
 */
export interface IStandaloneEditorConstructionOptions extends IEditorConstructionOptions, IGlobalEditorOptions {
    /**
     * The initial model associated with this code editor.
     */
    model?: ITextModel | null;
    /**
     * The initial value of the auto created model in the editor.
     * To not automatically create a model, use `model: null`.
     */
    value?: string;
    /**
     * The initial language of the auto created model in the editor.
     * To not automatically create a model, use `model: null`.
     */
    language?: string;
    /**
     * Initial theme to be used for rendering.
     * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black', 'hc-light.
     * You can create custom themes via `monaco.editor.defineTheme`.
     * To switch a theme, use `monaco.editor.setTheme`.
     * **NOTE**: The theme might be overwritten if the OS is in high contrast mode, unless `autoDetectHighContrast` is set to false.
     */
    theme?: string;
    /**
     * If enabled, will automatically change to high contrast theme if the OS is using a high contrast theme.
     * Defaults to true.
     */
    autoDetectHighContrast?: boolean;
    /**
     * An URL to open when Ctrl+H (Windows and Linux) or Cmd+H (OSX) is pressed in
     * the accessibility help dialog in the editor.
     *
     * Defaults to "https://go.microsoft.com/fwlink/?linkid=852450"
     */
    accessibilityHelpUrl?: string;
    /**
     * Container element to use for ARIA messages.
     * Defaults to document.body.
     */
    ariaContainerElement?: HTMLElement;
}
/**
 * The options to create a diff editor.
 */
export interface IStandaloneDiffEditorConstructionOptions extends IDiffEditorConstructionOptions {
    /**
     * Initial theme to be used for rendering.
     * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black', 'hc-light.
     * You can create custom themes via `monaco.editor.defineTheme`.
     * To switch a theme, use `monaco.editor.setTheme`.
     * **NOTE**: The theme might be overwritten if the OS is in high contrast mode, unless `autoDetectHighContrast` is set to false.
     */
    theme?: string;
    /**
     * If enabled, will automatically change to high contrast theme if the OS is using a high contrast theme.
     * Defaults to true.
     */
    autoDetectHighContrast?: boolean;
}
export interface IStandaloneCodeEditor extends ICodeEditor {
    updateOptions(newOptions: IEditorOptions & IGlobalEditorOptions): void;
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(descriptor: IActionDescriptor): IDisposable;
}
export interface IStandaloneDiffEditor extends IDiffEditor {
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(descriptor: IActionDescriptor): IDisposable;
    getOriginalEditor(): IStandaloneCodeEditor;
    getModifiedEditor(): IStandaloneCodeEditor;
}
/**
 * A code editor to be used both by the standalone editor and the standalone diff editor.
 */
export declare class StandaloneCodeEditor extends CodeEditorWidget implements IStandaloneCodeEditor {
    private readonly _standaloneKeybindingService;
    constructor(domElement: HTMLElement, _options: Readonly<IStandaloneEditorConstructionOptions>, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(_descriptor: IActionDescriptor): IDisposable;
    protected _triggerCommand(handlerId: string, payload: any): void;
}
export declare class StandaloneEditor extends StandaloneCodeEditor implements IStandaloneCodeEditor {
    private readonly _configurationService;
    private readonly _standaloneThemeService;
    private _ownsModel;
    constructor(domElement: HTMLElement, _options: Readonly<IStandaloneEditorConstructionOptions> | undefined, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, themeService: IStandaloneThemeService, notificationService: INotificationService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService, modelService: IModelService, languageService: ILanguageService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    updateOptions(newOptions: Readonly<IEditorOptions & IGlobalEditorOptions>): void;
    _postDetachModelCleanup(detachedModel: ITextModel): void;
}
export declare class StandaloneDiffEditor extends DiffEditorWidget implements IStandaloneDiffEditor {
    private readonly _configurationService;
    private readonly _standaloneThemeService;
    constructor(domElement: HTMLElement, _options: Readonly<IStandaloneDiffEditorConstructionOptions> | undefined, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, codeEditorService: ICodeEditorService, themeService: IStandaloneThemeService, notificationService: INotificationService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, editorProgressService: IEditorProgressService, clipboardService: IClipboardService);
    dispose(): void;
    updateOptions(newOptions: Readonly<IDiffEditorOptions & IGlobalEditorOptions>): void;
    protected _createInnerEditor(instantiationService: IInstantiationService, container: HTMLElement, options: Readonly<IEditorOptions>): CodeEditorWidget;
    getOriginalEditor(): IStandaloneCodeEditor;
    getModifiedEditor(): IStandaloneCodeEditor;
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(descriptor: IActionDescriptor): IDisposable;
}
/**
 * @internal
 */
export declare function createTextModel(modelService: IModelService, languageService: ILanguageService, value: string, languageId: string | undefined, uri: URI | undefined): ITextModel;
