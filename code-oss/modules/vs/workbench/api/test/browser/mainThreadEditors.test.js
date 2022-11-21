/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { SingleProxyRPCProtocol } from 'vs/workbench/api/test/common/testRPCProtocol';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { ModelService } from 'vs/editor/common/services/modelService';
import { TestCodeEditorService } from 'vs/editor/test/browser/editorTestServices';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { mock } from 'vs/base/test/common/mock';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { Position } from 'vs/editor/common/core/position';
import { IModelService } from 'vs/editor/common/services/model';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { TestFileService, TestEditorService, TestEditorGroupsService, TestEnvironmentService, TestLifecycleService, TestWorkingCopyService } from 'vs/workbench/test/browser/workbenchTestServices';
import { BulkEditService } from 'vs/workbench/contrib/bulkEdit/browser/bulkEditService';
import { NullLogService, ILogService } from 'vs/platform/log/common/log';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ImmortalReference, DisposableStore } from 'vs/base/common/lifecycle';
import { LabelService } from 'vs/workbench/services/label/common/labelService';
import { TestThemeService } from 'vs/platform/theme/test/common/testThemeService';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IFileService } from 'vs/platform/files/common/files';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { InstantiationService } from 'vs/platform/instantiation/common/instantiationService';
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILabelService } from 'vs/platform/label/common/label';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { UndoRedoService } from 'vs/platform/undoRedo/common/undoRedoService';
import { TestDialogService } from 'vs/platform/dialogs/test/common/testDialogService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { TestNotificationService } from 'vs/platform/notification/test/common/testNotificationService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { TestTextResourcePropertiesService, TestContextService } from 'vs/workbench/test/common/workbenchTestServices';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { TestLanguageConfigurationService } from 'vs/editor/test/common/modes/testLanguageConfigurationService';
import { LanguageService } from 'vs/editor/common/services/languageService';
import { LanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { LanguageFeaturesService } from 'vs/editor/common/services/languageFeaturesService';
import { MainThreadBulkEdits } from 'vs/workbench/api/browser/mainThreadBulkEdits';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService';
suite('MainThreadEditors', () => {
    let disposables;
    const resource = URI.parse('foo:bar');
    let modelService;
    let bulkEdits;
    const movedResources = new Map();
    const copiedResources = new Map();
    const createdResources = new Set();
    const deletedResources = new Set();
    setup(() => {
        disposables = new DisposableStore();
        movedResources.clear();
        copiedResources.clear();
        createdResources.clear();
        deletedResources.clear();
        const configService = new TestConfigurationService();
        const dialogService = new TestDialogService();
        const notificationService = new TestNotificationService();
        const undoRedoService = new UndoRedoService(dialogService, notificationService);
        const themeService = new TestThemeService();
        const logService = new NullLogService();
        modelService = new ModelService(configService, new TestTextResourcePropertiesService(configService), themeService, logService, undoRedoService, disposables.add(new LanguageService()), new TestLanguageConfigurationService(), new LanguageFeatureDebounceService(logService), new LanguageFeaturesService());
        const services = new ServiceCollection();
        services.set(IBulkEditService, new SyncDescriptor(BulkEditService));
        services.set(ILabelService, new SyncDescriptor(LabelService));
        services.set(ILogService, new NullLogService());
        services.set(IWorkspaceContextService, new TestContextService());
        services.set(IEnvironmentService, TestEnvironmentService);
        services.set(IWorkbenchEnvironmentService, TestEnvironmentService);
        services.set(IConfigurationService, configService);
        services.set(IDialogService, dialogService);
        services.set(INotificationService, notificationService);
        services.set(IUndoRedoService, undoRedoService);
        services.set(IModelService, modelService);
        services.set(ICodeEditorService, new TestCodeEditorService(themeService));
        services.set(IFileService, new TestFileService());
        services.set(IUriIdentityService, new SyncDescriptor(UriIdentityService));
        services.set(IEditorService, new TestEditorService());
        services.set(ILifecycleService, new TestLifecycleService());
        services.set(IWorkingCopyService, new TestWorkingCopyService());
        services.set(IEditorGroupsService, new TestEditorGroupsService());
        services.set(ITextFileService, new class extends mock() {
            isDirty() { return false; }
            files = {
                onDidSave: Event.None,
                onDidRevert: Event.None,
                onDidChangeDirty: Event.None
            };
            create(operations) {
                for (const o of operations) {
                    createdResources.add(o.resource);
                }
                return Promise.resolve(Object.create(null));
            }
            async getEncodedReadable(resource, value) {
                return undefined;
            }
        });
        services.set(IWorkingCopyFileService, new class extends mock() {
            onDidRunWorkingCopyFileOperation = Event.None;
            createFolder(operations) {
                this.create(operations);
            }
            create(operations) {
                for (const operation of operations) {
                    createdResources.add(operation.resource);
                }
                return Promise.resolve(Object.create(null));
            }
            move(operations) {
                const { source, target } = operations[0].file;
                movedResources.set(source, target);
                return Promise.resolve(Object.create(null));
            }
            copy(operations) {
                const { source, target } = operations[0].file;
                copiedResources.set(source, target);
                return Promise.resolve(Object.create(null));
            }
            delete(operations) {
                for (const operation of operations) {
                    deletedResources.add(operation.resource);
                }
                return Promise.resolve(undefined);
            }
        });
        services.set(ITextModelService, new class extends mock() {
            createModelReference(resource) {
                const textEditorModel = new class extends mock() {
                    textEditorModel = modelService.getModel(resource);
                };
                textEditorModel.isReadonly = () => false;
                return Promise.resolve(new ImmortalReference(textEditorModel));
            }
        });
        services.set(IEditorWorkerService, new class extends mock() {
        });
        services.set(IPaneCompositePartService, new class extends mock() {
            onDidPaneCompositeOpen = Event.None;
            onDidPaneCompositeClose = Event.None;
            getActivePaneComposite() {
                return undefined;
            }
        });
        const instaService = new InstantiationService(services);
        bulkEdits = instaService.createInstance(MainThreadBulkEdits, SingleProxyRPCProtocol(null));
    });
    teardown(() => {
        disposables.dispose();
    });
    test(`applyWorkspaceEdit returns false if model is changed by user`, () => {
        const model = modelService.createModel('something', null, resource);
        const workspaceResourceEdit = {
            resource: resource,
            versionId: model.getVersionId(),
            textEdit: {
                text: 'asdfg',
                range: new Range(1, 1, 1, 1)
            }
        };
        // Act as if the user edited the model
        model.applyEdits([EditOperation.insert(new Position(0, 0), 'something')]);
        return bulkEdits.$tryApplyWorkspaceEdit({ edits: [workspaceResourceEdit] }).then((result) => {
            assert.strictEqual(result, false);
        });
    });
    test(`issue #54773: applyWorkspaceEdit checks model version in race situation`, () => {
        const model = modelService.createModel('something', null, resource);
        const workspaceResourceEdit1 = {
            resource: resource,
            versionId: model.getVersionId(),
            textEdit: {
                text: 'asdfg',
                range: new Range(1, 1, 1, 1)
            }
        };
        const workspaceResourceEdit2 = {
            resource: resource,
            versionId: model.getVersionId(),
            textEdit: {
                text: 'asdfg',
                range: new Range(1, 1, 1, 1)
            }
        };
        const p1 = bulkEdits.$tryApplyWorkspaceEdit({ edits: [workspaceResourceEdit1] }).then((result) => {
            // first edit request succeeds
            assert.strictEqual(result, true);
        });
        const p2 = bulkEdits.$tryApplyWorkspaceEdit({ edits: [workspaceResourceEdit2] }).then((result) => {
            // second edit request fails
            assert.strictEqual(result, false);
        });
        return Promise.all([p1, p2]);
    });
    test(`applyWorkspaceEdit with only resource edit`, () => {
        return bulkEdits.$tryApplyWorkspaceEdit({
            edits: [
                { oldResource: resource, newResource: resource, options: undefined },
                { oldResource: undefined, newResource: resource, options: undefined },
                { oldResource: resource, newResource: undefined, options: undefined }
            ]
        }).then((result) => {
            assert.strictEqual(result, true);
            assert.strictEqual(movedResources.get(resource), resource);
            assert.strictEqual(createdResources.has(resource), true);
            assert.strictEqual(deletedResources.has(resource), true);
        });
    });
});
