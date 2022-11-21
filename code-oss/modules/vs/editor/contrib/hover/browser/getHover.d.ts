import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { Hover, HoverProvider } from 'vs/editor/common/languages';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export declare class HoverProviderResult {
    readonly provider: HoverProvider;
    readonly hover: Hover;
    readonly ordinal: number;
    constructor(provider: HoverProvider, hover: Hover, ordinal: number);
}
export declare function getHover(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken): AsyncIterableObject<HoverProviderResult>;
export declare function getHoverPromise(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken): Promise<Hover[]>;
