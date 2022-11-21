import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITextModel } from 'vs/editor/common/model';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageSelection } from 'vs/editor/common/languages/language';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { OutputChannelUpdateMode } from 'vs/workbench/services/output/common/output';
export interface IOutputChannelModel extends IDisposable {
    readonly onDispose: Event<void>;
    append(output: string): void;
    update(mode: OutputChannelUpdateMode, till: number | undefined, immediate: boolean): void;
    loadModel(): Promise<ITextModel>;
    clear(): void;
    replace(value: string): void;
}
export declare class FileOutputChannelModel extends Disposable implements IOutputChannelModel {
    private readonly modelUri;
    private readonly language;
    private readonly file;
    private readonly fileService;
    private readonly modelService;
    private readonly editorWorkerService;
    private readonly _onDispose;
    readonly onDispose: Event<void>;
    private readonly fileHandler;
    private etag;
    private loadModelPromise;
    private model;
    private modelUpdateInProgress;
    private readonly modelUpdateCancellationSource;
    private readonly appendThrottler;
    private replacePromise;
    private startOffset;
    private endOffset;
    constructor(modelUri: URI, language: ILanguageSelection, file: URI, fileService: IFileService, modelService: IModelService, logService: ILogService, editorWorkerService: IEditorWorkerService);
    append(message: string): void;
    replace(message: string): void;
    clear(): void;
    update(mode: OutputChannelUpdateMode, till: number | undefined, immediate: boolean): void;
    loadModel(): Promise<ITextModel>;
    private createModel;
    private doUpdate;
    private clearContent;
    private appendContent;
    private replaceContent;
    private getReplaceEdits;
    private doUpdateModel;
    protected cancelModelUpdate(): void;
    private getContentToUpdate;
    private onDidContentChange;
    protected isVisible(): boolean;
    dispose(): void;
}
export declare class DelegatedOutputChannelModel extends Disposable implements IOutputChannelModel {
    private readonly instantiationService;
    private readonly fileService;
    private readonly _onDispose;
    readonly onDispose: Event<void>;
    private readonly outputChannelModel;
    constructor(id: string, modelUri: URI, language: ILanguageSelection, outputDir: Promise<URI>, instantiationService: IInstantiationService, fileService: IFileService);
    private createOutputChannelModel;
    append(output: string): void;
    update(mode: OutputChannelUpdateMode, till: number | undefined, immediate: boolean): void;
    loadModel(): Promise<ITextModel>;
    clear(): void;
    replace(value: string): void;
}
