/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isEmptyObject } from 'vs/base/common/types';
import { onUnexpectedError } from 'vs/base/common/errors';
export class Memento {
    storageService;
    static applicationMementos = new Map();
    static profileMementos = new Map();
    static workspaceMementos = new Map();
    static COMMON_PREFIX = 'memento/';
    id;
    constructor(id, storageService) {
        this.storageService = storageService;
        this.id = Memento.COMMON_PREFIX + id;
    }
    getMemento(scope, target) {
        switch (scope) {
            // Scope by Workspace
            case 1 /* StorageScope.WORKSPACE */: {
                let workspaceMemento = Memento.workspaceMementos.get(this.id);
                if (!workspaceMemento) {
                    workspaceMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                    Memento.workspaceMementos.set(this.id, workspaceMemento);
                }
                return workspaceMemento.getMemento();
            }
            // Scope Profile
            case 0 /* StorageScope.PROFILE */: {
                let profileMemento = Memento.profileMementos.get(this.id);
                if (!profileMemento) {
                    profileMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                    Memento.profileMementos.set(this.id, profileMemento);
                }
                return profileMemento.getMemento();
            }
            // Scope Application
            case -1 /* StorageScope.APPLICATION */: {
                let applicationMemento = Memento.applicationMementos.get(this.id);
                if (!applicationMemento) {
                    applicationMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                    Memento.applicationMementos.set(this.id, applicationMemento);
                }
                return applicationMemento.getMemento();
            }
        }
    }
    saveMemento() {
        Memento.workspaceMementos.get(this.id)?.save();
        Memento.profileMementos.get(this.id)?.save();
        Memento.applicationMementos.get(this.id)?.save();
    }
    static clear(scope) {
        switch (scope) {
            case 1 /* StorageScope.WORKSPACE */:
                Memento.workspaceMementos.clear();
                break;
            case 0 /* StorageScope.PROFILE */:
                Memento.profileMementos.clear();
                break;
            case -1 /* StorageScope.APPLICATION */:
                Memento.applicationMementos.clear();
                break;
        }
    }
}
class ScopedMemento {
    id;
    scope;
    target;
    storageService;
    mementoObj;
    constructor(id, scope, target, storageService) {
        this.id = id;
        this.scope = scope;
        this.target = target;
        this.storageService = storageService;
        this.mementoObj = this.load();
    }
    getMemento() {
        return this.mementoObj;
    }
    load() {
        const memento = this.storageService.get(this.id, this.scope);
        if (memento) {
            try {
                return JSON.parse(memento);
            }
            catch (error) {
                // Seeing reports from users unable to open editors
                // from memento parsing exceptions. Log the contents
                // to diagnose further
                // https://github.com/microsoft/vscode/issues/102251
                onUnexpectedError(`[memento]: failed to parse contents: ${error} (id: ${this.id}, scope: ${this.scope}, contents: ${memento})`);
            }
        }
        return {};
    }
    save() {
        if (!isEmptyObject(this.mementoObj)) {
            this.storageService.store(this.id, JSON.stringify(this.mementoObj), this.scope, this.target);
        }
        else {
            this.storageService.remove(this.id, this.scope);
        }
    }
}
