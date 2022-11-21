/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Emitter, Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { InMemoryStorageDatabase, Storage } from 'vs/base/parts/storage/common/storage';
import { AbstractUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { InMemoryStorageService, loadKeyTargets, TARGET_KEY } from 'vs/platform/storage/common/storage';
import { toUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { runWithFakedTimers } from 'vs/base/test/common/timeTravelScheduler';
class TestStorageDatabase extends InMemoryStorageDatabase {
    _onDidChangeItemsExternal = new Emitter();
    onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
    async updateItems(request) {
        await super.updateItems(request);
        if (request.insert || request.delete) {
            this._onDidChangeItemsExternal.fire({ changed: request.insert, deleted: request.delete });
        }
    }
}
export class TestUserDataProfileStorageService extends AbstractUserDataProfileStorageService {
    onDidChange = Event.None;
    databases = new Map();
    async createStorageDatabase(profile) {
        let database = this.databases.get(profile.id);
        if (!database) {
            this.databases.set(profile.id, database = new TestStorageDatabase());
        }
        return database;
    }
    async closeAndDispose() { }
}
suite('ProfileStorageService', () => {
    const disposables = new DisposableStore();
    const profile = toUserDataProfile('test', 'test', URI.file('foo'));
    let testObject;
    let storage;
    setup(async () => {
        testObject = disposables.add(new TestUserDataProfileStorageService(new InMemoryStorageService()));
        storage = new Storage(await testObject.createStorageDatabase(profile));
        await storage.init();
    });
    teardown(() => disposables.clear());
    test('read empty storage', () => runWithFakedTimers({ useFakeTimers: true }, async () => {
        const actual = await testObject.readStorageData(profile);
        assert.strictEqual(actual.size, 0);
    }));
    test('read storage with data', () => runWithFakedTimers({ useFakeTimers: true }, async () => {
        storage.set('foo', 'bar');
        storage.set(TARGET_KEY, JSON.stringify({ foo: 0 /* StorageTarget.USER */ }));
        await storage.flush();
        const actual = await testObject.readStorageData(profile);
        assert.strictEqual(actual.size, 1);
        assert.deepStrictEqual(actual.get('foo'), { 'value': 'bar', 'target': 0 /* StorageTarget.USER */ });
    }));
    test('write in empty storage', () => runWithFakedTimers({ useFakeTimers: true }, async () => {
        const data = new Map();
        data.set('foo', 'bar');
        await testObject.updateStorageData(profile, data, 0 /* StorageTarget.USER */);
        assert.strictEqual(storage.items.size, 2);
        assert.deepStrictEqual(loadKeyTargets(storage), { foo: 0 /* StorageTarget.USER */ });
        assert.strictEqual(storage.get('foo'), 'bar');
    }));
    test('write in storage with data', () => runWithFakedTimers({ useFakeTimers: true }, async () => {
        storage.set('foo', 'bar');
        storage.set(TARGET_KEY, JSON.stringify({ foo: 0 /* StorageTarget.USER */ }));
        await storage.flush();
        const data = new Map();
        data.set('abc', 'xyz');
        await testObject.updateStorageData(profile, data, 1 /* StorageTarget.MACHINE */);
        assert.strictEqual(storage.items.size, 3);
        assert.deepStrictEqual(loadKeyTargets(storage), { foo: 0 /* StorageTarget.USER */, abc: 1 /* StorageTarget.MACHINE */ });
        assert.strictEqual(storage.get('foo'), 'bar');
        assert.strictEqual(storage.get('abc'), 'xyz');
    }));
    test('write in storage with data (insert, update, remove)', () => runWithFakedTimers({ useFakeTimers: true }, async () => {
        storage.set('foo', 'bar');
        storage.set('abc', 'xyz');
        storage.set(TARGET_KEY, JSON.stringify({ foo: 0 /* StorageTarget.USER */, abc: 1 /* StorageTarget.MACHINE */ }));
        await storage.flush();
        const data = new Map();
        data.set('foo', undefined);
        data.set('abc', 'def');
        data.set('var', 'const');
        await testObject.updateStorageData(profile, data, 0 /* StorageTarget.USER */);
        assert.strictEqual(storage.items.size, 3);
        assert.deepStrictEqual(loadKeyTargets(storage), { abc: 0 /* StorageTarget.USER */, var: 0 /* StorageTarget.USER */ });
        assert.strictEqual(storage.get('abc'), 'def');
        assert.strictEqual(storage.get('var'), 'const');
    }));
});
