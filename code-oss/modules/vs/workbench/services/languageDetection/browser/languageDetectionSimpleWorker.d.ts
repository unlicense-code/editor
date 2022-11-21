import { IRequestHandler } from 'vs/base/common/worker/simpleWorker';
import { EditorSimpleWorker } from 'vs/editor/common/services/editorSimpleWorker';
import { IEditorWorkerHost } from 'vs/editor/common/services/editorWorkerHost';
/**
 * Called on the worker side
 * @internal
 */
export declare function create(host: IEditorWorkerHost): IRequestHandler;
/**
 * @internal
 */
export declare class LanguageDetectionSimpleWorker extends EditorSimpleWorker {
    private static readonly expectedRelativeConfidence;
    private static readonly positiveConfidenceCorrectionBucket1;
    private static readonly positiveConfidenceCorrectionBucket2;
    private static readonly negativeConfidenceCorrection;
    private _regexpModel;
    private _regexpLoadFailed;
    private _modelOperations;
    private _loadFailed;
    private modelIdToCoreId;
    detectLanguage(uri: string, langBiases: Record<string, number> | undefined, preferHistory: boolean, supportedLangs?: string[]): Promise<string | undefined>;
    private getTextForDetection;
    private getRegexpModel;
    private runRegexpModel;
    private getModelOperations;
    private adjustLanguageConfidence;
    private detectLanguagesImpl;
}
