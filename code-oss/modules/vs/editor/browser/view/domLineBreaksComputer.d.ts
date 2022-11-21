import { WrappingIndent } from 'vs/editor/common/config/editorOptions';
import { FontInfo } from 'vs/editor/common/config/fontInfo';
import { ILineBreaksComputer, ILineBreaksComputerFactory } from 'vs/editor/common/modelLineProjectionData';
export declare class DOMLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    static create(): DOMLineBreaksComputerFactory;
    constructor();
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent): ILineBreaksComputer;
}
