/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TestItemTreeElement, TestTreeErrorMessage } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { applyTestItemUpdate } from 'vs/workbench/contrib/testing/common/testTypes';
/**
 * Test tree element element that groups be hierarchy.
 */
export class ByLocationTestItemElement extends TestItemTreeElement {
    addedOrRemoved;
    errorChild;
    constructor(test, parent, addedOrRemoved) {
        super({ ...test, item: { ...test.item } }, parent);
        this.addedOrRemoved = addedOrRemoved;
        this.updateErrorVisiblity();
    }
    update(patch) {
        applyTestItemUpdate(this.test, patch);
        this.updateErrorVisiblity();
    }
    updateErrorVisiblity() {
        if (this.errorChild && !this.test.item.error) {
            this.addedOrRemoved(this.errorChild);
            this.children.delete(this.errorChild);
            this.errorChild = undefined;
        }
        else if (this.test.item.error && !this.errorChild) {
            this.errorChild = new TestTreeErrorMessage(this.test.item.error, this);
            this.children.add(this.errorChild);
            this.addedOrRemoved(this.errorChild);
        }
    }
}
