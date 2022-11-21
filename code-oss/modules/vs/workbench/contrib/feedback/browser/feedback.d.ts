import 'vs/css!./media/feedback';
import { Disposable } from 'vs/base/common/lifecycle';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IIntegrityService } from 'vs/workbench/services/integrity/common/integrity';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IProductService } from 'vs/platform/product/common/productService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
export interface IFeedback {
    feedback: string;
    sentiment: number;
}
export interface IFeedbackDelegate {
    submitFeedback(feedback: IFeedback, openerService: IOpenerService): void;
    getCharacterLimit(sentiment: number): number;
}
export interface IFeedbackWidgetOptions {
    feedbackService: IFeedbackDelegate;
}
export declare class FeedbackWidget extends Disposable {
    private readonly contextViewService;
    private readonly layoutService;
    private readonly commandService;
    private readonly telemetryService;
    private readonly integrityService;
    private readonly themeService;
    private readonly statusbarService;
    private readonly openerService;
    private visible;
    private _onDidChangeVisibility;
    readonly onDidChangeVisibility: import("vs/base/common/event").Event<boolean>;
    private maxFeedbackCharacters;
    private feedback;
    private sentiment;
    private readonly feedbackDelegate;
    private feedbackForm;
    private feedbackDescriptionInput;
    private smileyInput;
    private frownyInput;
    private sendButton;
    private hideButton;
    private remainingCharacterCount;
    private requestFeatureLink;
    private isPure;
    constructor(options: IFeedbackWidgetOptions, contextViewService: IContextViewService, layoutService: IWorkbenchLayoutService, commandService: ICommandService, telemetryService: ITelemetryService, integrityService: IIntegrityService, themeService: IThemeService, statusbarService: IStatusbarService, productService: IProductService, openerService: IOpenerService);
    private getAnchor;
    private renderContents;
    private updateFeedbackDescription;
    private getCharCountText;
    private updateCharCountText;
    private setSentiment;
    private invoke;
    show(): void;
    hide(): void;
    isVisible(): boolean;
    private onEvent;
    private onSubmit;
}
