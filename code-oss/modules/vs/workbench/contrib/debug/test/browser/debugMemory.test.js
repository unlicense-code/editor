/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { decodeBase64, encodeBase64, VSBuffer } from 'vs/base/common/buffer';
import { Emitter } from 'vs/base/common/event';
import { mockObject } from 'vs/base/test/common/mock';
import { MemoryRegion } from 'vs/workbench/contrib/debug/common/debugModel';
suite('Debug - Memory', () => {
    const dapResponseCommon = {
        command: 'someCommand',
        type: 'response',
        seq: 1,
        request_seq: 1,
        success: true,
    };
    suite('MemoryRegion', () => {
        let memory;
        let unreadable;
        let invalidateMemoryEmitter;
        let session;
        let region;
        setup(() => {
            const memoryBuf = new Uint8Array(1024);
            for (let i = 0; i < memoryBuf.length; i++) {
                memoryBuf[i] = i; // will be 0-255
            }
            memory = VSBuffer.wrap(memoryBuf);
            invalidateMemoryEmitter = new Emitter();
            unreadable = 0;
            session = mockObject()({
                onDidInvalidateMemory: invalidateMemoryEmitter.event
            });
            session.readMemory.callsFake((ref, fromOffset, count) => {
                const res = ({
                    ...dapResponseCommon,
                    body: {
                        address: '0',
                        data: encodeBase64(memory.slice(fromOffset, fromOffset + Math.max(0, count - unreadable))),
                        unreadableBytes: unreadable
                    }
                });
                unreadable = 0;
                return Promise.resolve(res);
            });
            session.writeMemory.callsFake((ref, fromOffset, data) => {
                const decoded = decodeBase64(data);
                for (let i = 0; i < decoded.byteLength; i++) {
                    memory.buffer[fromOffset + i] = decoded.buffer[i];
                }
                return ({
                    ...dapResponseCommon,
                    body: {
                        bytesWritten: decoded.byteLength,
                        offset: fromOffset,
                    }
                });
            });
            region = new MemoryRegion('ref', session);
        });
        teardown(() => {
            region.dispose();
        });
        test('reads a simple range', async () => {
            assert.deepStrictEqual(await region.read(10, 14), [
                { type: 0 /* MemoryRangeType.Valid */, offset: 10, length: 4, data: VSBuffer.wrap(new Uint8Array([10, 11, 12, 13])) }
            ]);
        });
        test('reads a non-contiguous range', async () => {
            unreadable = 3;
            assert.deepStrictEqual(await region.read(10, 14), [
                { type: 0 /* MemoryRangeType.Valid */, offset: 10, length: 1, data: VSBuffer.wrap(new Uint8Array([10])) },
                { type: 1 /* MemoryRangeType.Unreadable */, offset: 11, length: 3 },
            ]);
        });
    });
});
