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
import { IStorageService } from 'vs/platform/storage/common/storage';
import { isEmptyObject } from 'vs/base/common/types';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ISearchHistoryService = createDecorator('searchHistoryService');
let SearchHistoryService = class SearchHistoryService {
    storageService;
    static SEARCH_HISTORY_KEY = 'workbench.search.history';
    _onDidClearHistory = new Emitter();
    onDidClearHistory = this._onDidClearHistory.event;
    constructor(storageService) {
        this.storageService = storageService;
    }
    clearHistory() {
        this.storageService.remove(SearchHistoryService.SEARCH_HISTORY_KEY, 1 /* StorageScope.WORKSPACE */);
        this._onDidClearHistory.fire();
    }
    load() {
        let result;
        const raw = this.storageService.get(SearchHistoryService.SEARCH_HISTORY_KEY, 1 /* StorageScope.WORKSPACE */);
        if (raw) {
            try {
                result = JSON.parse(raw);
            }
            catch (e) {
                // Invalid data
            }
        }
        return result || {};
    }
    save(history) {
        if (isEmptyObject(history)) {
            this.storageService.remove(SearchHistoryService.SEARCH_HISTORY_KEY, 1 /* StorageScope.WORKSPACE */);
        }
        else {
            this.storageService.store(SearchHistoryService.SEARCH_HISTORY_KEY, JSON.stringify(history), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
    }
};
SearchHistoryService = __decorate([
    __param(0, IStorageService)
], SearchHistoryService);
export { SearchHistoryService };
