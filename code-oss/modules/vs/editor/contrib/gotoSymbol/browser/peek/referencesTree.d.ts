import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';
import { FuzzyScore, IMatch } from 'vs/base/common/filters';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILabelService } from 'vs/platform/label/common/label';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { FileReferences, OneReference, ReferencesModel } from '../referencesModel';
export declare type TreeElement = FileReferences | OneReference;
export declare class DataSource implements IAsyncDataSource<ReferencesModel | FileReferences, TreeElement> {
    private readonly _resolverService;
    constructor(_resolverService: ITextModelService);
    hasChildren(element: ReferencesModel | FileReferences | TreeElement): boolean;
    getChildren(element: ReferencesModel | FileReferences | TreeElement): TreeElement[] | Promise<TreeElement[]>;
}
export declare class Delegate implements IListVirtualDelegate<TreeElement> {
    getHeight(): number;
    getTemplateId(element: FileReferences | OneReference): string;
}
export declare class StringRepresentationProvider implements IKeyboardNavigationLabelProvider<TreeElement> {
    private readonly _keybindingService;
    constructor(_keybindingService: IKeybindingService);
    getKeyboardNavigationLabel(element: TreeElement): {
        toString(): string;
    };
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
}
export declare class IdentityProvider implements IIdentityProvider<TreeElement> {
    getId(element: TreeElement): {
        toString(): string;
    };
}
declare class FileReferencesTemplate extends Disposable {
    private readonly _labelService;
    readonly file: IconLabel;
    readonly badge: CountBadge;
    constructor(container: HTMLElement, _labelService: ILabelService, themeService: IThemeService);
    set(element: FileReferences, matches: IMatch[]): void;
}
export declare class FileReferencesRenderer implements ITreeRenderer<FileReferences, FuzzyScore, FileReferencesTemplate> {
    private readonly _instantiationService;
    static readonly id = "FileReferencesRenderer";
    readonly templateId: string;
    constructor(_instantiationService: IInstantiationService);
    renderTemplate(container: HTMLElement): FileReferencesTemplate;
    renderElement(node: ITreeNode<FileReferences, FuzzyScore>, index: number, template: FileReferencesTemplate): void;
    disposeTemplate(templateData: FileReferencesTemplate): void;
}
declare class OneReferenceTemplate {
    readonly label: HighlightedLabel;
    constructor(container: HTMLElement);
    set(element: OneReference, score?: FuzzyScore): void;
}
export declare class OneReferenceRenderer implements ITreeRenderer<OneReference, FuzzyScore, OneReferenceTemplate> {
    static readonly id = "OneReferenceRenderer";
    readonly templateId: string;
    renderTemplate(container: HTMLElement): OneReferenceTemplate;
    renderElement(node: ITreeNode<OneReference, FuzzyScore>, index: number, templateData: OneReferenceTemplate): void;
    disposeTemplate(): void;
}
export declare class AccessibilityProvider implements IListAccessibilityProvider<FileReferences | OneReference> {
    getWidgetAriaLabel(): string;
    getAriaLabel(element: FileReferences | OneReference): string | null;
}
export {};
