import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { HighlightedLabel, IHighlight } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { CachedListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';
import { FuzzyScore } from 'vs/base/common/filters';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ILabelService } from 'vs/platform/label/common/label';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions } from 'vs/workbench/contrib/debug/browser/baseDebugView';
import { LinkDetector } from 'vs/workbench/contrib/debug/browser/linkDetector';
import { IDebugService, IDebugSession, IExpression, IReplElement, IReplElementSource, IReplOptions } from 'vs/workbench/contrib/debug/common/debug';
import { Variable } from 'vs/workbench/contrib/debug/common/debugModel';
import { RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup, SimpleReplElement } from 'vs/workbench/contrib/debug/common/replModel';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
interface IReplEvaluationInputTemplateData {
    label: HighlightedLabel;
}
interface IReplGroupTemplateData {
    label: HTMLElement;
}
interface IReplEvaluationResultTemplateData {
    value: HTMLElement;
}
interface ISimpleReplElementTemplateData {
    container: HTMLElement;
    count: CountBadge;
    countContainer: HTMLElement;
    value: HTMLElement;
    source: HTMLElement;
    getReplElementSource(): IReplElementSource | undefined;
    toDispose: IDisposable[];
    elementListener: IDisposable;
}
interface IRawObjectReplTemplateData {
    container: HTMLElement;
    expression: HTMLElement;
    name: HTMLElement;
    value: HTMLElement;
    label: HighlightedLabel;
}
export declare class ReplEvaluationInputsRenderer implements ITreeRenderer<ReplEvaluationInput, FuzzyScore, IReplEvaluationInputTemplateData> {
    static readonly ID = "replEvaluationInput";
    get templateId(): string;
    renderTemplate(container: HTMLElement): IReplEvaluationInputTemplateData;
    renderElement(element: ITreeNode<ReplEvaluationInput, FuzzyScore>, index: number, templateData: IReplEvaluationInputTemplateData): void;
    disposeTemplate(templateData: IReplEvaluationInputTemplateData): void;
}
export declare class ReplGroupRenderer implements ITreeRenderer<ReplGroup, FuzzyScore, IReplGroupTemplateData> {
    private readonly linkDetector;
    private readonly themeService;
    static readonly ID = "replGroup";
    constructor(linkDetector: LinkDetector, themeService: IThemeService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IReplGroupTemplateData;
    renderElement(element: ITreeNode<ReplGroup, FuzzyScore>, _index: number, templateData: IReplGroupTemplateData): void;
    disposeTemplate(_templateData: IReplGroupTemplateData): void;
}
export declare class ReplEvaluationResultsRenderer implements ITreeRenderer<ReplEvaluationResult | Variable, FuzzyScore, IReplEvaluationResultTemplateData> {
    private readonly linkDetector;
    static readonly ID = "replEvaluationResult";
    get templateId(): string;
    constructor(linkDetector: LinkDetector);
    renderTemplate(container: HTMLElement): IReplEvaluationResultTemplateData;
    renderElement(element: ITreeNode<ReplEvaluationResult | Variable, FuzzyScore>, index: number, templateData: IReplEvaluationResultTemplateData): void;
    disposeTemplate(templateData: IReplEvaluationResultTemplateData): void;
}
export declare class ReplSimpleElementsRenderer implements ITreeRenderer<SimpleReplElement, FuzzyScore, ISimpleReplElementTemplateData> {
    private readonly linkDetector;
    private readonly editorService;
    private readonly labelService;
    private readonly themeService;
    static readonly ID = "simpleReplElement";
    constructor(linkDetector: LinkDetector, editorService: IEditorService, labelService: ILabelService, themeService: IThemeService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): ISimpleReplElementTemplateData;
    renderElement({ element }: ITreeNode<SimpleReplElement, FuzzyScore>, index: number, templateData: ISimpleReplElementTemplateData): void;
    private setElementCount;
    disposeTemplate(templateData: ISimpleReplElementTemplateData): void;
    disposeElement(_element: ITreeNode<SimpleReplElement, FuzzyScore>, _index: number, templateData: ISimpleReplElementTemplateData): void;
}
export declare class ReplVariablesRenderer extends AbstractExpressionsRenderer {
    private readonly linkDetector;
    static readonly ID = "replVariable";
    get templateId(): string;
    constructor(linkDetector: LinkDetector, debugService: IDebugService, contextViewService: IContextViewService, themeService: IThemeService);
    protected renderExpression(expression: IExpression, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions | undefined;
}
export declare class ReplRawObjectsRenderer implements ITreeRenderer<RawObjectReplElement, FuzzyScore, IRawObjectReplTemplateData> {
    private readonly linkDetector;
    static readonly ID = "rawObject";
    constructor(linkDetector: LinkDetector);
    get templateId(): string;
    renderTemplate(container: HTMLElement): IRawObjectReplTemplateData;
    renderElement(node: ITreeNode<RawObjectReplElement, FuzzyScore>, index: number, templateData: IRawObjectReplTemplateData): void;
    disposeTemplate(templateData: IRawObjectReplTemplateData): void;
}
export declare class ReplDelegate extends CachedListVirtualDelegate<IReplElement> {
    private readonly configurationService;
    private readonly replOptions;
    constructor(configurationService: IConfigurationService, replOptions: IReplOptions);
    getHeight(element: IReplElement): number;
    /**
     * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
     */
    protected estimateHeight(element: IReplElement, ignoreValueLength?: boolean): number;
    getTemplateId(element: IReplElement): string;
    hasDynamicHeight(element: IReplElement): boolean;
}
export declare class ReplDataSource implements IAsyncDataSource<IDebugSession, IReplElement> {
    hasChildren(element: IReplElement | IDebugSession): boolean;
    getChildren(element: IReplElement | IDebugSession): Promise<IReplElement[]>;
}
export declare class ReplAccessibilityProvider implements IListAccessibilityProvider<IReplElement> {
    getWidgetAriaLabel(): string;
    getAriaLabel(element: IReplElement): string;
}
export {};
