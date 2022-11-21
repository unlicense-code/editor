import { BaseBinaryResourceEditor } from 'vs/workbench/browser/parts/editor/binaryEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
/**
 * An implementation of editor for binary files that cannot be displayed.
 */
export declare class BinaryFileEditor extends BaseBinaryResourceEditor {
    private readonly editorResolverService;
    private readonly editorGroupService;
    static readonly ID = "workbench.editors.files.binaryFileEditor";
    constructor(telemetryService: ITelemetryService, themeService: IThemeService, editorResolverService: IEditorResolverService, storageService: IStorageService, instantiationService: IInstantiationService, editorGroupService: IEditorGroupsService);
    private openInternal;
    getTitle(): string;
}
