import { ITitleProperties } from 'vs/workbench/services/title/common/titleService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { Disposable } from 'vs/base/common/lifecycle';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class WindowTitle extends Disposable {
    protected readonly configurationService: IConfigurationService;
    private readonly editorService;
    protected readonly environmentService: IBrowserWorkbenchEnvironmentService;
    private readonly contextService;
    protected readonly instantiationService: IInstantiationService;
    private readonly labelService;
    private readonly productService;
    private static readonly NLS_USER_IS_ADMIN;
    private static readonly NLS_EXTENSION_HOST;
    private static readonly TITLE_DIRTY;
    private readonly properties;
    private readonly activeEditorListeners;
    private readonly titleUpdater;
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    private title;
    constructor(configurationService: IConfigurationService, editorService: IEditorService, environmentService: IBrowserWorkbenchEnvironmentService, contextService: IWorkspaceContextService, instantiationService: IInstantiationService, labelService: ILabelService, productService: IProductService);
    get value(): string;
    get workspaceName(): string;
    private registerListeners;
    private onConfigurationChanged;
    private onActiveEditorChange;
    private doUpdateTitle;
    private getFullWindowTitle;
    getTitleDecorations(): {
        prefix: string | undefined;
        suffix: string | undefined;
    };
    updateProperties(properties: ITitleProperties): void;
    /**
     * Possible template values:
     *
     * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
     * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
     * {activeEditorShort}: e.g. myFile.txt
     * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
     * {activeFolderMedium}: e.g. myFolder/myFileFolder
     * {activeFolderShort}: e.g. myFileFolder
     * {rootName}: e.g. myFolder1, myFolder2, myFolder3
     * {rootPath}: e.g. /Users/Development
     * {folderName}: e.g. myFolder
     * {folderPath}: e.g. /Users/Development/myFolder
     * {appName}: e.g. VS Code
     * {remoteName}: e.g. SSH
     * {dirty}: indicator
     * {separator}: conditional separator
     */
    getWindowTitle(): string;
    isCustomTitleFormat(): boolean;
}
