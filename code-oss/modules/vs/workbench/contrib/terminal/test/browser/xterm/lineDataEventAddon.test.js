/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Terminal } from 'xterm';
import { LineDataEventAddon } from 'vs/workbench/contrib/terminal/browser/xterm/lineDataEventAddon';
import { deepStrictEqual } from 'assert';
import { timeout } from 'vs/base/common/async';
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
suite('LineDataEventAddon', () => {
    let xterm;
    let lineDataEventAddon;
    suite('onLineData', () => {
        let events;
        setup(() => {
            xterm = new Terminal({ allowProposedApi: true, cols: 4 });
            lineDataEventAddon = new LineDataEventAddon();
            xterm.loadAddon(lineDataEventAddon);
            events = [];
            lineDataEventAddon.onLineData(e => events.push(e));
        });
        test('should fire when a non-wrapped line ends with a line feed', async () => {
            await writeP(xterm, 'foo');
            deepStrictEqual(events, []);
            await writeP(xterm, '\n\r');
            deepStrictEqual(events, ['foo']);
            await writeP(xterm, 'bar');
            deepStrictEqual(events, ['foo']);
            await writeP(xterm, '\n');
            deepStrictEqual(events, ['foo', 'bar']);
        });
        test('should not fire soft wrapped lines', async () => {
            await writeP(xterm, 'foo.');
            deepStrictEqual(events, []);
            await writeP(xterm, 'bar.');
            deepStrictEqual(events, []);
            await writeP(xterm, 'baz.');
            deepStrictEqual(events, []);
        });
        test('should fire when a wrapped line ends with a line feed', async () => {
            await writeP(xterm, 'foo.bar.baz.');
            deepStrictEqual(events, []);
            await writeP(xterm, '\n\r');
            deepStrictEqual(events, ['foo.bar.baz.']);
        });
        test('should not fire on cursor move when the backing process is not on Windows', async () => {
            await writeP(xterm, 'foo.\x1b[H');
            deepStrictEqual(events, []);
        });
        test('should fire on cursor move when the backing process is on Windows', async () => {
            lineDataEventAddon.setOperatingSystem(1 /* OperatingSystem.Windows */);
            await writeP(xterm, 'foo\x1b[H');
            deepStrictEqual(events, ['foo']);
        });
    });
});
