import { CancellationToken } from 'vs/base/common/cancellation';
import { ITextModel } from 'vs/editor/common/model';
import { CodeLens, CodeLensList, CodeLensProvider } from 'vs/editor/common/languages';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export interface CodeLensItem {
    symbol: CodeLens;
    provider: CodeLensProvider;
}
export declare class CodeLensModel {
    lenses: CodeLensItem[];
    private readonly _disposables;
    dispose(): void;
    get isDisposed(): boolean;
    add(list: CodeLensList, provider: CodeLensProvider): void;
}
export declare function getCodeLensModel(registry: LanguageFeatureRegistry<CodeLensProvider>, model: ITextModel, token: CancellationToken): Promise<CodeLensModel>;
