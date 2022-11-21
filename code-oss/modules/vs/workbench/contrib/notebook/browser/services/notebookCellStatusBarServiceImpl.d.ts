import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from 'vs/workbench/contrib/notebook/common/notebookCommon';
export declare class NotebookCellStatusBarService extends Disposable implements INotebookCellStatusBarService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: Event<void>;
    private readonly _onDidChangeItems;
    readonly onDidChangeItems: Event<void>;
    private readonly _providers;
    registerCellStatusBarItemProvider(provider: INotebookCellStatusBarItemProvider): IDisposable;
    getStatusBarItemsForCell(docUri: URI, cellIndex: number, viewType: string, token: CancellationToken): Promise<INotebookCellStatusBarItemList[]>;
}
