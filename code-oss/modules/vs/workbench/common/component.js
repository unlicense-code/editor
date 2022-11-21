/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Memento } from 'vs/workbench/common/memento';
import { Themable } from 'vs/platform/theme/common/themeService';
export class Component extends Themable {
    id;
    memento;
    constructor(id, themeService, storageService) {
        super(themeService);
        this.id = id;
        this.id = id;
        this.memento = new Memento(this.id, storageService);
        this._register(storageService.onWillSaveState(() => {
            // Ask the component to persist state into the memento
            this.saveState();
            // Then save the memento into storage
            this.memento.saveMemento();
        }));
    }
    getId() {
        return this.id;
    }
    getMemento(scope, target) {
        return this.memento.getMemento(scope, target);
    }
    saveState() {
        // Subclasses to implement for storing state
    }
}
