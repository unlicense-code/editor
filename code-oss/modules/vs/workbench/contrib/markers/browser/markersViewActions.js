/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as DOM from 'vs/base/browser/dom';
import { Action } from 'vs/base/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import Messages from 'vs/workbench/contrib/markers/browser/messages';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { Codicon } from 'vs/base/common/codicons';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { MarkersContextKeys } from 'vs/workbench/contrib/markers/common/markers';
import 'vs/css!./markersViewActions';
export class MarkersFilters extends Disposable {
    contextKeyService;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    constructor(options, contextKeyService) {
        super();
        this.contextKeyService = contextKeyService;
        this._showErrors.set(options.showErrors);
        this._showWarnings.set(options.showWarnings);
        this._showInfos.set(options.showInfos);
        this._excludedFiles.set(options.excludedFiles);
        this._activeFile.set(options.activeFile);
        this.filterHistory = options.filterHistory;
    }
    filterHistory;
    _excludedFiles = MarkersContextKeys.ShowExcludedFilesFilterContextKey.bindTo(this.contextKeyService);
    get excludedFiles() {
        return !!this._excludedFiles.get();
    }
    set excludedFiles(filesExclude) {
        if (this._excludedFiles.get() !== filesExclude) {
            this._excludedFiles.set(filesExclude);
            this._onDidChange.fire({ excludedFiles: true });
        }
    }
    _activeFile = MarkersContextKeys.ShowActiveFileFilterContextKey.bindTo(this.contextKeyService);
    get activeFile() {
        return !!this._activeFile.get();
    }
    set activeFile(activeFile) {
        if (this._activeFile.get() !== activeFile) {
            this._activeFile.set(activeFile);
            this._onDidChange.fire({ activeFile: true });
        }
    }
    _showWarnings = MarkersContextKeys.ShowWarningsFilterContextKey.bindTo(this.contextKeyService);
    get showWarnings() {
        return !!this._showWarnings.get();
    }
    set showWarnings(showWarnings) {
        if (this._showWarnings.get() !== showWarnings) {
            this._showWarnings.set(showWarnings);
            this._onDidChange.fire({ showWarnings: true });
        }
    }
    _showErrors = MarkersContextKeys.ShowErrorsFilterContextKey.bindTo(this.contextKeyService);
    get showErrors() {
        return !!this._showErrors.get();
    }
    set showErrors(showErrors) {
        if (this._showErrors.get() !== showErrors) {
            this._showErrors.set(showErrors);
            this._onDidChange.fire({ showErrors: true });
        }
    }
    _showInfos = MarkersContextKeys.ShowInfoFilterContextKey.bindTo(this.contextKeyService);
    get showInfos() {
        return !!this._showInfos.get();
    }
    set showInfos(showInfos) {
        if (this._showInfos.get() !== showInfos) {
            this._showInfos.set(showInfos);
            this._onDidChange.fire({ showInfos: true });
        }
    }
}
export class QuickFixAction extends Action {
    marker;
    static ID = 'workbench.actions.problems.quickfix';
    static CLASS = 'markers-panel-action-quickfix ' + Codicon.lightBulb.classNames;
    static AUTO_FIX_CLASS = QuickFixAction.CLASS + ' autofixable';
    _onShowQuickFixes = this._register(new Emitter());
    onShowQuickFixes = this._onShowQuickFixes.event;
    _quickFixes = [];
    get quickFixes() {
        return this._quickFixes;
    }
    set quickFixes(quickFixes) {
        this._quickFixes = quickFixes;
        this.enabled = this._quickFixes.length > 0;
    }
    autoFixable(autofixable) {
        this.class = autofixable ? QuickFixAction.AUTO_FIX_CLASS : QuickFixAction.CLASS;
    }
    constructor(marker) {
        super(QuickFixAction.ID, Messages.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX, QuickFixAction.CLASS, false);
        this.marker = marker;
    }
    run() {
        this._onShowQuickFixes.fire();
        return Promise.resolve();
    }
}
let QuickFixActionViewItem = class QuickFixActionViewItem extends ActionViewItem {
    contextMenuService;
    constructor(action, contextMenuService) {
        super(null, action, { icon: true, label: false });
        this.contextMenuService = contextMenuService;
    }
    onClick(event) {
        DOM.EventHelper.stop(event, true);
        this.showQuickFixes();
    }
    showQuickFixes() {
        if (!this.element) {
            return;
        }
        if (!this.isEnabled()) {
            return;
        }
        const elementPosition = DOM.getDomNodePagePosition(this.element);
        const quickFixes = this.action.quickFixes;
        if (quickFixes.length) {
            this.contextMenuService.showContextMenu({
                getAnchor: () => ({ x: elementPosition.left + 10, y: elementPosition.top + elementPosition.height + 4 }),
                getActions: () => quickFixes
            });
        }
    }
};
QuickFixActionViewItem = __decorate([
    __param(1, IContextMenuService)
], QuickFixActionViewItem);
export { QuickFixActionViewItem };
