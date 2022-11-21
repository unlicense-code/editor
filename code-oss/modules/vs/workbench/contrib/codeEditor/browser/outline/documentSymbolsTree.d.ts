import 'vs/css!./documentSymbolsTree';
import 'vs/editor/contrib/symbolIcons/browser/symbolIcons';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { ITreeNode, ITreeRenderer, ITreeFilter } from 'vs/base/browser/ui/tree/tree';
import { FuzzyScore } from 'vs/base/common/filters';
import { OutlineElement, OutlineGroup } from 'vs/editor/contrib/documentSymbols/browser/outlineModel';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { IOutlineComparator } from 'vs/workbench/services/outline/browser/outline';
export declare type DocumentSymbolItem = OutlineGroup | OutlineElement;
export declare class DocumentSymbolNavigationLabelProvider implements IKeyboardNavigationLabelProvider<DocumentSymbolItem> {
    getKeyboardNavigationLabel(element: DocumentSymbolItem): {
        toString(): string;
    };
}
export declare class DocumentSymbolAccessibilityProvider implements IListAccessibilityProvider<DocumentSymbolItem> {
    private readonly _ariaLabel;
    constructor(_ariaLabel: string);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: DocumentSymbolItem): string | null;
}
export declare class DocumentSymbolIdentityProvider implements IIdentityProvider<DocumentSymbolItem> {
    getId(element: DocumentSymbolItem): {
        toString(): string;
    };
}
declare class DocumentSymbolGroupTemplate {
    readonly labelContainer: HTMLElement;
    readonly label: HighlightedLabel;
    static readonly id = "DocumentSymbolGroupTemplate";
    constructor(labelContainer: HTMLElement, label: HighlightedLabel);
}
declare class DocumentSymbolTemplate {
    readonly container: HTMLElement;
    readonly iconLabel: IconLabel;
    readonly iconClass: HTMLElement;
    readonly decoration: HTMLElement;
    static readonly id = "DocumentSymbolTemplate";
    constructor(container: HTMLElement, iconLabel: IconLabel, iconClass: HTMLElement, decoration: HTMLElement);
}
export declare class DocumentSymbolVirtualDelegate implements IListVirtualDelegate<DocumentSymbolItem> {
    getHeight(_element: DocumentSymbolItem): number;
    getTemplateId(element: DocumentSymbolItem): string;
}
export declare class DocumentSymbolGroupRenderer implements ITreeRenderer<OutlineGroup, FuzzyScore, DocumentSymbolGroupTemplate> {
    readonly templateId: string;
    renderTemplate(container: HTMLElement): DocumentSymbolGroupTemplate;
    renderElement(node: ITreeNode<OutlineGroup, FuzzyScore>, _index: number, template: DocumentSymbolGroupTemplate): void;
    disposeTemplate(_template: DocumentSymbolGroupTemplate): void;
}
export declare class DocumentSymbolRenderer implements ITreeRenderer<OutlineElement, FuzzyScore, DocumentSymbolTemplate> {
    private _renderMarker;
    private readonly _configurationService;
    private readonly _themeService;
    readonly templateId: string;
    constructor(_renderMarker: boolean, _configurationService: IConfigurationService, _themeService: IThemeService);
    renderTemplate(container: HTMLElement): DocumentSymbolTemplate;
    renderElement(node: ITreeNode<OutlineElement, FuzzyScore>, _index: number, template: DocumentSymbolTemplate): void;
    private _renderMarkerInfo;
    private static _symbolKindNames;
    disposeTemplate(_template: DocumentSymbolTemplate): void;
}
export declare class DocumentSymbolFilter implements ITreeFilter<DocumentSymbolItem> {
    private readonly _prefix;
    private readonly _textResourceConfigService;
    static readonly kindToConfigName: Readonly<{
        0: "showFiles";
        1: "showModules";
        2: "showNamespaces";
        3: "showPackages";
        4: "showClasses";
        5: "showMethods";
        6: "showProperties";
        7: "showFields";
        8: "showConstructors";
        9: "showEnums";
        10: "showInterfaces";
        11: "showFunctions";
        12: "showVariables";
        13: "showConstants";
        14: "showStrings";
        15: "showNumbers";
        16: "showBooleans";
        17: "showArrays";
        18: "showObjects";
        19: "showKeys";
        20: "showNull";
        21: "showEnumMembers";
        22: "showStructs";
        23: "showEvents";
        24: "showOperators";
        25: "showTypeParameters";
    }>;
    constructor(_prefix: 'breadcrumbs' | 'outline', _textResourceConfigService: ITextResourceConfigurationService);
    filter(element: DocumentSymbolItem): boolean;
}
export declare class DocumentSymbolComparator implements IOutlineComparator<DocumentSymbolItem> {
    private readonly _collator;
    compareByPosition(a: DocumentSymbolItem, b: DocumentSymbolItem): number;
    compareByType(a: DocumentSymbolItem, b: DocumentSymbolItem): number;
    compareByName(a: DocumentSymbolItem, b: DocumentSymbolItem): number;
}
export {};
