/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { deepStrictEqual } from 'assert';
import { timeout } from 'vs/base/common/async';
import { PartialCommandDetectionCapability } from 'vs/platform/terminal/common/capabilities/partialCommandDetectionCapability';
import { Terminal } from 'xterm';
async function writeP(terminal, data) {
    return new Promise((resolve, reject) => {
        const failTimeout = timeout(2000);
        failTimeout.then(() => reject('Writing to xterm is taking longer than 2 seconds'));
        terminal.write(data, () => {
            failTimeout.cancel();
            resolve();
        });
    });
}
suite('PartialCommandDetectionCapability', () => {
    let xterm;
    let capability;
    let addEvents;
    function assertCommands(expectedLines) {
        deepStrictEqual(capability.commands.map(e => e.line), expectedLines);
        deepStrictEqual(addEvents.map(e => e.line), expectedLines);
    }
    setup(() => {
        xterm = new Terminal({ allowProposedApi: true, cols: 80 });
        capability = new PartialCommandDetectionCapability(xterm);
        addEvents = [];
        capability.onCommandFinished(e => addEvents.push(e));
    });
    test('should not add commands when the cursor position is too close to the left side', async () => {
        assertCommands([]);
        xterm._core._onData.fire('\x0d');
        await writeP(xterm, '\r\n');
        assertCommands([]);
        await writeP(xterm, 'a');
        xterm._core._onData.fire('\x0d');
        await writeP(xterm, '\r\n');
        assertCommands([]);
    });
    test('should add commands when the cursor position is not too close to the left side', async () => {
        assertCommands([]);
        await writeP(xterm, 'ab');
        xterm._core._onData.fire('\x0d');
        await writeP(xterm, '\r\n\r\n');
        assertCommands([0]);
        await writeP(xterm, 'cd');
        xterm._core._onData.fire('\x0d');
        await writeP(xterm, '\r\n');
        assertCommands([0, 2]);
    });
});
