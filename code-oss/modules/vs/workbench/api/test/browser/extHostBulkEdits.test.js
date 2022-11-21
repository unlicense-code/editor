/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import * as extHostTypes from 'vs/workbench/api/common/extHostTypes';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { URI } from 'vs/base/common/uri';
import { mock } from 'vs/base/test/common/mock';
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { SingleProxyRPCProtocol, TestRPCProtocol } from 'vs/workbench/api/test/common/testRPCProtocol';
import { NullLogService } from 'vs/platform/log/common/log';
import { ExtHostBulkEdits } from 'vs/workbench/api/common/extHostBulkEdits';
import { nullExtensionDescription } from 'vs/workbench/services/extensions/common/extensions';
suite('ExtHostBulkEdits.applyWorkspaceEdit', () => {
    const resource = URI.parse('foo:bar');
    let bulkEdits;
    let workspaceResourceEdits;
    setup(() => {
        workspaceResourceEdits = null;
        const rpcProtocol = new TestRPCProtocol();
        rpcProtocol.set(MainContext.MainThreadBulkEdits, new class extends mock() {
            $tryApplyWorkspaceEdit(_workspaceResourceEdits) {
                workspaceResourceEdits = _workspaceResourceEdits;
                return Promise.resolve(true);
            }
        });
        const documentsAndEditors = new ExtHostDocumentsAndEditors(SingleProxyRPCProtocol(null), new NullLogService());
        documentsAndEditors.$acceptDocumentsAndEditorsDelta({
            addedDocuments: [{
                    isDirty: false,
                    languageId: 'foo',
                    uri: resource,
                    versionId: 1337,
                    lines: ['foo'],
                    EOL: '\n',
                }]
        });
        bulkEdits = new ExtHostBulkEdits(rpcProtocol, documentsAndEditors);
    });
    test('uses version id if document available', async () => {
        const edit = new extHostTypes.WorkspaceEdit();
        edit.replace(resource, new extHostTypes.Range(0, 0, 0, 0), 'hello');
        await bulkEdits.applyWorkspaceEdit(edit, nullExtensionDescription, undefined);
        assert.strictEqual(workspaceResourceEdits.edits.length, 1);
        const [first] = workspaceResourceEdits.edits;
        assert.strictEqual(first.versionId, 1337);
    });
    test('does not use version id if document is not available', async () => {
        const edit = new extHostTypes.WorkspaceEdit();
        edit.replace(URI.parse('foo:bar2'), new extHostTypes.Range(0, 0, 0, 0), 'hello');
        await bulkEdits.applyWorkspaceEdit(edit, nullExtensionDescription, undefined);
        assert.strictEqual(workspaceResourceEdits.edits.length, 1);
        const [first] = workspaceResourceEdits.edits;
        assert.ok(typeof first.versionId === 'undefined');
    });
});
