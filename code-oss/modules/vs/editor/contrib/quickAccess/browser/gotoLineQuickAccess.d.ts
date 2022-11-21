import { CancellationToken } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IPosition } from 'vs/editor/common/core/position';
import { AbstractEditorNavigationQuickAccessProvider, IQuickAccessTextEditorContext } from 'vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess';
import { IQuickPick, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
interface IGotoLineQuickPickItem extends IQuickPickItem, Partial<IPosition> {
}
export declare abstract class AbstractGotoLineQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
    static PREFIX: string;
    constructor();
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoLineQuickPickItem>): IDisposable;
    protected provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IGotoLineQuickPickItem>, token: CancellationToken): IDisposable;
    private toRange;
    private parsePosition;
    private getPickLabel;
    private isValidLineNumber;
    private isValidColumn;
    private lineCount;
}
export {};
