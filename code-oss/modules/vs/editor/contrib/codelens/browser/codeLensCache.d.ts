import { ITextModel } from 'vs/editor/common/model';
import { CodeLensModel } from 'vs/editor/contrib/codelens/browser/codelens';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare const ICodeLensCache: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ICodeLensCache>;
export interface ICodeLensCache {
    readonly _serviceBrand: undefined;
    put(model: ITextModel, data: CodeLensModel): void;
    get(model: ITextModel): CodeLensModel | undefined;
    delete(model: ITextModel): void;
}
export declare class CodeLensCache implements ICodeLensCache {
    readonly _serviceBrand: undefined;
    private readonly _fakeProvider;
    private readonly _cache;
    constructor(storageService: IStorageService);
    put(model: ITextModel, data: CodeLensModel): void;
    get(model: ITextModel): CodeLensModel | undefined;
    delete(model: ITextModel): void;
    private _serialize;
    private _deserialize;
}
