import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { ITextBufferFactory, ITextModel, ITextModelCreationOptions } from 'vs/editor/common/model';
import { ILanguageSelection } from 'vs/editor/common/languages/language';
import { DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider } from 'vs/editor/common/languages';
import { SemanticTokensProviderStyling } from 'vs/editor/common/services/semanticTokensProviderStyling';
export declare const IModelService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IModelService>;
export declare type DocumentTokensProvider = DocumentSemanticTokensProvider | DocumentRangeSemanticTokensProvider;
export interface IModelService {
    readonly _serviceBrand: undefined;
    createModel(value: string | ITextBufferFactory, languageSelection: ILanguageSelection | null, resource?: URI, isForSimpleWidget?: boolean): ITextModel;
    updateModel(model: ITextModel, value: string | ITextBufferFactory): void;
    setMode(model: ITextModel, languageSelection: ILanguageSelection, source?: string): void;
    destroyModel(resource: URI): void;
    getModels(): ITextModel[];
    getCreationOptions(language: string, resource: URI, isForSimpleWidget: boolean): ITextModelCreationOptions;
    getModel(resource: URI): ITextModel | null;
    getSemanticTokensProviderStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
    onModelAdded: Event<ITextModel>;
    onModelRemoved: Event<ITextModel>;
    onModelLanguageChanged: Event<{
        model: ITextModel;
        oldLanguageId: string;
    }>;
}
