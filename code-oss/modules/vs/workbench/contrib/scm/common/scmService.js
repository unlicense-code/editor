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
import { toDisposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { SCMInputChangeReason } from './scm';
import { ILogService } from 'vs/platform/log/common/log';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { HistoryNavigator2 } from 'vs/base/common/history';
import { Iterable } from 'vs/base/common/iterator';
let SCMInput = class SCMInput {
    repository;
    storageService;
    _value = '';
    get value() {
        return this._value;
    }
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    _placeholder = '';
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(placeholder) {
        this._placeholder = placeholder;
        this._onDidChangePlaceholder.fire(placeholder);
    }
    _onDidChangePlaceholder = new Emitter();
    onDidChangePlaceholder = this._onDidChangePlaceholder.event;
    _enabled = true;
    get enabled() {
        return this._enabled;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        this._onDidChangeEnablement.fire(enabled);
    }
    _onDidChangeEnablement = new Emitter();
    onDidChangeEnablement = this._onDidChangeEnablement.event;
    _visible = true;
    get visible() {
        return this._visible;
    }
    set visible(visible) {
        this._visible = visible;
        this._onDidChangeVisibility.fire(visible);
    }
    _onDidChangeVisibility = new Emitter();
    onDidChangeVisibility = this._onDidChangeVisibility.event;
    setFocus() {
        this._onDidChangeFocus.fire();
    }
    _onDidChangeFocus = new Emitter();
    onDidChangeFocus = this._onDidChangeFocus.event;
    showValidationMessage(message, type) {
        this._onDidChangeValidationMessage.fire({ message: message, type: type });
    }
    _onDidChangeValidationMessage = new Emitter();
    onDidChangeValidationMessage = this._onDidChangeValidationMessage.event;
    _validateInput = () => Promise.resolve(undefined);
    get validateInput() {
        return this._validateInput;
    }
    set validateInput(validateInput) {
        this._validateInput = validateInput;
        this._onDidChangeValidateInput.fire();
    }
    _onDidChangeValidateInput = new Emitter();
    onDidChangeValidateInput = this._onDidChangeValidateInput.event;
    historyNavigator;
    didChangeHistory;
    static didGarbageCollect = false;
    static migrateAndGarbageCollectStorage(storageService) {
        if (SCMInput.didGarbageCollect) {
            return;
        }
        // Migrate from old format // TODO@joao: remove this migration code a few releases
        const userKeys = Iterable.filter(storageService.keys(-1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */), key => key.startsWith('scm/input:'));
        for (const key of userKeys) {
            try {
                const rawHistory = storageService.get(key, -1 /* StorageScope.APPLICATION */, '');
                const history = JSON.parse(rawHistory);
                if (Array.isArray(history)) {
                    if (history.length === 0 || (history.length === 1 && history[0] === '')) {
                        // remove empty histories
                        storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                    }
                    else {
                        // migrate existing histories to have a timestamp
                        storageService.store(key, JSON.stringify({ timestamp: new Date().getTime(), history }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    }
                }
                else {
                    // move to MACHINE target
                    storageService.store(key, rawHistory, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
            catch {
                // remove unparseable entries
                storageService.remove(key, -1 /* StorageScope.APPLICATION */);
            }
        }
        // Garbage collect
        const machineKeys = Iterable.filter(storageService.keys(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */), key => key.startsWith('scm/input:'));
        for (const key of machineKeys) {
            try {
                const history = JSON.parse(storageService.get(key, -1 /* StorageScope.APPLICATION */, ''));
                if (Array.isArray(history?.history) && Number.isInteger(history?.timestamp) && new Date().getTime() - history?.timestamp > 2592000000) {
                    // garbage collect after 30 days
                    storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                }
            }
            catch {
                // remove unparseable entries
                storageService.remove(key, -1 /* StorageScope.APPLICATION */);
            }
        }
        SCMInput.didGarbageCollect = true;
    }
    constructor(repository, storageService) {
        this.repository = repository;
        this.storageService = storageService;
        SCMInput.migrateAndGarbageCollectStorage(storageService);
        const key = this.repository.provider.rootUri ? `scm/input:${this.repository.provider.label}:${this.repository.provider.rootUri?.path}` : undefined;
        let history;
        if (key) {
            try {
                history = JSON.parse(this.storageService.get(key, -1 /* StorageScope.APPLICATION */, '')).history;
                history = history?.map(s => s ?? '');
            }
            catch {
                // noop
            }
        }
        if (!Array.isArray(history) || history.length === 0) {
            history = [this._value];
        }
        else {
            this._value = history[history.length - 1];
        }
        this.historyNavigator = new HistoryNavigator2(history, 50);
        this.didChangeHistory = false;
        if (key) {
            this.storageService.onWillSaveState(_ => {
                if (this.historyNavigator.isAtEnd()) {
                    this.saveValue();
                }
                if (!this.didChangeHistory) {
                    return;
                }
                const history = [...this.historyNavigator].map(s => s ?? '');
                if (history.length === 0 || (history.length === 1 && history[0] === '')) {
                    storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                }
                else {
                    storageService.store(key, JSON.stringify({ timestamp: new Date().getTime(), history }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
                this.didChangeHistory = false;
            });
        }
    }
    setValue(value, transient, reason) {
        if (value === this._value) {
            return;
        }
        if (!transient) {
            this.saveValue();
            this.historyNavigator.add(value);
            this.didChangeHistory = true;
        }
        this._value = value;
        this._onDidChange.fire({ value, reason });
    }
    showNextHistoryValue() {
        if (this.historyNavigator.isAtEnd()) {
            return;
        }
        else if (!this.historyNavigator.has(this.value)) {
            this.saveValue();
            this.historyNavigator.resetCursor();
        }
        const value = this.historyNavigator.next();
        this.setValue(value, true, SCMInputChangeReason.HistoryNext);
    }
    showPreviousHistoryValue() {
        if (this.historyNavigator.isAtEnd()) {
            this.saveValue();
        }
        else if (!this.historyNavigator.has(this._value)) {
            this.saveValue();
            this.historyNavigator.resetCursor();
        }
        const value = this.historyNavigator.previous();
        this.setValue(value, true, SCMInputChangeReason.HistoryPrevious);
    }
    saveValue() {
        const oldValue = this.historyNavigator.replaceLast(this._value);
        this.didChangeHistory = this.didChangeHistory || (oldValue !== this._value);
    }
};
SCMInput = __decorate([
    __param(1, IStorageService)
], SCMInput);
let SCMRepository = class SCMRepository {
    id;
    provider;
    disposable;
    storageService;
    _selected = false;
    get selected() {
        return this._selected;
    }
    _onDidChangeSelection = new Emitter();
    onDidChangeSelection = this._onDidChangeSelection.event;
    input = new SCMInput(this, this.storageService);
    constructor(id, provider, disposable, storageService) {
        this.id = id;
        this.provider = provider;
        this.disposable = disposable;
        this.storageService = storageService;
    }
    setSelected(selected) {
        if (this._selected === selected) {
            return;
        }
        this._selected = selected;
        this._onDidChangeSelection.fire(selected);
    }
    dispose() {
        this.disposable.dispose();
        this.provider.dispose();
    }
};
SCMRepository = __decorate([
    __param(3, IStorageService)
], SCMRepository);
let SCMService = class SCMService {
    logService;
    storageService;
    _repositories = new Map(); // used in tests
    get repositories() { return this._repositories.values(); }
    get repositoryCount() { return this._repositories.size; }
    providerCount;
    _onDidAddProvider = new Emitter();
    onDidAddRepository = this._onDidAddProvider.event;
    _onDidRemoveProvider = new Emitter();
    onDidRemoveRepository = this._onDidRemoveProvider.event;
    constructor(logService, contextKeyService, storageService) {
        this.logService = logService;
        this.storageService = storageService;
        this.providerCount = contextKeyService.createKey('scm.providerCount', 0);
    }
    registerSCMProvider(provider) {
        this.logService.trace('SCMService#registerSCMProvider');
        if (this._repositories.has(provider.id)) {
            throw new Error(`SCM Provider ${provider.id} already exists.`);
        }
        const disposable = toDisposable(() => {
            this._repositories.delete(provider.id);
            this._onDidRemoveProvider.fire(repository);
            this.providerCount.set(this._repositories.size);
        });
        const repository = new SCMRepository(provider.id, provider, disposable, this.storageService);
        this._repositories.set(provider.id, repository);
        this._onDidAddProvider.fire(repository);
        this.providerCount.set(this._repositories.size);
        return repository;
    }
    getRepository(id) {
        return this._repositories.get(id);
    }
};
SCMService = __decorate([
    __param(0, ILogService),
    __param(1, IContextKeyService),
    __param(2, IStorageService)
], SCMService);
export { SCMService };
