import { IAsyncDataSource, ITreeRenderer, ITreeNode, ITreeSorter } from 'vs/base/browser/ui/tree/tree';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { FuzzyScore } from 'vs/base/common/filters';
import { ResourceLabels } from 'vs/workbench/browser/labels';
import { IIdentityProvider, IListVirtualDelegate, IKeyboardNavigationLabelProvider } from 'vs/base/browser/ui/list/list';
import { BulkFileOperations, BulkFileOperation, BulkTextEdit, BulkCategory } from 'vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview';
import { ILabelService } from 'vs/platform/label/common/label';
import type { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
export interface ICheckable {
    isChecked(): boolean;
    setChecked(value: boolean): void;
}
export declare class CategoryElement {
    readonly parent: BulkFileOperations;
    readonly category: BulkCategory;
    constructor(parent: BulkFileOperations, category: BulkCategory);
}
export declare class FileElement implements ICheckable {
    readonly parent: CategoryElement | BulkFileOperations;
    readonly edit: BulkFileOperation;
    constructor(parent: CategoryElement | BulkFileOperations, edit: BulkFileOperation);
    isChecked(): boolean;
    setChecked(value: boolean): void;
    isDisabled(): boolean;
}
export declare class TextEditElement implements ICheckable {
    readonly parent: FileElement;
    readonly idx: number;
    readonly edit: BulkTextEdit;
    readonly prefix: string;
    readonly selecting: string;
    readonly inserting: string;
    readonly suffix: string;
    constructor(parent: FileElement, idx: number, edit: BulkTextEdit, prefix: string, selecting: string, inserting: string, suffix: string);
    isChecked(): boolean;
    setChecked(value: boolean): void;
    isDisabled(): boolean;
}
export declare type BulkEditElement = CategoryElement | FileElement | TextEditElement;
export declare class BulkEditDataSource implements IAsyncDataSource<BulkFileOperations, BulkEditElement> {
    private readonly _textModelService;
    private readonly _undoRedoService;
    private readonly _languageService;
    private readonly _languageConfigurationService;
    groupByFile: boolean;
    constructor(_textModelService: ITextModelService, _undoRedoService: IUndoRedoService, _languageService: ILanguageService, _languageConfigurationService: ILanguageConfigurationService);
    hasChildren(element: BulkFileOperations | BulkEditElement): boolean;
    getChildren(element: BulkFileOperations | BulkEditElement): Promise<BulkEditElement[]>;
}
export declare class BulkEditSorter implements ITreeSorter<BulkEditElement> {
    compare(a: BulkEditElement, b: BulkEditElement): number;
}
export declare class BulkEditAccessibilityProvider implements IListAccessibilityProvider<BulkEditElement> {
    private readonly _labelService;
    constructor(_labelService: ILabelService);
    getWidgetAriaLabel(): string;
    getRole(_element: BulkEditElement): string;
    getAriaLabel(element: BulkEditElement): string | null;
}
export declare class BulkEditIdentityProvider implements IIdentityProvider<BulkEditElement> {
    getId(element: BulkEditElement): {
        toString(): string;
    };
}
declare class CategoryElementTemplate {
    readonly icon: HTMLDivElement;
    readonly label: IconLabel;
    constructor(container: HTMLElement);
}
export declare class CategoryElementRenderer implements ITreeRenderer<CategoryElement, FuzzyScore, CategoryElementTemplate> {
    private readonly _themeService;
    static readonly id: string;
    readonly templateId: string;
    constructor(_themeService: IThemeService);
    renderTemplate(container: HTMLElement): CategoryElementTemplate;
    renderElement(node: ITreeNode<CategoryElement, FuzzyScore>, _index: number, template: CategoryElementTemplate): void;
    disposeTemplate(template: CategoryElementTemplate): void;
}
declare class FileElementTemplate {
    private readonly _labelService;
    private readonly _disposables;
    private readonly _localDisposables;
    private readonly _checkbox;
    private readonly _label;
    private readonly _details;
    constructor(container: HTMLElement, resourceLabels: ResourceLabels, _labelService: ILabelService);
    dispose(): void;
    set(element: FileElement, score: FuzzyScore | undefined): void;
}
export declare class FileElementRenderer implements ITreeRenderer<FileElement, FuzzyScore, FileElementTemplate> {
    private readonly _resourceLabels;
    private readonly _labelService;
    static readonly id: string;
    readonly templateId: string;
    constructor(_resourceLabels: ResourceLabels, _labelService: ILabelService);
    renderTemplate(container: HTMLElement): FileElementTemplate;
    renderElement(node: ITreeNode<FileElement, FuzzyScore>, _index: number, template: FileElementTemplate): void;
    disposeTemplate(template: FileElementTemplate): void;
}
declare class TextEditElementTemplate {
    private readonly _themeService;
    private readonly _disposables;
    private readonly _localDisposables;
    private readonly _checkbox;
    private readonly _icon;
    private readonly _label;
    constructor(container: HTMLElement, _themeService: IThemeService);
    dispose(): void;
    set(element: TextEditElement): void;
}
export declare class TextEditElementRenderer implements ITreeRenderer<TextEditElement, FuzzyScore, TextEditElementTemplate> {
    private readonly _themeService;
    static readonly id = "TextEditElementRenderer";
    readonly templateId: string;
    constructor(_themeService: IThemeService);
    renderTemplate(container: HTMLElement): TextEditElementTemplate;
    renderElement({ element }: ITreeNode<TextEditElement, FuzzyScore>, _index: number, template: TextEditElementTemplate): void;
    disposeTemplate(_template: TextEditElementTemplate): void;
}
export declare class BulkEditDelegate implements IListVirtualDelegate<BulkEditElement> {
    getHeight(): number;
    getTemplateId(element: BulkEditElement): string;
}
export declare class BulkEditNaviLabelProvider implements IKeyboardNavigationLabelProvider<BulkEditElement> {
    getKeyboardNavigationLabel(element: BulkEditElement): string | undefined;
}
export {};
