/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { TestServiceAccessor, workbenchInstantiationService } from 'vs/workbench/test/browser/workbenchTestServices';
import { FileChangesEvent } from 'vs/platform/files/common/files';
import { ResourceWorkingCopy } from 'vs/workbench/services/workingCopy/common/resourceWorkingCopy';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { runWithFakedTimers } from 'vs/base/test/common/timeTravelScheduler';
suite('ResourceWorkingCopy', function () {
    class TestResourceWorkingCopy extends ResourceWorkingCopy {
        name = 'testName';
        typeId = 'testTypeId';
        capabilities = 0 /* WorkingCopyCapabilities.None */;
        onDidChangeDirty = Event.None;
        onDidChangeContent = Event.None;
        onDidSave = Event.None;
        isDirty() { return false; }
        async backup(token) { throw new Error('Method not implemented.'); }
        async save(options) { return false; }
        async revert(options) { }
    }
    let disposables;
    const resource = URI.file('test/resource');
    let instantiationService;
    let accessor;
    let workingCopy;
    function createWorkingCopy(uri = resource) {
        return new TestResourceWorkingCopy(uri, accessor.fileService);
    }
    setup(() => {
        disposables = new DisposableStore();
        instantiationService = workbenchInstantiationService(undefined, disposables);
        accessor = instantiationService.createInstance(TestServiceAccessor);
        workingCopy = createWorkingCopy();
    });
    teardown(() => {
        workingCopy.dispose();
        disposables.dispose();
    });
    test('orphaned tracking', async () => {
        runWithFakedTimers({}, async () => {
            assert.strictEqual(workingCopy.isOrphaned(), false);
            let onDidChangeOrphanedPromise = Event.toPromise(workingCopy.onDidChangeOrphaned);
            accessor.fileService.notExistsSet.set(resource, true);
            accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
            await onDidChangeOrphanedPromise;
            assert.strictEqual(workingCopy.isOrphaned(), true);
            onDidChangeOrphanedPromise = Event.toPromise(workingCopy.onDidChangeOrphaned);
            accessor.fileService.notExistsSet.delete(resource);
            accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: 1 /* FileChangeType.ADDED */ }], false));
            await onDidChangeOrphanedPromise;
            assert.strictEqual(workingCopy.isOrphaned(), false);
        });
    });
    test('dispose, isDisposed', async () => {
        assert.strictEqual(workingCopy.isDisposed(), false);
        let disposedEvent = false;
        workingCopy.onWillDispose(() => {
            disposedEvent = true;
        });
        workingCopy.dispose();
        assert.strictEqual(workingCopy.isDisposed(), true);
        assert.strictEqual(disposedEvent, true);
    });
});
