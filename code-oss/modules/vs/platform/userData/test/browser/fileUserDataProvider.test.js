/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { FileService } from 'vs/platform/files/common/fileService';
import { NullLogService } from 'vs/platform/log/common/log';
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { FileUserDataProvider } from 'vs/platform/userData/common/fileUserDataProvider';
import { dirname, isEqual, joinPath } from 'vs/base/common/resources';
import { VSBuffer } from 'vs/base/common/buffer';
import { DisposableStore, Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { InMemoryFileSystemProvider } from 'vs/platform/files/common/inMemoryFilesystemProvider';
import { AbstractNativeEnvironmentService } from 'vs/platform/environment/common/environmentService';
import product from 'vs/platform/product/common/product';
import { UserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService';
const ROOT = URI.file('tests').with({ scheme: 'vscode-tests' });
class TestEnvironmentService extends AbstractNativeEnvironmentService {
    _appSettingsHome;
    constructor(_appSettingsHome) {
        super(Object.create(null), Object.create(null), { _serviceBrand: undefined, ...product });
        this._appSettingsHome = _appSettingsHome;
    }
    get userRoamingDataHome() { return this._appSettingsHome.with({ scheme: Schemas.vscodeUserData }); }
}
suite('FileUserDataProvider', () => {
    let testObject;
    let userDataHomeOnDisk;
    let backupWorkspaceHomeOnDisk;
    let environmentService;
    let userDataProfilesService;
    const disposables = new DisposableStore();
    let fileUserDataProvider;
    setup(async () => {
        const logService = new NullLogService();
        testObject = disposables.add(new FileService(logService));
        const fileSystemProvider = disposables.add(new InMemoryFileSystemProvider());
        disposables.add(testObject.registerProvider(ROOT.scheme, fileSystemProvider));
        userDataHomeOnDisk = joinPath(ROOT, 'User');
        const backupHome = joinPath(ROOT, 'Backups');
        backupWorkspaceHomeOnDisk = joinPath(backupHome, 'workspaceId');
        await testObject.createFolder(userDataHomeOnDisk);
        await testObject.createFolder(backupWorkspaceHomeOnDisk);
        environmentService = new TestEnvironmentService(userDataHomeOnDisk);
        userDataProfilesService = new UserDataProfilesService(environmentService, testObject, new UriIdentityService(testObject), logService);
        fileUserDataProvider = new FileUserDataProvider(ROOT.scheme, fileSystemProvider, Schemas.vscodeUserData, logService);
        disposables.add(fileUserDataProvider);
        disposables.add(testObject.registerProvider(Schemas.vscodeUserData, fileUserDataProvider));
    });
    teardown(() => disposables.clear());
    test('exists return false when file does not exist', async () => {
        const exists = await testObject.exists(userDataProfilesService.defaultProfile.settingsResource);
        assert.strictEqual(exists, false);
    });
    test('read file throws error if not exist', async () => {
        try {
            await testObject.readFile(userDataProfilesService.defaultProfile.settingsResource);
            assert.fail('Should fail since file does not exist');
        }
        catch (e) { }
    });
    test('read existing file', async () => {
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'settings.json'), VSBuffer.fromString('{}'));
        const result = await testObject.readFile(userDataProfilesService.defaultProfile.settingsResource);
        assert.strictEqual(result.value.toString(), '{}');
    });
    test('create file', async () => {
        const resource = userDataProfilesService.defaultProfile.settingsResource;
        const actual1 = await testObject.createFile(resource, VSBuffer.fromString('{}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, 'settings.json'));
        assert.strictEqual(actual2.value.toString(), '{}');
    });
    test('write file creates the file if not exist', async () => {
        const resource = userDataProfilesService.defaultProfile.settingsResource;
        const actual1 = await testObject.writeFile(resource, VSBuffer.fromString('{}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, 'settings.json'));
        assert.strictEqual(actual2.value.toString(), '{}');
    });
    test('write to existing file', async () => {
        const resource = userDataProfilesService.defaultProfile.settingsResource;
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'settings.json'), VSBuffer.fromString('{}'));
        const actual1 = await testObject.writeFile(resource, VSBuffer.fromString('{a:1}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, 'settings.json'));
        assert.strictEqual(actual2.value.toString(), '{a:1}');
    });
    test('delete file', async () => {
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'settings.json'), VSBuffer.fromString(''));
        await testObject.del(userDataProfilesService.defaultProfile.settingsResource);
        const result = await testObject.exists(joinPath(userDataHomeOnDisk, 'settings.json'));
        assert.strictEqual(false, result);
    });
    test('resolve file', async () => {
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'settings.json'), VSBuffer.fromString(''));
        const result = await testObject.resolve(userDataProfilesService.defaultProfile.settingsResource);
        assert.ok(!result.isDirectory);
        assert.ok(result.children === undefined);
    });
    test('exists return false for folder that does not exist', async () => {
        const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
        assert.strictEqual(exists, false);
    });
    test('exists return true for folder that exists', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
        assert.strictEqual(exists, true);
    });
    test('read file throws error for folder', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        try {
            await testObject.readFile(userDataProfilesService.defaultProfile.snippetsHome);
            assert.fail('Should fail since read file is not supported for folders');
        }
        catch (e) { }
    });
    test('read file under folder', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'), VSBuffer.fromString('{}'));
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
        const actual = await testObject.readFile(resource);
        assert.strictEqual(actual.resource.toString(), resource.toString());
        assert.strictEqual(actual.value.toString(), '{}');
    });
    test('read file under sub folder', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets', 'java'));
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'snippets', 'java', 'settings.json'), VSBuffer.fromString('{}'));
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'java/settings.json');
        const actual = await testObject.readFile(resource);
        assert.strictEqual(actual.resource.toString(), resource.toString());
        assert.strictEqual(actual.value.toString(), '{}');
    });
    test('create file under folder that exists', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
        const actual1 = await testObject.createFile(resource, VSBuffer.fromString('{}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'));
        assert.strictEqual(actual2.value.toString(), '{}');
    });
    test('create file under folder that does not exist', async () => {
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
        const actual1 = await testObject.createFile(resource, VSBuffer.fromString('{}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'));
        assert.strictEqual(actual2.value.toString(), '{}');
    });
    test('write to not existing file under container that exists', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
        const actual1 = await testObject.writeFile(resource, VSBuffer.fromString('{}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'));
        assert.strictEqual(actual.value.toString(), '{}');
    });
    test('write to not existing file under container that does not exists', async () => {
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
        const actual1 = await testObject.writeFile(resource, VSBuffer.fromString('{}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'));
        assert.strictEqual(actual.value.toString(), '{}');
    });
    test('write to existing file under container', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'), VSBuffer.fromString('{}'));
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
        const actual1 = await testObject.writeFile(resource, VSBuffer.fromString('{a:1}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'));
        assert.strictEqual(actual.value.toString(), '{a:1}');
    });
    test('write file under sub container', async () => {
        const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'java/settings.json');
        const actual1 = await testObject.writeFile(resource, VSBuffer.fromString('{}'));
        assert.strictEqual(actual1.resource.toString(), resource.toString());
        const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, 'snippets', 'java', 'settings.json'));
        assert.strictEqual(actual.value.toString(), '{}');
    });
    test('delete throws error for folder that does not exist', async () => {
        try {
            await testObject.del(userDataProfilesService.defaultProfile.snippetsHome);
            assert.fail('Should fail the folder does not exist');
        }
        catch (e) { }
    });
    test('delete not existing file under container that exists', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        try {
            await testObject.del(joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
            assert.fail('Should fail since file does not exist');
        }
        catch (e) { }
    });
    test('delete not existing file under container that does not exists', async () => {
        try {
            await testObject.del(joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
            assert.fail('Should fail since file does not exist');
        }
        catch (e) { }
    });
    test('delete existing file under folder', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'), VSBuffer.fromString('{}'));
        await testObject.del(joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
        const exists = await testObject.exists(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'));
        assert.strictEqual(exists, false);
    });
    test('resolve folder', async () => {
        await testObject.createFolder(joinPath(userDataHomeOnDisk, 'snippets'));
        await testObject.writeFile(joinPath(userDataHomeOnDisk, 'snippets', 'settings.json'), VSBuffer.fromString('{}'));
        const result = await testObject.resolve(userDataProfilesService.defaultProfile.snippetsHome);
        assert.ok(result.isDirectory);
        assert.ok(result.children !== undefined);
        assert.strictEqual(result.children.length, 1);
        assert.strictEqual(result.children[0].resource.toString(), joinPath(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json').toString());
    });
    test('read backup file', async () => {
        await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk, 'backup.json'), VSBuffer.fromString('{}'));
        const result = await testObject.readFile(joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`));
        assert.strictEqual(result.value.toString(), '{}');
    });
    test('create backup file', async () => {
        await testObject.createFile(joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), VSBuffer.fromString('{}'));
        const result = await testObject.readFile(joinPath(backupWorkspaceHomeOnDisk, 'backup.json'));
        assert.strictEqual(result.value.toString(), '{}');
    });
    test('write backup file', async () => {
        await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk, 'backup.json'), VSBuffer.fromString('{}'));
        await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), VSBuffer.fromString('{a:1}'));
        const result = await testObject.readFile(joinPath(backupWorkspaceHomeOnDisk, 'backup.json'));
        assert.strictEqual(result.value.toString(), '{a:1}');
    });
    test('resolve backups folder', async () => {
        await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk, 'backup.json'), VSBuffer.fromString('{}'));
        const result = await testObject.resolve(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }));
        assert.ok(result.isDirectory);
        assert.ok(result.children !== undefined);
        assert.strictEqual(result.children.length, 1);
        assert.strictEqual(result.children[0].resource.toString(), joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`).toString());
    });
});
class TestFileSystemProvider {
    onDidChangeFile;
    constructor(onDidChangeFile) {
        this.onDidChangeFile = onDidChangeFile;
    }
    capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */;
    onDidChangeCapabilities = Event.None;
    watch() { return Disposable.None; }
    stat() { throw new Error('Not Supported'); }
    mkdir(resource) { throw new Error('Not Supported'); }
    rename() { throw new Error('Not Supported'); }
    readFile(resource) { throw new Error('Not Supported'); }
    readdir(resource) { throw new Error('Not Supported'); }
    writeFile() { throw new Error('Not Supported'); }
    delete() { throw new Error('Not Supported'); }
}
suite('FileUserDataProvider - Watching', () => {
    let testObject;
    const disposables = new DisposableStore();
    const rootFileResource = joinPath(ROOT, 'User');
    const rootUserDataResource = rootFileResource.with({ scheme: Schemas.vscodeUserData });
    const fileEventEmitter = new Emitter();
    disposables.add(fileEventEmitter);
    setup(() => {
        testObject = disposables.add(new FileUserDataProvider(rootFileResource.scheme, new TestFileSystemProvider(fileEventEmitter.event), Schemas.vscodeUserData, new NullLogService()));
    });
    teardown(() => disposables.clear());
    test('file added change event', done => {
        disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
        const expected = joinPath(rootUserDataResource, 'settings.json');
        const target = joinPath(rootFileResource, 'settings.json');
        disposables.add(testObject.onDidChangeFile(e => {
            if (isEqual(e[0].resource, expected) && e[0].type === 1 /* FileChangeType.ADDED */) {
                done();
            }
        }));
        fileEventEmitter.fire([{
                resource: target,
                type: 1 /* FileChangeType.ADDED */
            }]);
    });
    test('file updated change event', done => {
        disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
        const expected = joinPath(rootUserDataResource, 'settings.json');
        const target = joinPath(rootFileResource, 'settings.json');
        disposables.add(testObject.onDidChangeFile(e => {
            if (isEqual(e[0].resource, expected) && e[0].type === 0 /* FileChangeType.UPDATED */) {
                done();
            }
        }));
        fileEventEmitter.fire([{
                resource: target,
                type: 0 /* FileChangeType.UPDATED */
            }]);
    });
    test('file deleted change event', done => {
        disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
        const expected = joinPath(rootUserDataResource, 'settings.json');
        const target = joinPath(rootFileResource, 'settings.json');
        disposables.add(testObject.onDidChangeFile(e => {
            if (isEqual(e[0].resource, expected) && e[0].type === 2 /* FileChangeType.DELETED */) {
                done();
            }
        }));
        fileEventEmitter.fire([{
                resource: target,
                type: 2 /* FileChangeType.DELETED */
            }]);
    });
    test('file under folder created change event', done => {
        disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
        const expected = joinPath(rootUserDataResource, 'snippets', 'settings.json');
        const target = joinPath(rootFileResource, 'snippets', 'settings.json');
        disposables.add(testObject.onDidChangeFile(e => {
            if (isEqual(e[0].resource, expected) && e[0].type === 1 /* FileChangeType.ADDED */) {
                done();
            }
        }));
        fileEventEmitter.fire([{
                resource: target,
                type: 1 /* FileChangeType.ADDED */
            }]);
    });
    test('file under folder updated change event', done => {
        disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
        const expected = joinPath(rootUserDataResource, 'snippets', 'settings.json');
        const target = joinPath(rootFileResource, 'snippets', 'settings.json');
        disposables.add(testObject.onDidChangeFile(e => {
            if (isEqual(e[0].resource, expected) && e[0].type === 0 /* FileChangeType.UPDATED */) {
                done();
            }
        }));
        fileEventEmitter.fire([{
                resource: target,
                type: 0 /* FileChangeType.UPDATED */
            }]);
    });
    test('file under folder deleted change event', done => {
        disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
        const expected = joinPath(rootUserDataResource, 'snippets', 'settings.json');
        const target = joinPath(rootFileResource, 'snippets', 'settings.json');
        disposables.add(testObject.onDidChangeFile(e => {
            if (isEqual(e[0].resource, expected) && e[0].type === 2 /* FileChangeType.DELETED */) {
                done();
            }
        }));
        fileEventEmitter.fire([{
                resource: target,
                type: 2 /* FileChangeType.DELETED */
            }]);
    });
    test('event is not triggered if not watched', async () => {
        const target = joinPath(rootFileResource, 'settings.json');
        let triggered = false;
        testObject.onDidChangeFile(() => triggered = true);
        fileEventEmitter.fire([{
                resource: target,
                type: 2 /* FileChangeType.DELETED */
            }]);
        if (triggered) {
            assert.fail('event should not be triggered');
        }
    });
    test('event is not triggered if not watched 2', async () => {
        disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
        const target = joinPath(dirname(rootFileResource), 'settings.json');
        let triggered = false;
        testObject.onDidChangeFile(() => triggered = true);
        fileEventEmitter.fire([{
                resource: target,
                type: 2 /* FileChangeType.DELETED */
            }]);
        if (triggered) {
            assert.fail('event should not be triggered');
        }
    });
});
