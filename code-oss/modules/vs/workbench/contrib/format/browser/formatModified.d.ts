import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
export declare function getModifiedRanges(accessor: ServicesAccessor, modified: ITextModel): Promise<Range[] | undefined | null>;
