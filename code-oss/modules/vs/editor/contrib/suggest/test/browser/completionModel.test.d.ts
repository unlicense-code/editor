import { IPosition } from 'vs/editor/common/core/position';
import * as languages from 'vs/editor/common/languages';
import { CompletionItem } from 'vs/editor/contrib/suggest/browser/suggest';
export declare function createSuggestItem(label: string | languages.CompletionItemLabel, overwriteBefore: number, kind?: languages.CompletionItemKind, incomplete?: boolean, position?: IPosition, sortText?: string, filterText?: string): CompletionItem;
