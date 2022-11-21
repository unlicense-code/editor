import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { AbstractTextResourceEditor } from 'vs/workbench/browser/parts/editor/textResourceEditor';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { TextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IFileOutputChannelDescriptor } from 'vs/workbench/services/output/common/output';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
export declare class LogViewerInput extends TextResourceEditorInput {
    static readonly ID = "workbench.editorinputs.output";
    get typeId(): string;
    constructor(outputChannelDescriptor: IFileOutputChannelDescriptor, textModelResolverService: ITextModelService, textFileService: ITextFileService, editorService: IEditorService, fileService: IFileService, labelService: ILabelService);
}
export declare class LogViewer extends AbstractTextResourceEditor {
    static readonly LOG_VIEWER_EDITOR_ID = "workbench.editors.logViewer";
    constructor(telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorGroupService: IEditorGroupsService, editorService: IEditorService, fileService: IFileService);
    protected getConfigurationOverrides(): IEditorOptions;
    protected getAriaLabel(): string;
}
