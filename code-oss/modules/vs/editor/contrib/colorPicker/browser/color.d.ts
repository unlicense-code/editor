import { CancellationToken } from 'vs/base/common/cancellation';
import { ITextModel } from 'vs/editor/common/model';
import { DocumentColorProvider, IColorInformation, IColorPresentation } from 'vs/editor/common/languages';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export interface IColorData {
    colorInfo: IColorInformation;
    provider: DocumentColorProvider;
}
export declare function getColors(registry: LanguageFeatureRegistry<DocumentColorProvider>, model: ITextModel, token: CancellationToken): Promise<IColorData[]>;
export declare function getColorPresentations(model: ITextModel, colorInfo: IColorInformation, provider: DocumentColorProvider, token: CancellationToken): Promise<IColorPresentation[] | null | undefined>;
