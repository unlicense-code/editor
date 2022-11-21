/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Event } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { isEqual } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { mock } from 'vs/base/test/common/mock';
import { NullLogService } from 'vs/platform/log/common/log';
import { ComplexNotebookEditorModel, NotebookFileWorkingCopyModel } from 'vs/workbench/contrib/notebook/common/notebookEditorModel';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { setupInstantiationService } from 'vs/workbench/contrib/notebook/test/browser/testNotebookEditor';
import { VSBuffer } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Mimes } from 'vs/base/common/mime';
suite('NotebookFileWorkingCopyModel', function () {
    let disposables;
    let instantiationService;
    suiteSetup(() => {
        disposables = new DisposableStore();
        instantiationService = setupInstantiationService(disposables);
    });
    suiteTeardown(() => disposables.dispose());
    test('no transient output is send to serializer', function () {
        const notebook = instantiationService.createInstance(NotebookTextModel, 'notebook', URI.file('test'), [{ cellKind: CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [{ outputId: 'id', outputs: [{ mime: Mimes.text, data: VSBuffer.fromString('Hello Out') }] }] }], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false });
        { // transient output
            let callCount = 0;
            const model = new NotebookFileWorkingCopyModel(notebook, new class extends mock() {
                options = { transientOutputs: true, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                async notebookToData(notebook) {
                    callCount += 1;
                    assert.strictEqual(notebook.cells.length, 1);
                    assert.strictEqual(notebook.cells[0].outputs.length, 0);
                    return VSBuffer.fromString('');
                }
            });
            model.snapshot(CancellationToken.None);
            assert.strictEqual(callCount, 1);
        }
        { // NOT transient output
            let callCount = 0;
            const model = new NotebookFileWorkingCopyModel(notebook, new class extends mock() {
                options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                async notebookToData(notebook) {
                    callCount += 1;
                    assert.strictEqual(notebook.cells.length, 1);
                    assert.strictEqual(notebook.cells[0].outputs.length, 1);
                    return VSBuffer.fromString('');
                }
            });
            model.snapshot(CancellationToken.None);
            assert.strictEqual(callCount, 1);
        }
    });
    test('no transient metadata is send to serializer', function () {
        const notebook = instantiationService.createInstance(NotebookTextModel, 'notebook', URI.file('test'), [{ cellKind: CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [] }], { foo: 123, bar: 456 }, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false });
        { // transient
            let callCount = 0;
            const model = new NotebookFileWorkingCopyModel(notebook, new class extends mock() {
                options = { transientOutputs: true, transientCellMetadata: {}, transientDocumentMetadata: { bar: true }, cellContentMetadata: {} };
                async notebookToData(notebook) {
                    callCount += 1;
                    assert.strictEqual(notebook.metadata.foo, 123);
                    assert.strictEqual(notebook.metadata.bar, undefined);
                    return VSBuffer.fromString('');
                }
            });
            model.snapshot(CancellationToken.None);
            assert.strictEqual(callCount, 1);
        }
        { // NOT transient
            let callCount = 0;
            const model = new NotebookFileWorkingCopyModel(notebook, new class extends mock() {
                options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                async notebookToData(notebook) {
                    callCount += 1;
                    assert.strictEqual(notebook.metadata.foo, 123);
                    assert.strictEqual(notebook.metadata.bar, 456);
                    return VSBuffer.fromString('');
                }
            });
            model.snapshot(CancellationToken.None);
            assert.strictEqual(callCount, 1);
        }
    });
    test('no transient cell metadata is send to serializer', function () {
        const notebook = instantiationService.createInstance(NotebookTextModel, 'notebook', URI.file('test'), [{ cellKind: CellKind.Code, language: 'foo', mime: 'foo', source: 'foo', outputs: [], metadata: { foo: 123, bar: 456 } }], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false, });
        { // transient
            let callCount = 0;
            const model = new NotebookFileWorkingCopyModel(notebook, new class extends mock() {
                options = { transientOutputs: true, transientDocumentMetadata: {}, transientCellMetadata: { bar: true }, cellContentMetadata: {} };
                async notebookToData(notebook) {
                    callCount += 1;
                    assert.strictEqual(notebook.cells[0].metadata.foo, 123);
                    assert.strictEqual(notebook.cells[0].metadata.bar, undefined);
                    return VSBuffer.fromString('');
                }
            });
            model.snapshot(CancellationToken.None);
            assert.strictEqual(callCount, 1);
        }
        { // NOT transient
            let callCount = 0;
            const model = new NotebookFileWorkingCopyModel(notebook, new class extends mock() {
                options = { transientOutputs: false, transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {} };
                async notebookToData(notebook) {
                    callCount += 1;
                    assert.strictEqual(notebook.cells[0].metadata.foo, 123);
                    assert.strictEqual(notebook.cells[0].metadata.bar, 456);
                    return VSBuffer.fromString('');
                }
            });
            model.snapshot(CancellationToken.None);
            assert.strictEqual(callCount, 1);
        }
    });
});
suite('ComplexNotebookEditorModel', function () {
    const notebokService = new class extends mock() {
    };
    const backupService = new class extends mock() {
    };
    const notificationService = new class extends mock() {
    };
    const untitledTextEditorService = new class extends mock() {
    };
    const fileService = new class extends mock() {
        onDidFilesChange = Event.None;
    };
    const labelService = new class extends mock() {
        getUriBasenameLabel(uri) { return uri.toString(); }
    };
    const notebookDataProvider = new class extends mock() {
    };
    test('working copy uri', function () {
        const r1 = URI.parse('foo-files:///my.nb');
        const r2 = URI.parse('bar-files:///my.nb');
        const copies = [];
        const workingCopyService = new class extends mock() {
            registerWorkingCopy(copy) {
                copies.push(copy);
                return Disposable.None;
            }
        };
        new ComplexNotebookEditorModel(r1, 'fff', notebookDataProvider, notebokService, workingCopyService, backupService, fileService, notificationService, new NullLogService(), untitledTextEditorService, labelService);
        new ComplexNotebookEditorModel(r2, 'fff', notebookDataProvider, notebokService, workingCopyService, backupService, fileService, notificationService, new NullLogService(), untitledTextEditorService, labelService);
        assert.strictEqual(copies.length, 2);
        assert.strictEqual(!isEqual(copies[0].resource, copies[1].resource), true);
    });
});
