import { WrappingIndent, IComputedEditorOptions } from 'vs/editor/common/config/editorOptions';
import { FontInfo } from 'vs/editor/common/config/fontInfo';
import { ILineBreaksComputerFactory, ILineBreaksComputer } from 'vs/editor/common/modelLineProjectionData';
export declare class MonospaceLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    static create(options: IComputedEditorOptions): MonospaceLineBreaksComputerFactory;
    private readonly classifier;
    constructor(breakBeforeChars: string, breakAfterChars: string);
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent): ILineBreaksComputer;
}
