import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { IListRenderer } from 'vs/base/browser/ui/list/list';
import { Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CompletionItem } from './suggest';
export declare function getAriaId(index: number): string;
export interface ISuggestionTemplateData {
    root: HTMLElement;
    /**
     * Flexbox
     * < ------------- left ------------ >     < --- right -- >
     * <icon><label><signature><qualifier>     <type><readmore>
     */
    left: HTMLElement;
    right: HTMLElement;
    icon: HTMLElement;
    colorspan: HTMLElement;
    iconLabel: IconLabel;
    iconContainer: HTMLElement;
    parametersLabel: HTMLElement;
    qualifierLabel: HTMLElement;
    /**
     * Showing either `CompletionItem#details` or `CompletionItemLabel#type`
     */
    detailsLabel: HTMLElement;
    readMore: HTMLElement;
    disposables: DisposableStore;
}
export declare class ItemRenderer implements IListRenderer<CompletionItem, ISuggestionTemplateData> {
    private readonly _editor;
    private readonly _modelService;
    private readonly _languageService;
    private readonly _themeService;
    private readonly _onDidToggleDetails;
    readonly onDidToggleDetails: Event<void>;
    readonly templateId = "suggestion";
    constructor(_editor: ICodeEditor, _modelService: IModelService, _languageService: ILanguageService, _themeService: IThemeService);
    dispose(): void;
    renderTemplate(container: HTMLElement): ISuggestionTemplateData;
    renderElement(element: CompletionItem, index: number, data: ISuggestionTemplateData): void;
    disposeTemplate(templateData: ISuggestionTemplateData): void;
}
