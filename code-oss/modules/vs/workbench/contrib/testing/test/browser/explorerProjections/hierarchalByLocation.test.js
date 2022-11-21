/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { AbstractTreeViewState } from 'vs/base/browser/ui/tree/abstractTree';
import { Emitter } from 'vs/base/common/event';
import { HierarchicalByLocationProjection } from 'vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByLocation';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { TestTreeTestHarness } from 'vs/workbench/contrib/testing/test/browser/testObjectTree';
import { TestTestItem } from 'vs/workbench/contrib/testing/test/common/testStubs';
class TestHierarchicalByLocationProjection extends HierarchicalByLocationProjection {
}
suite('Workbench - Testing Explorer Hierarchal by Location Projection', () => {
    let harness;
    let onTestChanged;
    let resultsService;
    setup(() => {
        onTestChanged = new Emitter();
        resultsService = {
            onResultsChanged: () => undefined,
            onTestChanged: onTestChanged.event,
            getStateById: () => ({ state: { state: 0 }, computedState: 0 }),
        };
        harness = new TestTreeTestHarness(l => new TestHierarchicalByLocationProjection(AbstractTreeViewState.empty(), l, resultsService));
    });
    teardown(() => {
        harness.dispose();
    });
    test('renders initial tree', async () => {
        harness.flush();
        assert.deepStrictEqual(harness.tree.getRendered(), [
            { e: 'a' }, { e: 'b' }
        ]);
    });
    test('expands children', async () => {
        harness.flush();
        harness.tree.expand(harness.projection.getElementByTestId(new TestId(['ctrlId', 'id-a']).toString()));
        assert.deepStrictEqual(harness.flush(), [
            { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
        ]);
    });
    test('updates render if second test provider appears', async () => {
        harness.flush();
        harness.pushDiff({
            op: 0 /* TestDiffOpType.Add */,
            item: { controllerId: 'ctrl2', expand: 3 /* TestItemExpandState.Expanded */, item: new TestTestItem(new TestId(['ctrlId2']), 'c').toTestItem() },
        }, {
            op: 0 /* TestDiffOpType.Add */,
            item: { controllerId: 'ctrl2', expand: 0 /* TestItemExpandState.NotExpandable */, item: new TestTestItem(new TestId(['ctrlId2', 'id-c']), 'ca').toTestItem() },
        });
        assert.deepStrictEqual(harness.flush(), [
            { e: 'c', children: [{ e: 'ca' }] },
            { e: 'root', children: [{ e: 'a' }, { e: 'b' }] }
        ]);
    });
    test('updates nodes if they add children', async () => {
        harness.flush();
        harness.tree.expand(harness.projection.getElementByTestId(new TestId(['ctrlId', 'id-a']).toString()));
        assert.deepStrictEqual(harness.flush(), [
            { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] },
            { e: 'b' }
        ]);
        harness.c.root.children.get('id-a').children.add(new TestTestItem(new TestId(['ctrlId', 'id-a', 'id-ac']), 'ac'));
        assert.deepStrictEqual(harness.flush(), [
            { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }, { e: 'ac' }] },
            { e: 'b' }
        ]);
    });
    test('updates nodes if they remove children', async () => {
        harness.flush();
        harness.tree.expand(harness.projection.getElementByTestId(new TestId(['ctrlId', 'id-a']).toString()));
        assert.deepStrictEqual(harness.flush(), [
            { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] },
            { e: 'b' }
        ]);
        harness.c.root.children.get('id-a').children.delete('id-ab');
        assert.deepStrictEqual(harness.flush(), [
            { e: 'a', children: [{ e: 'aa' }] },
            { e: 'b' }
        ]);
    });
    test('applies state changes', async () => {
        harness.flush();
        resultsService.getStateById = () => [undefined, resultInState(4 /* TestResultState.Failed */)];
        const resultInState = (state) => ({
            item: {
                extId: new TestId(['ctrlId', 'id-a']).toString(),
                busy: false,
                description: null,
                error: null,
                label: 'a',
                range: null,
                sortText: null,
                tags: [],
                uri: undefined,
            },
            tasks: [],
            ownComputedState: state,
            computedState: state,
            expand: 0,
            controllerId: 'ctrl',
        });
        // Applies the change:
        onTestChanged.fire({
            reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
            result: null,
            previousState: 0 /* TestResultState.Unset */,
            item: resultInState(1 /* TestResultState.Queued */),
            previousOwnDuration: undefined,
        });
        harness.projection.applyTo(harness.tree);
        assert.deepStrictEqual(harness.tree.getRendered('state'), [
            { e: 'a', data: String(1 /* TestResultState.Queued */) },
            { e: 'b', data: String(0 /* TestResultState.Unset */) }
        ]);
        // Falls back if moved into unset state:
        onTestChanged.fire({
            reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
            result: null,
            previousState: 1 /* TestResultState.Queued */,
            item: resultInState(0 /* TestResultState.Unset */),
            previousOwnDuration: undefined,
        });
        harness.projection.applyTo(harness.tree);
        assert.deepStrictEqual(harness.tree.getRendered('state'), [
            { e: 'a', data: String(4 /* TestResultState.Failed */) },
            { e: 'b', data: String(0 /* TestResultState.Unset */) }
        ]);
    });
});
