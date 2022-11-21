import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from 'vs/workbench/contrib/notebook/common/notebookCommon';
export declare const INotebookCellStatusBarService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INotebookCellStatusBarService>;
export interface INotebookCellStatusBarService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeProviders: Event<void>;
    readonly onDidChangeItems: Event<void>;
    registerCellStatusBarItemProvider(provider: INotebookCellStatusBarItemProvider): IDisposable;
    getStatusBarItemsForCell(docUri: URI, cellIndex: number, viewType: string, token: CancellationToken): Promise<INotebookCellStatusBarItemList[]>;
}
