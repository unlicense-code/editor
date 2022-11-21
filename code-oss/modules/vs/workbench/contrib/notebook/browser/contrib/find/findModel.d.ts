import { INotebookEditor, CellFindMatch, OutputFindMatch, ICellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { Range } from 'vs/editor/common/core/range';
import { FindMatch } from 'vs/editor/common/model';
import { PrefixSumComputer } from 'vs/editor/common/model/prefixSumComputer';
import { FindReplaceState } from 'vs/editor/contrib/find/browser/findState';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
import { NotebookFindFilters } from 'vs/workbench/contrib/notebook/browser/contrib/find/findFilters';
export declare class FindModel extends Disposable {
    private readonly _notebookEditor;
    private readonly _state;
    private readonly _configurationService;
    private _findMatches;
    protected _findMatchesStarts: PrefixSumComputer | null;
    private _currentMatch;
    private _allMatchesDecorations;
    private _currentMatchCellDecorations;
    private _allMatchesCellDecorations;
    private _currentMatchDecorations;
    private readonly _throttledDelayer;
    private _computePromise;
    private readonly _modelDisposable;
    get findMatches(): CellFindMatch[];
    get currentMatch(): number;
    constructor(_notebookEditor: INotebookEditor, _state: FindReplaceState<NotebookFindFilters>, _configurationService: IConfigurationService);
    ensureFindMatches(): void;
    getCurrentMatch(): {
        cell: ICellViewModel;
        match: FindMatch | OutputFindMatch;
        isModelMatch: boolean;
    };
    refreshCurrentMatch(focus: {
        cell: ICellViewModel;
        range: Range;
    }): void;
    find(option: {
        previous: boolean;
    } | {
        index: number;
    }): void;
    private revealCellRange;
    private _registerModelListener;
    research(): Promise<void>;
    _research(): Promise<void>;
    private set;
    private _compute;
    private _updateCurrentMatch;
    private _matchesCountBeforeIndex;
    private constructFindMatchesStarts;
    private highlightCurrentFindMatchDecoration;
    private clearCurrentFindMatchDecoration;
    private setAllFindMatchesDecorations;
    clear(): void;
}
