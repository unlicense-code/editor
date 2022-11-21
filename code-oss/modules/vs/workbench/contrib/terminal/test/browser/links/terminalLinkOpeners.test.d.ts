import { ITextEditorSelection } from 'vs/platform/editor/common/editor';
export interface ITerminalLinkActivationResult {
    source: 'editor' | 'search';
    link: string;
    selection?: ITextEditorSelection;
}
