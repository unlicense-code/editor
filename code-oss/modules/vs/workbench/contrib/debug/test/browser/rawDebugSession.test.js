/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { mock, mockObject } from 'vs/base/test/common/mock';
import { RawDebugSession } from 'vs/workbench/contrib/debug/browser/rawDebugSession';
import { MockDebugAdapter } from 'vs/workbench/contrib/debug/test/common/mockDebug';
suite('RawDebugSession', () => {
    function createTestObjects() {
        const debugAdapter = new MockDebugAdapter();
        const dbgr = mockObject()({
            type: 'mock-debug'
        });
        new RawDebugSession(debugAdapter, dbgr, 'sessionId', 'name', new (mock()), new (mock()), new (mock()), new (mock()));
        return { debugAdapter, dbgr };
    }
    test('handles startDebugging request success', async () => {
        const { debugAdapter, dbgr } = createTestObjects();
        dbgr.startDebugging.returns(Promise.resolve(true));
        debugAdapter.sendRequestBody('startDebugging', {
            request: 'launch',
            configuration: {
                type: 'some-other-type'
            }
        });
        const response = await debugAdapter.waitForResponseFromClient('startDebugging');
        assert.strictEqual(response.command, 'startDebugging');
        assert.strictEqual(response.success, true);
    });
    test('handles startDebugging request failure', async () => {
        const { debugAdapter, dbgr } = createTestObjects();
        dbgr.startDebugging.returns(Promise.resolve(false));
        debugAdapter.sendRequestBody('startDebugging', {
            request: 'launch',
            configuration: {
                type: 'some-other-type'
            }
        });
        const response = await debugAdapter.waitForResponseFromClient('startDebugging');
        assert.strictEqual(response.command, 'startDebugging');
        assert.strictEqual(response.success, false);
    });
});
