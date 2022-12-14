import 'vs/css!./media/breakpointWidget';
import { IPosition } from 'vs/editor/common/core/position';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ZoneWidget } from 'vs/editor/contrib/zoneWidget/browser/zoneWidget';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IDebugService, BreakpointWidgetContext as Context } from 'vs/workbench/contrib/debug/common/debug';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IModelService } from 'vs/editor/common/services/model';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IRange } from 'vs/editor/common/core/range';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
declare const IPrivateBreakpointWidgetService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IPrivateBreakpointWidgetService>;
interface IPrivateBreakpointWidgetService {
    readonly _serviceBrand: undefined;
    close(success: boolean): void;
}
export declare class BreakpointWidget extends ZoneWidget implements IPrivateBreakpointWidgetService {
    private lineNumber;
    private column;
    private readonly contextViewService;
    private readonly debugService;
    private readonly themeService;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly modelService;
    private readonly codeEditorService;
    private readonly _configurationService;
    private readonly languageFeaturesService;
    readonly _serviceBrand: undefined;
    private selectContainer;
    private inputContainer;
    private input;
    private toDispose;
    private conditionInput;
    private hitCountInput;
    private logMessageInput;
    private breakpoint;
    private context;
    private heightInPx;
    constructor(editor: ICodeEditor, lineNumber: number, column: number | undefined, context: Context | undefined, contextViewService: IContextViewService, debugService: IDebugService, themeService: IThemeService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, modelService: IModelService, codeEditorService: ICodeEditorService, _configurationService: IConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    private get placeholder();
    private getInputValue;
    private rememberInput;
    private setInputMode;
    show(rangeOrPos: IRange | IPosition): void;
    fitHeightToContent(): void;
    protected _fillContainer(container: HTMLElement): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    private createBreakpointInput;
    private createEditorOptions;
    private centerInputVertically;
    close(success: boolean): void;
    dispose(): void;
}
export {};
