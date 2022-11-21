/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as assert from 'assert';
import { isMacintosh, isWindows } from 'vs/base/common/platform';
import { tmpdir } from 'os';
import { join } from 'vs/base/common/path';
import { Promises } from 'vs/base/node/pfs';
import { URI } from 'vs/base/common/uri';
import { flakySuite, getRandomTestPath } from 'vs/base/test/node/testUtils';
import { hash } from 'vs/base/common/hash';
import { NativeWorkingCopyBackupTracker } from 'vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupTracker';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { EditorService } from 'vs/workbench/services/editor/browser/editorService';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { NodeTestWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/test/electron-browser/workingCopyBackupService.test';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { toResource } from 'vs/base/test/common/utils';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { ILogService } from 'vs/platform/log/common/log';
import { HotExitConfiguration } from 'vs/platform/files/common/files';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { workbenchInstantiationService, TestServiceAccessor } from 'vs/workbench/test/electron-browser/workbenchTestServices';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createEditorPart, registerTestFileEditor, TestBeforeShutdownEvent, TestFilesConfigurationService } from 'vs/workbench/test/browser/workbenchTestServices';
import { MockContextKeyService } from 'vs/platform/keybinding/test/common/mockKeybindingService';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { TestWorkspace, Workspace } from 'vs/platform/workspace/test/common/testWorkspace';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { TestContextService, TestWorkingCopy } from 'vs/workbench/test/common/workbenchTestServices';
import { Event, Emitter } from 'vs/base/common/event';
flakySuite('WorkingCopyBackupTracker (native)', function () {
    let TestWorkingCopyBackupTracker = class TestWorkingCopyBackupTracker extends NativeWorkingCopyBackupTracker {
        constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, editorService, environmentService, progressService, workingCopyEditorService, editorGroupService) {
            super(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService, editorGroupService);
        }
        getBackupScheduleDelay() {
            return 10; // Reduce timeout for tests
        }
        waitForReady() {
            return super.whenReady;
        }
        get pendingBackupOperationCount() { return this.pendingBackupOperations.size; }
        dispose() {
            super.dispose();
            for (const [_, disposable] of this.pendingBackupOperations) {
                disposable.dispose();
            }
        }
        _onDidResume = this._register(new Emitter());
        onDidResume = this._onDidResume.event;
        _onDidSuspend = this._register(new Emitter());
        onDidSuspend = this._onDidSuspend.event;
        suspendBackupOperations() {
            const { resume } = super.suspendBackupOperations();
            this._onDidSuspend.fire();
            return {
                resume: () => {
                    resume();
                    this._onDidResume.fire();
                }
            };
        }
    };
    TestWorkingCopyBackupTracker = __decorate([
        __param(0, IWorkingCopyBackupService),
        __param(1, IFilesConfigurationService),
        __param(2, IWorkingCopyService),
        __param(3, ILifecycleService),
        __param(4, IFileDialogService),
        __param(5, IDialogService),
        __param(6, IWorkspaceContextService),
        __param(7, INativeHostService),
        __param(8, ILogService),
        __param(9, IEditorService),
        __param(10, IEnvironmentService),
        __param(11, IProgressService),
        __param(12, IWorkingCopyEditorService),
        __param(13, IEditorGroupsService)
    ], TestWorkingCopyBackupTracker);
    let testDir;
    let backupHome;
    let workspaceBackupPath;
    let accessor;
    let disposables;
    setup(async () => {
        disposables = new DisposableStore();
        testDir = getRandomTestPath(tmpdir(), 'vsctests', 'backuprestorer');
        backupHome = join(testDir, 'Backups');
        const workspacesJsonPath = join(backupHome, 'workspaces.json');
        const workspaceResource = URI.file(isWindows ? 'c:\\workspace' : '/workspace');
        workspaceBackupPath = join(backupHome, hash(workspaceResource.fsPath).toString(16));
        const instantiationService = workbenchInstantiationService(disposables);
        accessor = instantiationService.createInstance(TestServiceAccessor);
        disposables.add(accessor.textFileService.files);
        disposables.add(registerTestFileEditor());
        await Promises.mkdir(backupHome, { recursive: true });
        await Promises.mkdir(workspaceBackupPath, { recursive: true });
        return Promises.writeFile(workspacesJsonPath, '');
    });
    teardown(async () => {
        disposables.dispose();
        return Promises.rm(testDir);
    });
    async function createTracker(autoSaveEnabled = false) {
        const workingCopyBackupService = new NodeTestWorkingCopyBackupService(testDir, workspaceBackupPath);
        const instantiationService = workbenchInstantiationService(disposables);
        instantiationService.stub(IWorkingCopyBackupService, workingCopyBackupService);
        const configurationService = new TestConfigurationService();
        if (autoSaveEnabled) {
            configurationService.setUserConfiguration('files', { autoSave: 'afterDelay', autoSaveDelay: 1 });
        }
        instantiationService.stub(IConfigurationService, configurationService);
        instantiationService.stub(IFilesConfigurationService, new TestFilesConfigurationService(instantiationService.createInstance(MockContextKeyService), configurationService, new TestContextService(TestWorkspace)));
        const part = await createEditorPart(instantiationService, disposables);
        instantiationService.stub(IEditorGroupsService, part);
        const editorService = instantiationService.createInstance(EditorService);
        instantiationService.stub(IEditorService, editorService);
        accessor = instantiationService.createInstance(TestServiceAccessor);
        const tracker = instantiationService.createInstance(TestWorkingCopyBackupTracker);
        const cleanup = async () => {
            // File changes could also schedule some backup operations so we need to wait for them before finishing the test
            await accessor.workingCopyBackupService.waitForAllBackups();
            part.dispose();
            tracker.dispose();
        };
        return { accessor, part, tracker, instantiationService, cleanup };
    }
    test('Track backups (file, auto save off)', function () {
        return trackBackupsTest(toResource.call(this, '/path/index.txt'), false);
    });
    test('Track backups (file, auto save on)', function () {
        return trackBackupsTest(toResource.call(this, '/path/index.txt'), true);
    });
    async function trackBackupsTest(resource, autoSave) {
        const { accessor, cleanup } = await createTracker(autoSave);
        await accessor.editorService.openEditor({ resource, options: { pinned: true } });
        const fileModel = accessor.textFileService.files.get(resource);
        assert.ok(fileModel);
        fileModel.textEditorModel?.setValue('Super Good');
        await accessor.workingCopyBackupService.joinBackupResource();
        assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(fileModel), true);
        fileModel.dispose();
        await accessor.workingCopyBackupService.joinDiscardBackup();
        assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(fileModel), false);
        await cleanup();
    }
    test('onWillShutdown - no veto if no dirty files', async function () {
        const { accessor, cleanup } = await createTracker();
        const resource = toResource.call(this, '/path/index.txt');
        await accessor.editorService.openEditor({ resource, options: { pinned: true } });
        const event = new TestBeforeShutdownEvent();
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(!veto);
        await cleanup();
    });
    test('onWillShutdown - veto if user cancels (hot.exit: off)', async function () {
        const { accessor, cleanup } = await createTracker();
        const resource = toResource.call(this, '/path/index.txt');
        await accessor.editorService.openEditor({ resource, options: { pinned: true } });
        const model = accessor.textFileService.files.get(resource);
        accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
        accessor.filesConfigurationService.onFilesConfigurationChange({ files: { hotExit: 'off' } });
        await model?.resolve();
        model?.textEditorModel?.setValue('foo');
        assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
        const event = new TestBeforeShutdownEvent();
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(veto);
        await cleanup();
    });
    test('onWillShutdown - no veto if auto save is on', async function () {
        const { accessor, cleanup } = await createTracker(true /* auto save enabled */);
        const resource = toResource.call(this, '/path/index.txt');
        await accessor.editorService.openEditor({ resource, options: { pinned: true } });
        const model = accessor.textFileService.files.get(resource);
        await model?.resolve();
        model?.textEditorModel?.setValue('foo');
        assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
        const event = new TestBeforeShutdownEvent();
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(!veto);
        assert.strictEqual(accessor.workingCopyService.dirtyCount, 0);
        await cleanup();
    });
    test('onWillShutdown - no veto and backups cleaned up if user does not want to save (hot.exit: off)', async function () {
        const { accessor, cleanup } = await createTracker();
        const resource = toResource.call(this, '/path/index.txt');
        await accessor.editorService.openEditor({ resource, options: { pinned: true } });
        const model = accessor.textFileService.files.get(resource);
        accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
        accessor.filesConfigurationService.onFilesConfigurationChange({ files: { hotExit: 'off' } });
        await model?.resolve();
        model?.textEditorModel?.setValue('foo');
        assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
        const event = new TestBeforeShutdownEvent();
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(!veto);
        assert.ok(accessor.workingCopyBackupService.discardedBackups.length > 0);
        await cleanup();
    });
    test('onWillShutdown - no backups discarded when shutdown without dirty but tracker not ready', async function () {
        const { accessor, cleanup } = await createTracker();
        const event = new TestBeforeShutdownEvent();
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(!veto);
        assert.ok(!accessor.workingCopyBackupService.discardedAllBackups);
        await cleanup();
    });
    test('onWillShutdown - backups discarded when shutdown without dirty', async function () {
        const { accessor, tracker, cleanup } = await createTracker();
        await tracker.waitForReady();
        const event = new TestBeforeShutdownEvent();
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(!veto);
        assert.ok(!accessor.workingCopyBackupService.discardedAllBackups);
        await cleanup();
    });
    test('onWillShutdown - save (hot.exit: off)', async function () {
        const { accessor, cleanup } = await createTracker();
        const resource = toResource.call(this, '/path/index.txt');
        await accessor.editorService.openEditor({ resource, options: { pinned: true } });
        const model = accessor.textFileService.files.get(resource);
        accessor.fileDialogService.setConfirmResult(0 /* ConfirmResult.SAVE */);
        accessor.filesConfigurationService.onFilesConfigurationChange({ files: { hotExit: 'off' } });
        await model?.resolve();
        model?.textEditorModel?.setValue('foo');
        assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
        const event = new TestBeforeShutdownEvent();
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(!veto);
        assert.ok(!model?.isDirty());
        await cleanup();
    });
    test('onWillShutdown - veto if backup fails', async function () {
        const { accessor, cleanup } = await createTracker();
        class TestBackupWorkingCopy extends TestWorkingCopy {
            constructor(resource) {
                super(resource);
                accessor.workingCopyService.registerWorkingCopy(this);
            }
            async backup(token) {
                throw new Error('unable to backup');
            }
        }
        const resource = toResource.call(this, '/path/custom.txt');
        const customWorkingCopy = new TestBackupWorkingCopy(resource);
        customWorkingCopy.setDirty(true);
        const event = new TestBeforeShutdownEvent();
        event.reason = 2 /* ShutdownReason.QUIT */;
        accessor.lifecycleService.fireBeforeShutdown(event);
        const veto = await event.value;
        assert.ok(veto);
        const finalVeto = await event.finalValue?.();
        assert.ok(finalVeto); // assert the tracker uses the internal finalVeto API
        await cleanup();
    });
    test('onWillShutdown - pending backup operations canceled and tracker suspended/resumsed', async function () {
        const { accessor, tracker, cleanup } = await createTracker();
        const resource = toResource.call(this, '/path/index.txt');
        await accessor.editorService.openEditor({ resource, options: { pinned: true } });
        const model = accessor.textFileService.files.get(resource);
        await model?.resolve();
        model?.textEditorModel?.setValue('foo');
        assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
        assert.strictEqual(tracker.pendingBackupOperationCount, 1);
        const onSuspend = Event.toPromise(tracker.onDidSuspend);
        const event = new TestBeforeShutdownEvent();
        event.reason = 2 /* ShutdownReason.QUIT */;
        accessor.lifecycleService.fireBeforeShutdown(event);
        await onSuspend;
        assert.strictEqual(tracker.pendingBackupOperationCount, 0);
        // Ops are suspended during shutdown!
        model?.textEditorModel?.setValue('bar');
        assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
        assert.strictEqual(tracker.pendingBackupOperationCount, 0);
        const onResume = Event.toPromise(tracker.onDidResume);
        await event.value;
        // Ops are resumed after shutdown!
        model?.textEditorModel?.setValue('foo');
        await onResume;
        assert.strictEqual(tracker.pendingBackupOperationCount, 1);
        await cleanup();
    });
    suite('Hot Exit', () => {
        suite('"onExit" setting', () => {
            test('should hot exit on non-Mac (reason: CLOSE, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, true, !!isMacintosh);
            });
            test('should hot exit on non-Mac (reason: CLOSE, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, false, !!isMacintosh);
            });
            test('should NOT hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, true, true);
            });
            test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, false, true);
            });
            test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, true, false);
            });
            test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, false, false);
            });
            test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, true, false);
            });
            test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, false, false);
            });
            test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, true, false);
            });
            test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, false, false);
            });
            test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, true, false);
            });
            test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, false, false);
            });
            test('should NOT hot exit (reason: LOAD, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, true, true);
            });
            test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, false, true);
            });
            test('should NOT hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, true, true);
            });
            test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, false, true);
            });
        });
        suite('"onExitAndWindowClose" setting', () => {
            test('should hot exit (reason: CLOSE, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, true, false);
            });
            test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, false, !!isMacintosh);
            });
            test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, true, false);
            });
            test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, false, true);
            });
            test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, true, false);
            });
            test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, false, false);
            });
            test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, true, false);
            });
            test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, false, false);
            });
            test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, true, false);
            });
            test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, false, false);
            });
            test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, true, false);
            });
            test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, false, false);
            });
            test('should hot exit (reason: LOAD, windows: single, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, true, false);
            });
            test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, false, true);
            });
            test('should hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, true, false);
            });
            test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, false, true);
            });
        });
        async function hotExitTest(setting, shutdownReason, multipleWindows, workspace, shouldVeto) {
            const { accessor, cleanup } = await createTracker();
            const resource = toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            // Set hot exit config
            accessor.filesConfigurationService.onFilesConfigurationChange({ files: { hotExit: setting } });
            // Set empty workspace if required
            if (!workspace) {
                accessor.contextService.setWorkspace(new Workspace('empty:1508317022751'));
            }
            // Set multiple windows if required
            if (multipleWindows) {
                accessor.nativeHostService.windowCount = Promise.resolve(2);
            }
            // Set cancel to force a veto if hot exit does not trigger
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new TestBeforeShutdownEvent();
            event.reason = shutdownReason;
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(typeof event.finalValue === 'function'); // assert the tracker uses the internal finalVeto API
            assert.strictEqual(accessor.workingCopyBackupService.discardedBackups.length, 0); // When hot exit is set, backups should never be cleaned since the confirm result is cancel
            assert.strictEqual(veto, shouldVeto);
            await cleanup();
        }
    });
});
