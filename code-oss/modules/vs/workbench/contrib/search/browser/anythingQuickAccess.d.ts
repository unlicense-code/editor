import 'vs/css!./media/anythingQuickAccess';
import { IQuickPick, IQuickPickItemWithResource, IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IPickerQuickAccessItem, PickerQuickAccessProvider, FastAndSlowPicks, Picks } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ISearchService } from 'vs/workbench/services/search/common/search';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IFileService } from 'vs/platform/files/common/files';
import { CancellationToken } from 'vs/base/common/cancellation';
import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { ILabelService } from 'vs/platform/label/common/label';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IRange } from 'vs/editor/common/core/range';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { AnythingQuickAccessProviderRunOptions, DefaultQuickAccessFilterValue } from 'vs/platform/quickinput/common/quickAccess';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IEditor } from 'vs/editor/common/editorCommon';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
interface IAnythingQuickPickItem extends IPickerQuickAccessItem, IQuickPickItemWithResource {
}
export declare class AnythingQuickAccessProvider extends PickerQuickAccessProvider<IAnythingQuickPickItem> {
    private readonly instantiationService;
    private readonly searchService;
    private readonly contextService;
    private readonly pathService;
    private readonly environmentService;
    private readonly fileService;
    private readonly labelService;
    private readonly modelService;
    private readonly languageService;
    private readonly workingCopyService;
    private readonly configurationService;
    private readonly editorService;
    private readonly historyService;
    private readonly filesConfigurationService;
    private readonly textModelService;
    private readonly uriIdentityService;
    private readonly quickInputService;
    static PREFIX: string;
    private static readonly NO_RESULTS_PICK;
    private static readonly MAX_RESULTS;
    private static readonly TYPING_SEARCH_DELAY;
    private readonly pickState;
    get defaultFilterValue(): DefaultQuickAccessFilterValue | undefined;
    constructor(instantiationService: IInstantiationService, searchService: ISearchService, contextService: IWorkspaceContextService, pathService: IPathService, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, labelService: ILabelService, modelService: IModelService, languageService: ILanguageService, workingCopyService: IWorkingCopyService, configurationService: IConfigurationService, editorService: IEditorService, historyService: IHistoryService, filesConfigurationService: IFilesConfigurationService, textModelService: ITextModelService, uriIdentityService: IUriIdentityService, quickInputService: IQuickInputService);
    private get configuration();
    provide(picker: IQuickPick<IAnythingQuickPickItem>, token: CancellationToken, runOptions?: AnythingQuickAccessProviderRunOptions): IDisposable;
    private decorateAndRevealSymbolRange;
    protected _getPicks(originalFilter: string, disposables: DisposableStore, token: CancellationToken, runOptions?: AnythingQuickAccessProviderRunOptions): Picks<IAnythingQuickPickItem> | Promise<Picks<IAnythingQuickPickItem>> | FastAndSlowPicks<IAnythingQuickPickItem> | null;
    private doGetPicks;
    private getAdditionalPicks;
    private readonly labelOnlyEditorHistoryPickAccessor;
    private getEditorHistoryPicks;
    private readonly fileQueryDelayer;
    private readonly fileQueryBuilder;
    private createFileQueryCache;
    private getFilePicks;
    private doFileSearch;
    private getFileSearchResults;
    private doGetFileSearchResults;
    private getFileQueryOptions;
    private getAbsolutePathFileResult;
    private getRelativePathFileResults;
    private helpQuickAccess;
    private getHelpPicks;
    private workspaceSymbolsQuickAccess;
    private getWorkspaceSymbolPicks;
    private readonly editorSymbolsQuickAccess;
    private getEditorSymbolPicks;
    private doGetEditorSymbolPicks;
    addDecorations(editor: IEditor, range: IRange): void;
    clearDecorations(editor: IEditor): void;
    private createAnythingPick;
    private openAnything;
}
export {};
