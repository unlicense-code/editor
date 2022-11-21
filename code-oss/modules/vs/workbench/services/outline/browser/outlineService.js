/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { toDisposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IOutlineService } from 'vs/workbench/services/outline/browser/outline';
import { Emitter } from 'vs/base/common/event';
class OutlineService {
    _factories = new LinkedList();
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    canCreateOutline(pane) {
        for (const factory of this._factories) {
            if (factory.matches(pane)) {
                return true;
            }
        }
        return false;
    }
    async createOutline(pane, target, token) {
        for (const factory of this._factories) {
            if (factory.matches(pane)) {
                return await factory.createOutline(pane, target, token);
            }
        }
        return undefined;
    }
    registerOutlineCreator(creator) {
        const rm = this._factories.push(creator);
        this._onDidChange.fire();
        return toDisposable(() => {
            rm();
            this._onDidChange.fire();
        });
    }
}
registerSingleton(IOutlineService, OutlineService, 1 /* InstantiationType.Delayed */);
