import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { ITextModel } from 'vs/editor/common/model';
import { ILogService } from 'vs/platform/log/common/log';
export declare const ILanguageFeatureDebounceService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILanguageFeatureDebounceService>;
export interface ILanguageFeatureDebounceService {
    readonly _serviceBrand: undefined;
    for(feature: LanguageFeatureRegistry<object>, debugName: string, config?: {
        min?: number;
        max?: number;
        salt?: string;
    }): IFeatureDebounceInformation;
}
export interface IFeatureDebounceInformation {
    get(model: ITextModel): number;
    update(model: ITextModel, value: number): number;
    default(): number;
}
export declare class LanguageFeatureDebounceService implements ILanguageFeatureDebounceService {
    private readonly _logService;
    _serviceBrand: undefined;
    private readonly _data;
    constructor(_logService: ILogService);
    for(feature: LanguageFeatureRegistry<object>, name: string, config?: {
        min?: number;
        max?: number;
        key?: string;
    }): IFeatureDebounceInformation;
    private _overallAverage;
}
