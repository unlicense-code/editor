import 'vs/css!./media/editorstatus';
import { Action } from 'vs/base/common/actions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { ITelemetryData, ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
export declare class EditorStatus extends Disposable implements IWorkbenchContribution {
    private readonly editorService;
    private readonly quickInputService;
    private readonly languageService;
    private readonly textFileService;
    private readonly configurationService;
    private readonly notificationService;
    private readonly accessibilityService;
    private readonly statusbarService;
    private readonly instantiationService;
    private readonly tabFocusModeElement;
    private readonly columnSelectionModeElement;
    private readonly screenRedearModeElement;
    private readonly indentationElement;
    private readonly selectionElement;
    private readonly encodingElement;
    private readonly eolElement;
    private readonly languageElement;
    private readonly metadataElement;
    private readonly currentProblemStatus;
    private readonly state;
    private readonly activeEditorListeners;
    private readonly delayedRender;
    private toRender;
    private screenReaderNotification;
    private promptedScreenReader;
    constructor(editorService: IEditorService, quickInputService: IQuickInputService, languageService: ILanguageService, textFileService: ITextFileService, configurationService: IConfigurationService, notificationService: INotificationService, accessibilityService: IAccessibilityService, statusbarService: IStatusbarService, instantiationService: IInstantiationService);
    private registerListeners;
    private registerCommands;
    private showScreenReaderNotification;
    private showIndentationPicker;
    private updateTabFocusModeElement;
    private updateColumnSelectionModeElement;
    private updateScreenReaderModeElement;
    private updateSelectionElement;
    private updateIndentationElement;
    private updateEncodingElement;
    private updateEOLElement;
    private updateLanguageIdElement;
    private updateMetadataElement;
    private updateElement;
    private updateState;
    private doRenderNow;
    private getSelectionLabel;
    private updateStatusBar;
    private onLanguageChange;
    private onIndentationChange;
    private onMetadataChange;
    private onColumnSelectionModeChange;
    private onScreenReaderModeChange;
    private onSelectionChange;
    private onEOLChange;
    private onEncodingChange;
    private onResourceEncodingChange;
    private onTabFocusModeChange;
    private isActiveEditor;
}
export declare class ShowLanguageExtensionsAction extends Action {
    private fileExtension;
    private readonly commandService;
    static readonly ID = "workbench.action.showLanguageExtensions";
    constructor(fileExtension: string, commandService: ICommandService, galleryService: IExtensionGalleryService);
    run(): Promise<void>;
}
export declare class ChangeLanguageAction extends Action {
    private readonly languageService;
    private readonly editorService;
    private readonly configurationService;
    private readonly quickInputService;
    private readonly preferencesService;
    private readonly instantiationService;
    private readonly textFileService;
    private readonly telemetryService;
    private readonly languageDetectionService;
    static readonly ID = "workbench.action.editor.changeLanguageMode";
    static readonly LABEL: string;
    constructor(actionId: string, actionLabel: string, languageService: ILanguageService, editorService: IEditorService, configurationService: IConfigurationService, quickInputService: IQuickInputService, preferencesService: IPreferencesService, instantiationService: IInstantiationService, textFileService: ITextFileService, telemetryService: ITelemetryService, languageDetectionService: ILanguageDetectionService);
    run(event: unknown, data?: ITelemetryData): Promise<void>;
    private configureFileAssociation;
}
export declare class ChangeEOLAction extends Action {
    private readonly editorService;
    private readonly quickInputService;
    static readonly ID = "workbench.action.editor.changeEOL";
    static readonly LABEL: string;
    constructor(actionId: string, actionLabel: string, editorService: IEditorService, quickInputService: IQuickInputService);
    run(): Promise<void>;
}
export declare class ChangeEncodingAction extends Action {
    private readonly editorService;
    private readonly quickInputService;
    private readonly textResourceConfigurationService;
    private readonly fileService;
    private readonly textFileService;
    static readonly ID = "workbench.action.editor.changeEncoding";
    static readonly LABEL: string;
    constructor(actionId: string, actionLabel: string, editorService: IEditorService, quickInputService: IQuickInputService, textResourceConfigurationService: ITextResourceConfigurationService, fileService: IFileService, textFileService: ITextFileService);
    run(): Promise<void>;
}
