import { Dimension } from 'vs/base/browser/dom';
import { BareFontInfo } from 'vs/editor/common/config/fontInfo';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IDebugService, IDebugSession } from 'vs/workbench/contrib/debug/common/debug';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class DisassemblyView extends EditorPane {
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _debugService;
    private static readonly NUM_INSTRUCTIONS_TO_LOAD;
    private _fontInfo;
    private _disassembledInstructions;
    private _onDidChangeStackFrame;
    private _previousDebuggingState;
    private _instructionBpList;
    private _enableSourceCodeRender;
    private _loadingLock;
    constructor(telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _debugService: IDebugService);
    get fontInfo(): BareFontInfo;
    get currentInstructionAddresses(): (string | undefined)[];
    get focusedCurrentInstructionAddress(): string | undefined;
    get focusedInstructionAddress(): string | undefined;
    get isSourceCodeRender(): boolean;
    get debugSession(): IDebugSession | undefined;
    get onDidChangeStackFrame(): import("vs/base/common/event").Event<void>;
    protected createEditor(parent: HTMLElement): void;
    layout(dimension: Dimension): void;
    /**
     * Go to the address provided. If no address is provided, reveal the address of the currently focused stack frame.
     */
    goToAddress(address?: string, focus?: boolean): void;
    private scrollUp_LoadDisassembledInstructions;
    private scrollDown_LoadDisassembledInstructions;
    private loadDisassembledInstructions;
    private getIndexFromAddress;
    private ensureAddressParsed;
    /**
     * Clears the table and reload instructions near the target address
     */
    private reloadDisassembly;
}
export declare class DisassemblyViewContribution implements IWorkbenchContribution {
    private readonly _onDidActiveEditorChangeListener;
    private _onDidChangeModelLanguage;
    private _languageSupportsDisassemleRequest;
    constructor(editorService: IEditorService, debugService: IDebugService, contextKeyService: IContextKeyService);
    dispose(): void;
}
