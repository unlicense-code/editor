import { TextFileEditor } from 'vs/workbench/contrib/files/browser/editors/textFileEditor';
import { FileEditorInput } from 'vs/workbench/contrib/files/browser/editors/fileEditorInput';
import { IFileService } from 'vs/platform/files/common/files';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
/**
 * An implementation of editor for file system resources.
 */
export declare class NativeTextFileEditor extends TextFileEditor {
    private readonly nativeHostService;
    private readonly preferencesService;
    private readonly productService;
    constructor(telemetryService: ITelemetryService, fileService: IFileService, paneCompositeService: IPaneCompositePartService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, themeService: IThemeService, editorGroupService: IEditorGroupsService, textFileService: ITextFileService, nativeHostService: INativeHostService, preferencesService: IPreferencesService, explorerService: IExplorerService, uriIdentityService: IUriIdentityService, productService: IProductService, pathService: IPathService, configurationService: IConfigurationService);
    protected handleSetInputError(error: Error, input: FileEditorInput, options: ITextEditorOptions | undefined): Promise<void>;
}
