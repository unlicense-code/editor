import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { TextModel } from 'vs/editor/common/model/textModel';
import { ViewModel } from 'vs/editor/common/viewModel/viewModelImpl';
export declare function testViewModel(text: string[], options: IEditorOptions, callback: (viewModel: ViewModel, model: TextModel) => void): void;
