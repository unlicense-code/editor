/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { findExpressionInStackFrame } from 'vs/workbench/contrib/debug/browser/debugHover';
import { createTestSession } from 'vs/workbench/contrib/debug/test/browser/callStack.test';
import { StackFrame, Thread, Scope, Variable } from 'vs/workbench/contrib/debug/common/debugModel';
import { Source } from 'vs/workbench/contrib/debug/common/debugSource';
import { createMockDebugModel, mockUriIdentityService } from 'vs/workbench/contrib/debug/test/browser/mockDebugModel';
suite('Debug - Hover', () => {
    test('find expression in stack frame', async () => {
        const model = createMockDebugModel();
        const session = createTestSession(model);
        const thread = new class extends Thread {
            getCallStack() {
                return [stackFrame];
            }
        }(session, 'mockthread', 1);
        const firstSource = new Source({
            name: 'internalModule.js',
            path: 'a/b/c/d/internalModule.js',
            sourceReference: 10,
        }, 'aDebugSessionId', mockUriIdentityService);
        const stackFrame = new class extends StackFrame {
            getScopes() {
                return Promise.resolve([scope]);
            }
        }(thread, 1, firstSource, 'app.js', 'normal', { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 10 }, 1, true);
        const scope = new class extends Scope {
            getChildren() {
                return Promise.resolve([variableA]);
            }
        }(stackFrame, 1, 'local', 1, false, 10, 10);
        const variableA = new class extends Variable {
            getChildren() {
                return Promise.resolve([variableB]);
            }
        }(session, 1, scope, 2, 'A', 'A', undefined, 0, 0, undefined, {}, 'string');
        const variableB = new Variable(session, 1, scope, 2, 'B', 'A.B', undefined, 0, 0, undefined, {}, 'string');
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, []), undefined);
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, ['A']), variableA);
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, ['doesNotExist', 'no']), undefined);
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, ['a']), undefined);
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, ['B']), undefined);
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, ['A', 'B']), variableB);
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, ['A', 'C']), undefined);
        // We do not search in expensive scopes
        scope.expensive = true;
        assert.strictEqual(await findExpressionInStackFrame(stackFrame, ['A']), undefined);
    });
});
