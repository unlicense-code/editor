/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AbstractTree } from 'vs/base/browser/ui/tree/abstractTree';
import { IndexTreeModel } from 'vs/base/browser/ui/tree/indexTreeModel';
import { Iterable } from 'vs/base/common/iterator';
import 'vs/css!./media/tree';
export class IndexTree extends AbstractTree {
    rootElement;
    constructor(user, container, delegate, renderers, rootElement, options = {}) {
        super(user, container, delegate, renderers, options);
        this.rootElement = rootElement;
    }
    splice(location, deleteCount, toInsert = Iterable.empty()) {
        this.model.splice(location, deleteCount, toInsert);
    }
    rerender(location) {
        if (location === undefined) {
            this.view.rerender();
            return;
        }
        this.model.rerender(location);
    }
    updateElementHeight(location, height) {
        this.model.updateElementHeight(location, height);
    }
    createModel(user, view, options) {
        return new IndexTreeModel(user, view, this.rootElement, options);
    }
}
