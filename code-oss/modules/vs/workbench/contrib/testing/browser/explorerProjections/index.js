/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Iterable } from 'vs/base/common/iterator';
import { InternalTestItem } from 'vs/workbench/contrib/testing/common/testTypes';
let idCounter = 0;
const getId = () => String(idCounter++);
export class TestItemTreeElement {
    test;
    parent;
    /**
     * @inheritdoc
     */
    children = new Set();
    /**
     * @inheritdoc
     */
    treeId = getId();
    /**
     * @inheritdoc
     */
    depth = this.parent ? this.parent.depth + 1 : 0;
    get tests() {
        return Iterable.single(this.test);
    }
    get description() {
        return this.test.item.description;
    }
    get sortText() {
        return this.test.item.sortText;
    }
    /**
     * Whether the node's test result is 'retired' -- from an outdated test run.
     */
    retired = false;
    /**
     * @inheritdoc
     */
    state = 0 /* TestResultState.Unset */;
    /**
     * Own, non-computed state.
     */
    ownState = 0 /* TestResultState.Unset */;
    /**
     * Own, non-computed duration.
     */
    ownDuration;
    /**
     * Time it took this test/item to run.
     */
    duration;
    /**
     * @inheritdoc
     */
    get label() {
        return this.test.item.label;
    }
    constructor(test, parent = null) {
        this.test = test;
        this.parent = parent;
    }
    toJSON() {
        if (this.depth === 0) {
            return { controllerId: this.test.controllerId };
        }
        const context = {
            $mid: 14 /* MarshalledId.TestItemContext */,
            tests: [InternalTestItem.serialize(this.test)],
        };
        for (let p = this.parent; p && p.depth > 0; p = p.parent) {
            context.tests.unshift(InternalTestItem.serialize(p.test));
        }
        return context;
    }
}
export class TestTreeErrorMessage {
    message;
    parent;
    treeId = getId();
    children = new Set();
    get description() {
        return typeof this.message === 'string' ? this.message : this.message.value;
    }
    constructor(message, parent) {
        this.message = message;
        this.parent = parent;
    }
}
