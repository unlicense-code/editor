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
import { Emitter } from 'vs/base/common/event';
import { localize } from 'vs/nls';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { listInvalidItemForeground, listDeemphasizedForeground } from 'vs/platform/theme/common/colorRegistry';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { explorerRootErrorEmitter } from 'vs/workbench/contrib/files/browser/views/explorerViewer';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
export function provideDecorations(fileStat) {
    if (fileStat.isRoot && fileStat.isError) {
        return {
            tooltip: localize('canNotResolve', "Unable to resolve workspace folder"),
            letter: '!',
            color: listInvalidItemForeground,
        };
    }
    if (fileStat.isSymbolicLink) {
        return {
            tooltip: localize('symbolicLlink', "Symbolic Link"),
            letter: '\u2937'
        };
    }
    if (fileStat.isUnknown) {
        return {
            tooltip: localize('unknown', "Unknown File Type"),
            letter: '?'
        };
    }
    if (fileStat.isExcluded) {
        return {
            color: listDeemphasizedForeground,
        };
    }
    return undefined;
}
let ExplorerDecorationsProvider = class ExplorerDecorationsProvider {
    explorerService;
    label = localize('label', "Explorer");
    _onDidChange = new Emitter();
    toDispose = new DisposableStore();
    constructor(explorerService, contextService) {
        this.explorerService = explorerService;
        this.toDispose.add(this._onDidChange);
        this.toDispose.add(contextService.onDidChangeWorkspaceFolders(e => {
            this._onDidChange.fire(e.changed.concat(e.added).map(wf => wf.uri));
        }));
        this.toDispose.add(explorerRootErrorEmitter.event((resource => {
            this._onDidChange.fire([resource]);
        })));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    async provideDecorations(resource) {
        const fileStat = this.explorerService.findClosest(resource);
        if (!fileStat) {
            throw new Error('ExplorerItem not found');
        }
        return provideDecorations(fileStat);
    }
    dispose() {
        this.toDispose.dispose();
    }
};
ExplorerDecorationsProvider = __decorate([
    __param(0, IExplorerService),
    __param(1, IWorkspaceContextService)
], ExplorerDecorationsProvider);
export { ExplorerDecorationsProvider };
