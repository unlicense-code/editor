import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { EditorAction } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { ICommentThreadWidget } from 'vs/workbench/contrib/comments/common/commentThreadWidget';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare const ctxCommentEditorFocused: RawContextKey<boolean>;
export declare class SimpleCommentEditor extends CodeEditorWidget {
    private _parentThread;
    private _commentEditorFocused;
    private _commentEditorEmpty;
    constructor(domElement: HTMLElement, options: IEditorOptions, parentThread: ICommentThreadWidget, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    getParentThread(): ICommentThreadWidget;
    protected _getActions(): Iterable<EditorAction>;
    static getEditorOptions(configurationService: IConfigurationService): IEditorOptions;
}
