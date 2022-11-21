/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import * as nls from 'vs/nls';
import { Memento } from 'vs/workbench/common/memento';
import { CustomEditorInfo } from 'vs/workbench/contrib/customEditor/common/customEditor';
import { customEditorsExtensionPoint } from 'vs/workbench/contrib/customEditor/common/extensionPoint';
import { RegisteredEditorPriority } from 'vs/workbench/services/editor/common/editorResolverService';
export class ContributedCustomEditors extends Disposable {
    static CUSTOM_EDITORS_STORAGE_ID = 'customEditors';
    static CUSTOM_EDITORS_ENTRY_ID = 'editors';
    _editors = new Map();
    _memento;
    constructor(storageService) {
        super();
        this._memento = new Memento(ContributedCustomEditors.CUSTOM_EDITORS_STORAGE_ID, storageService);
        const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        for (const info of (mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] || [])) {
            this.add(new CustomEditorInfo(info));
        }
        customEditorsExtensionPoint.setHandler(extensions => {
            this.update(extensions);
        });
    }
    _onChange = this._register(new Emitter());
    onChange = this._onChange.event;
    update(extensions) {
        this._editors.clear();
        for (const extension of extensions) {
            for (const webviewEditorContribution of extension.value) {
                this.add(new CustomEditorInfo({
                    id: webviewEditorContribution.viewType,
                    displayName: webviewEditorContribution.displayName,
                    providerDisplayName: extension.description.isBuiltin ? nls.localize('builtinProviderDisplayName', "Built-in") : extension.description.displayName || extension.description.identifier.value,
                    selector: webviewEditorContribution.selector || [],
                    priority: getPriorityFromContribution(webviewEditorContribution, extension.description),
                }));
            }
        }
        const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._editors.values());
        this._memento.saveMemento();
        this._onChange.fire();
    }
    [Symbol.iterator]() {
        return this._editors.values();
    }
    get(viewType) {
        return this._editors.get(viewType);
    }
    getContributedEditors(resource) {
        return Array.from(this._editors.values())
            .filter(customEditor => customEditor.matches(resource));
    }
    add(info) {
        if (this._editors.has(info.id)) {
            console.error(`Custom editor with id '${info.id}' already registered`);
            return;
        }
        this._editors.set(info.id, info);
    }
}
function getPriorityFromContribution(contribution, extension) {
    switch (contribution.priority) {
        case RegisteredEditorPriority.default:
        case RegisteredEditorPriority.option:
            return contribution.priority;
        case RegisteredEditorPriority.builtin:
            // Builtin is only valid for builtin extensions
            return extension.isBuiltin ? RegisteredEditorPriority.builtin : RegisteredEditorPriority.default;
        default:
            return RegisteredEditorPriority.default;
    }
}
