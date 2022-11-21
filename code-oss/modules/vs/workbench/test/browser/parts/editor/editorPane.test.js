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
import { EditorPane, EditorMemento } from 'vs/workbench/browser/parts/editor/editorPane';
import { WorkspaceTrustRequiredPlaceholderEditor } from 'vs/workbench/browser/parts/editor/editorPlaceholder';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { Registry } from 'vs/platform/registry/common/platform';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { NullTelemetryService } from 'vs/platform/telemetry/common/telemetryUtils';
import { workbenchInstantiationService, TestEditorGroupView, TestEditorGroupsService, registerTestResourceEditor, TestEditorInput, createEditorPart, TestTextResourceConfigurationService } from 'vs/workbench/test/browser/workbenchTestServices';
import { TextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { TestThemeService } from 'vs/platform/theme/test/common/testThemeService';
import { URI } from 'vs/base/common/uri';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { DisposableStore, dispose } from 'vs/base/common/lifecycle';
import { TestStorageService } from 'vs/workbench/test/common/workbenchTestServices';
import { extUri } from 'vs/base/common/resources';
import { EditorService } from 'vs/workbench/services/editor/browser/editorService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { TestWorkspaceTrustManagementService } from 'vs/workbench/services/workspaces/test/common/testWorkspaceTrustService';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
const NullThemeService = new TestThemeService();
const editorRegistry = Registry.as(EditorExtensions.EditorPane);
const editorInputRegistry = Registry.as(EditorExtensions.EditorFactory);
let TestEditor = class TestEditor extends EditorPane {
    constructor(telemetryService) {
        super('TestEditor', NullTelemetryService, NullThemeService, new TestStorageService());
    }
    getId() { return 'testEditor'; }
    layout() { }
    createEditor() { }
};
TestEditor = __decorate([
    __param(0, ITelemetryService)
], TestEditor);
let OtherTestEditor = class OtherTestEditor extends EditorPane {
    constructor(telemetryService) {
        super('testOtherEditor', NullTelemetryService, NullThemeService, new TestStorageService());
    }
    getId() { return 'testOtherEditor'; }
    layout() { }
    createEditor() { }
};
OtherTestEditor = __decorate([
    __param(0, ITelemetryService)
], OtherTestEditor);
export { OtherTestEditor };
class TestInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(input) {
        return input.toString();
    }
    deserialize(instantiationService, raw) {
        return {};
    }
}
class TestInput extends EditorInput {
    resource = undefined;
    prefersEditorPane(editors) {
        return editors[1];
    }
    get typeId() {
        return 'testInput';
    }
    resolve() {
        return null;
    }
}
class OtherTestInput extends EditorInput {
    resource = undefined;
    get typeId() {
        return 'otherTestInput';
    }
    resolve() {
        return null;
    }
}
class TestResourceEditorInput extends TextResourceEditorInput {
}
suite('EditorPane', () => {
    test('EditorPane API', async () => {
        const editor = new TestEditor(NullTelemetryService);
        const input = new OtherTestInput();
        const options = {};
        assert(!editor.isVisible());
        assert(!editor.input);
        await editor.setInput(input, options, Object.create(null), CancellationToken.None);
        assert.strictEqual(input, editor.input);
        const group = new TestEditorGroupView(1);
        editor.setVisible(true, group);
        assert(editor.isVisible());
        assert.strictEqual(editor.group, group);
        input.onWillDispose(() => {
            assert(false);
        });
        editor.dispose();
        editor.clearInput();
        editor.setVisible(false, group);
        assert(!editor.isVisible());
        assert(!editor.input);
        assert(!editor.getControl());
    });
    test('EditorPaneDescriptor', () => {
        const editorDescriptor = EditorPaneDescriptor.create(TestEditor, 'id', 'name');
        assert.strictEqual(editorDescriptor.typeId, 'id');
        assert.strictEqual(editorDescriptor.name, 'name');
    });
    test('Editor Pane Registration', function () {
        const editorDescriptor1 = EditorPaneDescriptor.create(TestEditor, 'id1', 'name');
        const editorDescriptor2 = EditorPaneDescriptor.create(OtherTestEditor, 'id2', 'name');
        const oldEditorsCnt = editorRegistry.getEditorPanes().length;
        const oldInputCnt = editorRegistry.getEditors().length;
        const dispose1 = editorRegistry.registerEditorPane(editorDescriptor1, [new SyncDescriptor(TestInput)]);
        const dispose2 = editorRegistry.registerEditorPane(editorDescriptor2, [new SyncDescriptor(TestInput), new SyncDescriptor(OtherTestInput)]);
        assert.strictEqual(editorRegistry.getEditorPanes().length, oldEditorsCnt + 2);
        assert.strictEqual(editorRegistry.getEditors().length, oldInputCnt + 3);
        assert.strictEqual(editorRegistry.getEditorPane(new TestInput()), editorDescriptor2);
        assert.strictEqual(editorRegistry.getEditorPane(new OtherTestInput()), editorDescriptor2);
        assert.strictEqual(editorRegistry.getEditorPaneByType('id1'), editorDescriptor1);
        assert.strictEqual(editorRegistry.getEditorPaneByType('id2'), editorDescriptor2);
        assert(!editorRegistry.getEditorPaneByType('id3'));
        dispose([dispose1, dispose2]);
    });
    test('Editor Pane Lookup favors specific class over superclass (match on specific class)', function () {
        const d1 = EditorPaneDescriptor.create(TestEditor, 'id1', 'name');
        const disposables = new DisposableStore();
        disposables.add(registerTestResourceEditor());
        disposables.add(editorRegistry.registerEditorPane(d1, [new SyncDescriptor(TestResourceEditorInput)]));
        const inst = workbenchInstantiationService(undefined, disposables);
        const editor = editorRegistry.getEditorPane(inst.createInstance(TestResourceEditorInput, URI.file('/fake'), 'fake', '', undefined, undefined)).instantiate(inst);
        assert.strictEqual(editor.getId(), 'testEditor');
        const otherEditor = editorRegistry.getEditorPane(inst.createInstance(TextResourceEditorInput, URI.file('/fake'), 'fake', '', undefined, undefined)).instantiate(inst);
        assert.strictEqual(otherEditor.getId(), 'workbench.editors.textResourceEditor');
        disposables.dispose();
    });
    test('Editor Pane Lookup favors specific class over superclass (match on super class)', function () {
        const disposables = new DisposableStore();
        const inst = workbenchInstantiationService(undefined, disposables);
        disposables.add(registerTestResourceEditor());
        const editor = editorRegistry.getEditorPane(inst.createInstance(TestResourceEditorInput, URI.file('/fake'), 'fake', '', undefined, undefined)).instantiate(inst);
        assert.strictEqual('workbench.editors.textResourceEditor', editor.getId());
        disposables.dispose();
    });
    test('Editor Input Serializer', function () {
        const disposables = new DisposableStore();
        const testInput = new TestEditorInput(URI.file('/fake'), 'testTypeId');
        workbenchInstantiationService(undefined, disposables).invokeFunction(accessor => editorInputRegistry.start(accessor));
        disposables.add(editorInputRegistry.registerEditorSerializer(testInput.typeId, TestInputSerializer));
        let factory = editorInputRegistry.getEditorSerializer('testTypeId');
        assert(factory);
        factory = editorInputRegistry.getEditorSerializer(testInput);
        assert(factory);
        // throws when registering serializer for same type
        assert.throws(() => editorInputRegistry.registerEditorSerializer(testInput.typeId, TestInputSerializer));
        disposables.dispose();
    });
    test('EditorMemento - basics', function () {
        const testGroup0 = new TestEditorGroupView(0);
        const testGroup1 = new TestEditorGroupView(1);
        const testGroup4 = new TestEditorGroupView(4);
        const configurationService = new TestTextResourceConfigurationService();
        const editorGroupService = new TestEditorGroupsService([
            testGroup0,
            testGroup1,
            new TestEditorGroupView(2)
        ]);
        const rawMemento = Object.create(null);
        let memento = new EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService);
        let res = memento.loadEditorState(testGroup0, URI.file('/A'));
        assert.ok(!res);
        memento.saveEditorState(testGroup0, URI.file('/A'), { line: 3 });
        res = memento.loadEditorState(testGroup0, URI.file('/A'));
        assert.ok(res);
        assert.strictEqual(res.line, 3);
        memento.saveEditorState(testGroup1, URI.file('/A'), { line: 5 });
        res = memento.loadEditorState(testGroup1, URI.file('/A'));
        assert.ok(res);
        assert.strictEqual(res.line, 5);
        // Ensure capped at 3 elements
        memento.saveEditorState(testGroup0, URI.file('/B'), { line: 1 });
        memento.saveEditorState(testGroup0, URI.file('/C'), { line: 1 });
        memento.saveEditorState(testGroup0, URI.file('/D'), { line: 1 });
        memento.saveEditorState(testGroup0, URI.file('/E'), { line: 1 });
        assert.ok(!memento.loadEditorState(testGroup0, URI.file('/A')));
        assert.ok(!memento.loadEditorState(testGroup0, URI.file('/B')));
        assert.ok(memento.loadEditorState(testGroup0, URI.file('/C')));
        assert.ok(memento.loadEditorState(testGroup0, URI.file('/D')));
        assert.ok(memento.loadEditorState(testGroup0, URI.file('/E')));
        // Save at an unknown group
        memento.saveEditorState(testGroup4, URI.file('/E'), { line: 1 });
        assert.ok(memento.loadEditorState(testGroup4, URI.file('/E'))); // only gets removed when memento is saved
        memento.saveEditorState(testGroup4, URI.file('/C'), { line: 1 });
        assert.ok(memento.loadEditorState(testGroup4, URI.file('/C'))); // only gets removed when memento is saved
        memento.saveState();
        memento = new EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService);
        assert.ok(memento.loadEditorState(testGroup0, URI.file('/C')));
        assert.ok(memento.loadEditorState(testGroup0, URI.file('/D')));
        assert.ok(memento.loadEditorState(testGroup0, URI.file('/E')));
        // Check on entries no longer there from invalid groups
        assert.ok(!memento.loadEditorState(testGroup4, URI.file('/E')));
        assert.ok(!memento.loadEditorState(testGroup4, URI.file('/C')));
        memento.clearEditorState(URI.file('/C'), testGroup4);
        memento.clearEditorState(URI.file('/E'));
        assert.ok(!memento.loadEditorState(testGroup4, URI.file('/C')));
        assert.ok(memento.loadEditorState(testGroup0, URI.file('/D')));
        assert.ok(!memento.loadEditorState(testGroup0, URI.file('/E')));
    });
    test('EditorMemento - move', function () {
        const testGroup0 = new TestEditorGroupView(0);
        const configurationService = new TestTextResourceConfigurationService();
        const editorGroupService = new TestEditorGroupsService([testGroup0]);
        const rawMemento = Object.create(null);
        const memento = new EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService);
        memento.saveEditorState(testGroup0, URI.file('/some/folder/file-1.txt'), { line: 1 });
        memento.saveEditorState(testGroup0, URI.file('/some/folder/file-2.txt'), { line: 2 });
        memento.saveEditorState(testGroup0, URI.file('/some/other/file.txt'), { line: 3 });
        memento.moveEditorState(URI.file('/some/folder/file-1.txt'), URI.file('/some/folder/file-moved.txt'), extUri);
        let res = memento.loadEditorState(testGroup0, URI.file('/some/folder/file-1.txt'));
        assert.ok(!res);
        res = memento.loadEditorState(testGroup0, URI.file('/some/folder/file-moved.txt'));
        assert.strictEqual(res?.line, 1);
        memento.moveEditorState(URI.file('/some/folder'), URI.file('/some/folder-moved'), extUri);
        res = memento.loadEditorState(testGroup0, URI.file('/some/folder-moved/file-moved.txt'));
        assert.strictEqual(res?.line, 1);
        res = memento.loadEditorState(testGroup0, URI.file('/some/folder-moved/file-2.txt'));
        assert.strictEqual(res?.line, 2);
    });
    test('EditoMemento - use with editor input', function () {
        const testGroup0 = new TestEditorGroupView(0);
        class TestEditorInput extends EditorInput {
            resource;
            id;
            constructor(resource, id = 'testEditorInputForMementoTest') {
                super();
                this.resource = resource;
                this.id = id;
            }
            get typeId() { return 'testEditorInputForMementoTest'; }
            async resolve() { return null; }
            matches(other) {
                return other && this.id === other.id && other instanceof TestEditorInput;
            }
        }
        const rawMemento = Object.create(null);
        const memento = new EditorMemento('id', 'key', rawMemento, 3, new TestEditorGroupsService(), new TestTextResourceConfigurationService());
        const testInputA = new TestEditorInput(URI.file('/A'));
        let res = memento.loadEditorState(testGroup0, testInputA);
        assert.ok(!res);
        memento.saveEditorState(testGroup0, testInputA, { line: 3 });
        res = memento.loadEditorState(testGroup0, testInputA);
        assert.ok(res);
        assert.strictEqual(res.line, 3);
        // State removed when input gets disposed
        testInputA.dispose();
        res = memento.loadEditorState(testGroup0, testInputA);
        assert.ok(!res);
    });
    test('EditoMemento - clear on editor dispose', function () {
        const testGroup0 = new TestEditorGroupView(0);
        class TestEditorInput extends EditorInput {
            resource;
            id;
            constructor(resource, id = 'testEditorInputForMementoTest') {
                super();
                this.resource = resource;
                this.id = id;
            }
            get typeId() { return 'testEditorInputForMementoTest'; }
            async resolve() { return null; }
            matches(other) {
                return other && this.id === other.id && other instanceof TestEditorInput;
            }
        }
        const rawMemento = Object.create(null);
        const memento = new EditorMemento('id', 'key', rawMemento, 3, new TestEditorGroupsService(), new TestTextResourceConfigurationService());
        const testInputA = new TestEditorInput(URI.file('/A'));
        let res = memento.loadEditorState(testGroup0, testInputA);
        assert.ok(!res);
        memento.saveEditorState(testGroup0, testInputA.resource, { line: 3 });
        res = memento.loadEditorState(testGroup0, testInputA);
        assert.ok(res);
        assert.strictEqual(res.line, 3);
        // State not yet removed when input gets disposed
        // because we used resource
        testInputA.dispose();
        res = memento.loadEditorState(testGroup0, testInputA);
        assert.ok(res);
        const testInputB = new TestEditorInput(URI.file('/B'));
        res = memento.loadEditorState(testGroup0, testInputB);
        assert.ok(!res);
        memento.saveEditorState(testGroup0, testInputB.resource, { line: 3 });
        res = memento.loadEditorState(testGroup0, testInputB);
        assert.ok(res);
        assert.strictEqual(res.line, 3);
        memento.clearEditorStateOnDispose(testInputB.resource, testInputB);
        // State removed when input gets disposed
        testInputB.dispose();
        res = memento.loadEditorState(testGroup0, testInputB);
        assert.ok(!res);
    });
    test('EditorMemento - workbench.editor.sharedViewState', function () {
        const testGroup0 = new TestEditorGroupView(0);
        const testGroup1 = new TestEditorGroupView(1);
        const configurationService = new TestTextResourceConfigurationService(new TestConfigurationService({
            workbench: {
                editor: {
                    sharedViewState: true
                }
            }
        }));
        const editorGroupService = new TestEditorGroupsService([testGroup0]);
        const rawMemento = Object.create(null);
        const memento = new EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService);
        const resource = URI.file('/some/folder/file-1.txt');
        memento.saveEditorState(testGroup0, resource, { line: 1 });
        let res = memento.loadEditorState(testGroup0, resource);
        assert.strictEqual(res.line, 1);
        res = memento.loadEditorState(testGroup1, resource);
        assert.strictEqual(res.line, 1);
        memento.saveEditorState(testGroup0, resource, { line: 3 });
        res = memento.loadEditorState(testGroup1, resource);
        assert.strictEqual(res.line, 3);
        memento.saveEditorState(testGroup1, resource, { line: 1 });
        res = memento.loadEditorState(testGroup1, resource);
        assert.strictEqual(res.line, 1);
        memento.clearEditorState(resource, testGroup0);
        memento.clearEditorState(resource, testGroup1);
        res = memento.loadEditorState(testGroup1, resource);
        assert.strictEqual(res.line, 1);
        memento.clearEditorState(resource);
        res = memento.loadEditorState(testGroup1, resource);
        assert.ok(!res);
    });
    test('WorkspaceTrustRequiredEditor', async function () {
        let TrustRequiredTestEditor = class TrustRequiredTestEditor extends EditorPane {
            constructor(telemetryService) {
                super('TestEditor', NullTelemetryService, NullThemeService, new TestStorageService());
            }
            getId() { return 'trustRequiredTestEditor'; }
            layout() { }
            createEditor() { }
        };
        TrustRequiredTestEditor = __decorate([
            __param(0, ITelemetryService)
        ], TrustRequiredTestEditor);
        class TrustRequiredTestInput extends EditorInput {
            resource = undefined;
            get typeId() {
                return 'trustRequiredTestInput';
            }
            get capabilities() {
                return 16 /* EditorInputCapabilities.RequiresTrust */;
            }
            resolve() {
                return null;
            }
        }
        const disposables = new DisposableStore();
        const instantiationService = workbenchInstantiationService(undefined, disposables);
        const workspaceTrustService = instantiationService.createInstance(TestWorkspaceTrustManagementService);
        instantiationService.stub(IWorkspaceTrustManagementService, workspaceTrustService);
        workspaceTrustService.setWorkspaceTrust(false);
        const editorPart = await createEditorPart(instantiationService, disposables);
        instantiationService.stub(IEditorGroupsService, editorPart);
        const editorService = instantiationService.createInstance(EditorService);
        instantiationService.stub(IEditorService, editorService);
        const group = editorPart.activeGroup;
        const editorDescriptor = EditorPaneDescriptor.create(TrustRequiredTestEditor, 'id1', 'name');
        disposables.add(editorRegistry.registerEditorPane(editorDescriptor, [new SyncDescriptor(TrustRequiredTestInput)]));
        const testInput = new TrustRequiredTestInput();
        await group.openEditor(testInput);
        assert.strictEqual(group.activeEditorPane?.getId(), WorkspaceTrustRequiredPlaceholderEditor.ID);
        const getEditorPaneIdAsync = () => new Promise(resolve => {
            disposables.add(editorService.onDidActiveEditorChange(() => {
                resolve(group.activeEditorPane?.getId());
            }));
        });
        workspaceTrustService.setWorkspaceTrust(true);
        assert.strictEqual(await getEditorPaneIdAsync(), 'trustRequiredTestEditor');
        workspaceTrustService.setWorkspaceTrust(false);
        assert.strictEqual(await getEditorPaneIdAsync(), WorkspaceTrustRequiredPlaceholderEditor.ID);
        dispose(disposables);
    });
});
