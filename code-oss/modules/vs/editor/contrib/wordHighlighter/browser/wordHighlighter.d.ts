import { CancellationToken } from 'vs/base/common/cancellation';
import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { DocumentHighlight, DocumentHighlightProvider } from 'vs/editor/common/languages';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export declare function getOccurrencesAtPosition(registry: LanguageFeatureRegistry<DocumentHighlightProvider>, model: ITextModel, position: Position, token: CancellationToken): Promise<DocumentHighlight[] | null | undefined>;
