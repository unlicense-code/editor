import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDebugEditorContribution, IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { Position } from 'vs/editor/common/core/position';
import { Disposable } from 'vs/base/common/lifecycle';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
export declare const debugInlineForeground: string;
export declare const debugInlineBackground: string;
export declare class LazyDebugEditorContribution extends Disposable implements IDebugEditorContribution {
    private _contrib;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService);
    showHover(position: Position, focus: boolean): Promise<void>;
    addLaunchConfiguration(): Promise<any>;
    closeExceptionWidget(): void;
}
export declare class DebugEditorContribution implements IDebugEditorContribution {
    private editor;
    private readonly debugService;
    private readonly instantiationService;
    private readonly commandService;
    private readonly configurationService;
    private readonly hostService;
    private readonly uriIdentityService;
    private readonly languageFeaturesService;
    private toDispose;
    private hoverWidget;
    private hoverPosition;
    private mouseDown;
    private exceptionWidgetVisible;
    private exceptionWidget;
    private configurationWidget;
    private altListener;
    private altPressed;
    private oldDecorations;
    private readonly debounceInfo;
    constructor(editor: ICodeEditor, debugService: IDebugService, instantiationService: IInstantiationService, commandService: ICommandService, configurationService: IConfigurationService, hostService: IHostService, uriIdentityService: IUriIdentityService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService, featureDebounceService: ILanguageFeatureDebounceService);
    private registerListeners;
    private _wordToLineNumbersMap;
    private get wordToLineNumbersMap();
    private applyHoverConfiguration;
    private enableEditorHover;
    showHover(position: Position, focus: boolean): Promise<void>;
    private onFocusStackFrame;
    private get showHoverScheduler();
    private get hideHoverScheduler();
    private hideHoverWidget;
    private onEditorMouseDown;
    private onEditorMouseMove;
    private onKeyDown;
    private toggleExceptionWidget;
    private showExceptionWidget;
    closeExceptionWidget(): void;
    addLaunchConfiguration(): Promise<any>;
    private get removeInlineValuesScheduler();
    private get updateInlineValuesScheduler();
    private updateInlineValueDecorations;
    dispose(): void;
}