import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { CompleteEnterAction } from 'vs/editor/common/languages/languageConfiguration';
import { EditorAutoIndentStrategy } from 'vs/editor/common/config/editorOptions';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
export declare function getEnterAction(autoIndent: EditorAutoIndentStrategy, model: ITextModel, range: Range, languageConfigurationService: ILanguageConfigurationService): CompleteEnterAction | null;
