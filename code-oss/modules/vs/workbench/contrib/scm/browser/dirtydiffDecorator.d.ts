import 'vs/css!./media/dirtydiffDecorator';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import * as ext from 'vs/workbench/common/contributions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { URI } from 'vs/base/common/uri';
import { ISCMService, ISCMProvider } from 'vs/workbench/contrib/scm/common/scm';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ServicesAccessor, EditorAction } from 'vs/editor/browser/editorExtensions';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IEditorModel, IEditorContribution } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { ISplice } from 'vs/base/common/sequence';
import { IResolvedTextFileEditorModel, ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IChange } from 'vs/editor/common/diff/smartLinesDiffComputer';
export interface IModelRegistry {
    getModel(editorModel: IEditorModel): DirtyDiffModel | null;
}
export declare const isDirtyDiffVisible: RawContextKey<boolean>;
export declare class ShowPreviousChangeAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ShowNextChangeAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GotoPreviousChangeAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GotoNextChangeAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class DirtyDiffController extends Disposable implements IEditorContribution {
    private editor;
    private readonly configurationService;
    private readonly instantiationService;
    static readonly ID = "editor.contrib.dirtydiff";
    static get(editor: ICodeEditor): DirtyDiffController | null;
    modelRegistry: IModelRegistry | null;
    private model;
    private widget;
    private currentIndex;
    private readonly isDirtyDiffVisible;
    private session;
    private mouseDownInfo;
    private enabled;
    private gutterActionDisposables;
    private stylesheet;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private onDidChangeGutterAction;
    canNavigate(): boolean;
    next(lineNumber?: number): void;
    previous(lineNumber?: number): void;
    close(): void;
    private assertWidget;
    private onDidModelChange;
    private onEditorMouseDown;
    private onEditorMouseUp;
    getChanges(): IChange[];
    dispose(): void;
}
export declare function createProviderComparer(uri: URI): (a: ISCMProvider, b: ISCMProvider) => number;
export declare function getOriginalResource(scmService: ISCMService, uri: URI): Promise<URI | null>;
export declare class DirtyDiffModel extends Disposable {
    private readonly scmService;
    private readonly editorWorkerService;
    private readonly configurationService;
    private readonly textModelResolverService;
    private readonly progressService;
    private _originalResource;
    private _originalModel;
    private _model;
    get original(): ITextModel | null;
    get modified(): ITextModel | null;
    private diffDelayer;
    private _originalURIPromise?;
    private repositoryDisposables;
    private readonly originalModelDisposables;
    private _disposed;
    private readonly _onDidChange;
    readonly onDidChange: Event<{
        changes: IChange[];
        diff: ISplice<IChange>[];
    }>;
    private _changes;
    get changes(): IChange[];
    constructor(textFileModel: IResolvedTextFileEditorModel, scmService: ISCMService, editorWorkerService: IEditorWorkerService, configurationService: IConfigurationService, textModelResolverService: ITextModelService, progressService: IProgressService);
    private onDidAddRepository;
    private triggerDiff;
    private setChanges;
    private diff;
    private getOriginalURIPromise;
    private getOriginalResource;
    findNextClosestChange(lineNumber: number, inclusive?: boolean): number;
    findPreviousClosestChange(lineNumber: number, inclusive?: boolean): number;
    dispose(): void;
}
export declare class DirtyDiffWorkbenchController extends Disposable implements ext.IWorkbenchContribution, IModelRegistry {
    private readonly editorService;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly textFileService;
    private enabled;
    private viewState;
    private items;
    private readonly transientDisposables;
    private stylesheet;
    constructor(editorService: IEditorService, instantiationService: IInstantiationService, configurationService: IConfigurationService, textFileService: ITextFileService);
    private onDidChangeConfiguration;
    private onDidChangeDiffWidthConfiguration;
    private onDidChangeDiffVisibiltiyConfiguration;
    private setViewState;
    private enable;
    private disable;
    private onEditorsChanged;
    private onModelVisible;
    private onModelInvisible;
    getModel(editorModel: ITextModel): DirtyDiffModel | null;
    dispose(): void;
}
