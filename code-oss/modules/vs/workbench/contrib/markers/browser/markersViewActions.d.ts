import * as DOM from 'vs/base/browser/dom';
import { Action, IAction } from 'vs/base/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { Disposable } from 'vs/base/common/lifecycle';
import { Marker } from 'vs/workbench/contrib/markers/browser/markersModel';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Event } from 'vs/base/common/event';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import 'vs/css!./markersViewActions';
export interface IMarkersFiltersChangeEvent {
    excludedFiles?: boolean;
    showWarnings?: boolean;
    showErrors?: boolean;
    showInfos?: boolean;
    activeFile?: boolean;
}
export interface IMarkersFiltersOptions {
    filterHistory: string[];
    showErrors: boolean;
    showWarnings: boolean;
    showInfos: boolean;
    excludedFiles: boolean;
    activeFile: boolean;
}
export declare class MarkersFilters extends Disposable {
    private readonly contextKeyService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IMarkersFiltersChangeEvent>;
    constructor(options: IMarkersFiltersOptions, contextKeyService: IContextKeyService);
    filterHistory: string[];
    private readonly _excludedFiles;
    get excludedFiles(): boolean;
    set excludedFiles(filesExclude: boolean);
    private readonly _activeFile;
    get activeFile(): boolean;
    set activeFile(activeFile: boolean);
    private readonly _showWarnings;
    get showWarnings(): boolean;
    set showWarnings(showWarnings: boolean);
    private readonly _showErrors;
    get showErrors(): boolean;
    set showErrors(showErrors: boolean);
    private readonly _showInfos;
    get showInfos(): boolean;
    set showInfos(showInfos: boolean);
}
export declare class QuickFixAction extends Action {
    readonly marker: Marker;
    static readonly ID: string;
    private static readonly CLASS;
    private static readonly AUTO_FIX_CLASS;
    private readonly _onShowQuickFixes;
    readonly onShowQuickFixes: Event<void>;
    private _quickFixes;
    get quickFixes(): IAction[];
    set quickFixes(quickFixes: IAction[]);
    autoFixable(autofixable: boolean): void;
    constructor(marker: Marker);
    run(): Promise<void>;
}
export declare class QuickFixActionViewItem extends ActionViewItem {
    private readonly contextMenuService;
    constructor(action: QuickFixAction, contextMenuService: IContextMenuService);
    onClick(event: DOM.EventLike): void;
    showQuickFixes(): void;
}
