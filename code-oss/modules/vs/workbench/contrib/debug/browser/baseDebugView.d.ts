import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { HighlightedLabel, IHighlight } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { IInputValidationOptions } from 'vs/base/browser/ui/inputbox/inputBox';
import { ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';
import { FuzzyScore } from 'vs/base/common/filters';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { LinkDetector } from 'vs/workbench/contrib/debug/browser/linkDetector';
import { IDebugService, IExpression, IExpressionContainer } from 'vs/workbench/contrib/debug/common/debug';
import { Variable } from 'vs/workbench/contrib/debug/common/debugModel';
export interface IRenderValueOptions {
    showChanged?: boolean;
    maxValueLength?: number;
    showHover?: boolean;
    colorize?: boolean;
    linkDetector?: LinkDetector;
}
export interface IVariableTemplateData {
    expression: HTMLElement;
    name: HTMLElement;
    value: HTMLElement;
    label: HighlightedLabel;
    lazyButton: HTMLElement;
}
export declare function renderViewTree(container: HTMLElement): HTMLElement;
export declare function renderExpressionValue(expressionOrValue: IExpressionContainer | string, container: HTMLElement, options: IRenderValueOptions): void;
export declare function renderVariable(variable: Variable, data: IVariableTemplateData, showChanged: boolean, highlights: IHighlight[], linkDetector?: LinkDetector): void;
export interface IInputBoxOptions {
    initialValue: string;
    ariaLabel: string;
    placeholder?: string;
    validationOptions?: IInputValidationOptions;
    onFinish: (value: string, success: boolean) => void;
}
export interface IExpressionTemplateData {
    expression: HTMLElement;
    name: HTMLSpanElement;
    value: HTMLSpanElement;
    inputBoxContainer: HTMLElement;
    actionBar?: ActionBar;
    elementDisposable: IDisposable[];
    templateDisposable: IDisposable;
    label: HighlightedLabel;
    lazyButton: HTMLElement;
    currentElement: IExpression | undefined;
}
export declare abstract class AbstractExpressionsRenderer implements ITreeRenderer<IExpression, FuzzyScore, IExpressionTemplateData> {
    protected debugService: IDebugService;
    private readonly contextViewService;
    private readonly themeService;
    constructor(debugService: IDebugService, contextViewService: IContextViewService, themeService: IThemeService);
    abstract get templateId(): string;
    renderTemplate(container: HTMLElement): IExpressionTemplateData;
    renderElement(node: ITreeNode<IExpression, FuzzyScore>, index: number, data: IExpressionTemplateData): void;
    renderInputBox(nameElement: HTMLElement, valueElement: HTMLElement, inputBoxContainer: HTMLElement, options: IInputBoxOptions): IDisposable;
    protected abstract renderExpression(expression: IExpression, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected abstract getInputBoxOptions(expression: IExpression, settingValue: boolean): IInputBoxOptions | undefined;
    protected renderActionBar?(actionBar: ActionBar, expression: IExpression, data: IExpressionTemplateData): void;
    disposeElement(node: ITreeNode<IExpression, FuzzyScore>, index: number, templateData: IExpressionTemplateData): void;
    disposeTemplate(templateData: IExpressionTemplateData): void;
}
