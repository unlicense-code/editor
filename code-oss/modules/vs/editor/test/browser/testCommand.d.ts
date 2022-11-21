import { Selection } from 'vs/editor/common/core/selection';
import { ICommand } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
export declare function testCommand(lines: string[], languageId: string | null, selection: Selection, commandFactory: (accessor: ServicesAccessor, selection: Selection) => ICommand, expectedLines: string[], expectedSelection: Selection, forceTokenization?: boolean, prepare?: (accessor: ServicesAccessor, disposables: DisposableStore) => void): void;
/**
 * Extract edit operations if command `command` were to execute on model `model`
 */
export declare function getEditOperation(model: ITextModel, command: ICommand): ISingleEditOperation[];
