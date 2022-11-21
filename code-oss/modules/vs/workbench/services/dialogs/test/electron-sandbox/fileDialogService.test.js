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
import { URI } from 'vs/base/common/uri';
import { workbenchInstantiationService } from 'vs/workbench/test/browser/workbenchTestServices';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { Schemas } from 'vs/base/common/network';
import { BrowserWorkspaceEditingService } from 'vs/workbench/services/workspaces/browser/workspaceEditingService';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { FileDialogService } from 'vs/workbench/services/dialogs/electron-sandbox/fileDialogService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { mock } from 'vs/base/test/common/mock';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
let TestFileDialogService = class TestFileDialogService extends FileDialogService {
    simple;
    constructor(simple, hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
        super(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService);
        this.simple = simple;
    }
    getSimpleFileDialog() {
        if (this.simple) {
            return this.simple;
        }
        else {
            return super.getSimpleFileDialog();
        }
    }
};
TestFileDialogService = __decorate([
    __param(1, IHostService),
    __param(2, IWorkspaceContextService),
    __param(3, IHistoryService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, IInstantiationService),
    __param(6, IConfigurationService),
    __param(7, IFileService),
    __param(8, IOpenerService),
    __param(9, INativeHostService),
    __param(10, IDialogService),
    __param(11, ILanguageService),
    __param(12, IWorkspacesService),
    __param(13, ILabelService),
    __param(14, IPathService),
    __param(15, ICommandService),
    __param(16, IEditorService),
    __param(17, ICodeEditorService),
    __param(18, ILogService)
], TestFileDialogService);
suite('FileDialogService', function () {
    let disposables;
    let instantiationService;
    const testFile = URI.file('/test/file');
    setup(async function () {
        disposables = new DisposableStore();
        instantiationService = workbenchInstantiationService(undefined, disposables);
        const configurationService = new TestConfigurationService();
        await configurationService.setUserConfiguration('files', { simpleDialog: { enable: true } });
        instantiationService.stub(IConfigurationService, configurationService);
    });
    teardown(() => {
        disposables.dispose();
    });
    test('Local - open/save workspaces availableFilesystems', async function () {
        class TestSimpleFileDialog {
            async showOpenDialog(options) {
                assert.strictEqual(options.availableFileSystems?.length, 1);
                assert.strictEqual(options.availableFileSystems[0], Schemas.file);
                return testFile;
            }
            async showSaveDialog(options) {
                assert.strictEqual(options.availableFileSystems?.length, 1);
                assert.strictEqual(options.availableFileSystems[0], Schemas.file);
                return testFile;
            }
        }
        const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
        instantiationService.set(IFileDialogService, dialogService);
        const workspaceService = instantiationService.createInstance(BrowserWorkspaceEditingService);
        assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
        assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
    });
    test('Virtual - open/save workspaces availableFilesystems', async function () {
        class TestSimpleFileDialog {
            async showOpenDialog(options) {
                assert.strictEqual(options.availableFileSystems?.length, 1);
                assert.strictEqual(options.availableFileSystems[0], Schemas.file);
                return testFile;
            }
            async showSaveDialog(options) {
                assert.strictEqual(options.availableFileSystems?.length, 1);
                assert.strictEqual(options.availableFileSystems[0], Schemas.file);
                return testFile;
            }
        }
        instantiationService.stub(IPathService, new class {
            defaultUriScheme = 'vscode-virtual-test';
            userHome = async () => URI.file('/user/home');
        });
        const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
        instantiationService.set(IFileDialogService, dialogService);
        const workspaceService = instantiationService.createInstance(BrowserWorkspaceEditingService);
        assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
        assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
    });
    test('Remote - open/save workspaces availableFilesystems', async function () {
        class TestSimpleFileDialog {
            async showOpenDialog(options) {
                assert.strictEqual(options.availableFileSystems?.length, 2);
                assert.strictEqual(options.availableFileSystems[0], Schemas.vscodeRemote);
                assert.strictEqual(options.availableFileSystems[1], Schemas.file);
                return testFile;
            }
            async showSaveDialog(options) {
                assert.strictEqual(options.availableFileSystems?.length, 2);
                assert.strictEqual(options.availableFileSystems[0], Schemas.vscodeRemote);
                assert.strictEqual(options.availableFileSystems[1], Schemas.file);
                return testFile;
            }
        }
        instantiationService.set(IWorkbenchEnvironmentService, new class extends mock() {
            get remoteAuthority() {
                return 'testRemote';
            }
        });
        instantiationService.stub(IPathService, new class {
            defaultUriScheme = Schemas.vscodeRemote;
            userHome = async () => URI.file('/user/home');
        });
        const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
        instantiationService.set(IFileDialogService, dialogService);
        const workspaceService = instantiationService.createInstance(BrowserWorkspaceEditingService);
        assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
        assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
    });
});
