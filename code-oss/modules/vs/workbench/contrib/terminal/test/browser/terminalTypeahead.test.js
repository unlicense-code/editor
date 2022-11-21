/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { stub, useFakeTimers } from 'sinon';
import { Emitter } from 'vs/base/common/event';
import { PredictionStats, TypeAheadAddon } from 'vs/workbench/contrib/terminal/browser/terminalTypeAheadAddon';
import { DEFAULT_LOCAL_ECHO_EXCLUDE } from 'vs/workbench/contrib/terminal/common/terminal';
const CSI = `\x1b[`;
var CursorMoveDirection;
(function (CursorMoveDirection) {
    CursorMoveDirection["Back"] = "D";
    CursorMoveDirection["Forwards"] = "C";
})(CursorMoveDirection || (CursorMoveDirection = {}));
suite('Workbench - Terminal Typeahead', () => {
    suite('PredictionStats', () => {
        let stats;
        const add = new Emitter();
        const succeed = new Emitter();
        const fail = new Emitter();
        setup(() => {
            stats = new PredictionStats({
                onPredictionAdded: add.event,
                onPredictionSucceeded: succeed.event,
                onPredictionFailed: fail.event,
            });
        });
        test('creates sane data', () => {
            const stubs = createPredictionStubs(5);
            const clock = useFakeTimers();
            try {
                for (const s of stubs) {
                    add.fire(s);
                }
                for (let i = 0; i < stubs.length; i++) {
                    clock.tick(100);
                    (i % 2 ? fail : succeed).fire(stubs[i]);
                }
                assert.strictEqual(stats.accuracy, 3 / 5);
                assert.strictEqual(stats.sampleSize, 5);
                assert.deepStrictEqual(stats.latency, {
                    count: 3,
                    min: 100,
                    max: 500,
                    median: 300
                });
            }
            finally {
                clock.restore();
            }
        });
        test('circular buffer', () => {
            const bufferSize = 24;
            const stubs = createPredictionStubs(bufferSize * 2);
            for (const s of stubs.slice(0, bufferSize)) {
                add.fire(s);
                succeed.fire(s);
            }
            assert.strictEqual(stats.accuracy, 1);
            for (const s of stubs.slice(bufferSize, bufferSize * 3 / 2)) {
                add.fire(s);
                fail.fire(s);
            }
            assert.strictEqual(stats.accuracy, 0.5);
            for (const s of stubs.slice(bufferSize * 3 / 2)) {
                add.fire(s);
                fail.fire(s);
            }
            assert.strictEqual(stats.accuracy, 0);
        });
    });
    suite('timeline', () => {
        const onBeforeProcessData = new Emitter();
        const onConfigChanged = new Emitter();
        let publicLog;
        let config;
        let addon;
        const predictedHelloo = [
            `${CSI}?25l`,
            `${CSI}2;7H`,
            'o',
            `${CSI}2;8H`,
            `${CSI}?25h`, // show cursor
        ].join('');
        const expectProcessed = (input, output) => {
            const evt = { data: input };
            onBeforeProcessData.fire(evt);
            assert.strictEqual(JSON.stringify(evt.data), JSON.stringify(output));
        };
        setup(() => {
            config = upcastPartial({
                localEchoStyle: 'italic',
                localEchoLatencyThreshold: 0,
                localEchoExcludePrograms: DEFAULT_LOCAL_ECHO_EXCLUDE,
            });
            publicLog = stub();
            addon = new TestTypeAheadAddon(upcastPartial({ onBeforeProcessData: onBeforeProcessData.event }), upcastPartial({ config, onConfigChanged: onConfigChanged.event }), upcastPartial({ publicLog }));
            addon.unlockMakingPredictions();
        });
        teardown(() => {
            addon.dispose();
        });
        test('predicts a single character', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('o');
            t.expectWritten(`${CSI}3mo${CSI}23m`);
        });
        test('validates character prediction', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('o');
            expectProcessed('o', predictedHelloo);
            assert.strictEqual(addon.stats?.accuracy, 1);
        });
        test('validates zsh prediction (#112842)', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('o');
            expectProcessed('o', predictedHelloo);
            t.onData('x');
            expectProcessed('\box', [
                `${CSI}?25l`,
                `${CSI}2;8H`,
                '\box',
                `${CSI}2;9H`,
                `${CSI}?25h`, // show cursor
            ].join(''));
            assert.strictEqual(addon.stats?.accuracy, 1);
        });
        test('does not validate zsh prediction on differing lookbehindn (#112842)', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('o');
            expectProcessed('o', predictedHelloo);
            t.onData('x');
            expectProcessed('\bqx', [
                `${CSI}?25l`,
                `${CSI}2;8H`,
                `${CSI}X`,
                `${CSI}0m`,
                '\bqx',
                `${CSI}?25h`, // show cursor
            ].join(''));
            assert.strictEqual(addon.stats?.accuracy, 0.5);
        });
        test('rolls back character prediction', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('o');
            expectProcessed('q', [
                `${CSI}?25l`,
                `${CSI}2;7H`,
                `${CSI}X`,
                `${CSI}0m`,
                'q',
                `${CSI}?25h`, // show cursor
            ].join(''));
            assert.strictEqual(addon.stats?.accuracy, 0);
        });
        test('handles left arrow when we hit the boundary', () => {
            const t = createMockTerminal({ lines: ['|'] });
            addon.activate(t.terminal);
            addon.unlockNavigating();
            const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
            t.onData(`${CSI}${"D" /* CursorMoveDirection.Back */}`);
            t.expectWritten('');
            // Trigger rollback because we don't expect this data
            onBeforeProcessData.fire({ data: 'xy' });
            assert.strictEqual(addon.physicalCursor(t.terminal.buffer.active)?.x, 
            // The cursor should not have changed because we've hit the
            // boundary (start of prompt)
            cursorXBefore);
        });
        test('handles right arrow when we hit the boundary', () => {
            const t = createMockTerminal({ lines: ['|'] });
            addon.activate(t.terminal);
            addon.unlockNavigating();
            const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
            t.onData(`${CSI}${"C" /* CursorMoveDirection.Forwards */}`);
            t.expectWritten('');
            // Trigger rollback because we don't expect this data
            onBeforeProcessData.fire({ data: 'xy' });
            assert.strictEqual(addon.physicalCursor(t.terminal.buffer.active)?.x, 
            // The cursor should not have changed because we've hit the
            // boundary (end of prompt)
            cursorXBefore);
        });
        test('internal cursor state is reset when all predictions are undone', () => {
            const t = createMockTerminal({ lines: ['|'] });
            addon.activate(t.terminal);
            addon.unlockNavigating();
            const cursorXBefore = addon.physicalCursor(t.terminal.buffer.active)?.x;
            t.onData(`${CSI}${"D" /* CursorMoveDirection.Back */}`);
            t.expectWritten('');
            addon.undoAllPredictions();
            assert.strictEqual(addon.physicalCursor(t.terminal.buffer.active)?.x, 
            // The cursor should not have changed because we've hit the
            // boundary (start of prompt)
            cursorXBefore);
        });
        test('restores cursor graphics mode', () => {
            const t = createMockTerminal({
                lines: ['hello|'],
                cursorAttrs: { isAttributeDefault: false, isBold: true, isFgPalette: true, getFgColor: 1 },
            });
            addon.activate(t.terminal);
            t.onData('o');
            expectProcessed('q', [
                `${CSI}?25l`,
                `${CSI}2;7H`,
                `${CSI}X`,
                `${CSI}1;38;5;1m`,
                'q',
                `${CSI}?25h`, // show cursor
            ].join(''));
            assert.strictEqual(addon.stats?.accuracy, 0);
        });
        test('validates against and applies graphics mode on predicted', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('o');
            expectProcessed(`${CSI}4mo`, [
                `${CSI}?25l`,
                `${CSI}2;7H`,
                `${CSI}4m`,
                'o',
                `${CSI}2;8H`,
                `${CSI}?25h`, // show cursor
            ].join(''));
            assert.strictEqual(addon.stats?.accuracy, 1);
        });
        test('ignores cursor hides or shows', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('o');
            expectProcessed(`${CSI}?25lo${CSI}?25h`, [
                `${CSI}?25l`,
                `${CSI}?25l`,
                `${CSI}2;7H`,
                'o',
                `${CSI}?25h`,
                `${CSI}2;8H`,
                `${CSI}?25h`, // show cursor
            ].join(''));
            assert.strictEqual(addon.stats?.accuracy, 1);
        });
        test('matches backspace at EOL (bash style)', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('\x7F');
            expectProcessed(`\b${CSI}K`, `\b${CSI}K`);
            assert.strictEqual(addon.stats?.accuracy, 1);
        });
        test('matches backspace at EOL (zsh style)', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('\x7F');
            expectProcessed('\b \b', '\b \b');
            assert.strictEqual(addon.stats?.accuracy, 1);
        });
        test('gradually matches backspace', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            t.onData('\x7F');
            expectProcessed('\b', '');
            expectProcessed(' \b', '\b \b');
            assert.strictEqual(addon.stats?.accuracy, 1);
        });
        test('restores old character after invalid backspace', () => {
            const t = createMockTerminal({ lines: ['hel|lo'] });
            addon.activate(t.terminal);
            addon.unlockNavigating();
            t.onData('\x7F');
            t.expectWritten(`${CSI}2;4H${CSI}X`);
            expectProcessed('x', `${CSI}?25l${CSI}0ml${CSI}2;5H${CSI}0mx${CSI}?25h`);
            assert.strictEqual(addon.stats?.accuracy, 0);
        });
        test('waits for validation before deleting to left of cursor', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            // initially should not backspace (until the server confirms it)
            t.onData('\x7F');
            t.expectWritten('');
            expectProcessed('\b \b', '\b \b');
            t.cursor.x--;
            // enter input on the column...
            t.onData('o');
            onBeforeProcessData.fire({ data: 'o' });
            t.cursor.x++;
            t.clearWritten();
            // now that the column is 'unlocked', we should be able to predict backspace on it
            t.onData('\x7F');
            t.expectWritten(`${CSI}2;6H${CSI}X`);
        });
        test('waits for first valid prediction on a line', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.lockMakingPredictions();
            addon.activate(t.terminal);
            t.onData('o');
            t.expectWritten('');
            expectProcessed('o', 'o');
            t.onData('o');
            t.expectWritten(`${CSI}3mo${CSI}23m`);
        });
        test('disables on title change', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.activate(t.terminal);
            addon.reevaluateNow();
            assert.strictEqual(addon.isShowing, true, 'expected to show initially');
            t.onTitleChange.fire('foo - VIM.exe');
            addon.reevaluateNow();
            assert.strictEqual(addon.isShowing, false, 'expected to hide when vim is open');
            t.onTitleChange.fire('foo - git.exe');
            addon.reevaluateNow();
            assert.strictEqual(addon.isShowing, true, 'expected to show again after vim closed');
        });
        test('adds line wrap prediction even if behind a boundary', () => {
            const t = createMockTerminal({ lines: ['hello|'] });
            addon.lockMakingPredictions();
            addon.activate(t.terminal);
            t.onData('hi'.repeat(50));
            t.expectWritten('');
            expectProcessed('hi', [
                `${CSI}?25l`,
                'hi',
                ...new Array(36).fill(`${CSI}3mh${CSI}23m${CSI}3mi${CSI}23m`),
                `${CSI}2;81H`,
                `${CSI}?25h`
            ].join(''));
        });
    });
});
class TestTypeAheadAddon extends TypeAheadAddon {
    unlockMakingPredictions() {
        this._lastRow = { y: 1, startingX: 100, endingX: 100, charState: 2 /* CharPredictState.Validated */ };
    }
    lockMakingPredictions() {
        this._lastRow = undefined;
    }
    unlockNavigating() {
        this._lastRow = { y: 1, startingX: 1, endingX: 1, charState: 2 /* CharPredictState.Validated */ };
    }
    reevaluateNow() {
        this._reevaluatePredictorStateNow(this.stats, this._timeline);
    }
    get isShowing() {
        return !!this._timeline?.isShowingPredictions;
    }
    undoAllPredictions() {
        this._timeline?.undoAllPredictions();
    }
    physicalCursor(buffer) {
        return this._timeline?.physicalCursor(buffer);
    }
    tentativeCursor(buffer) {
        return this._timeline?.tentativeCursor(buffer);
    }
}
function upcastPartial(v) {
    return v;
}
function createPredictionStubs(n) {
    return new Array(n).fill(0).map(stubPrediction);
}
function stubPrediction() {
    return {
        apply: () => '',
        rollback: () => '',
        matches: () => 0,
        rollForwards: () => '',
    };
}
function createMockTerminal({ lines, cursorAttrs }) {
    const written = [];
    const cursor = { y: 1, x: 1 };
    const onTitleChange = new Emitter();
    const onData = new Emitter();
    const csiEmitter = new Emitter();
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        if (line.includes('|')) {
            cursor.y = y + 1;
            cursor.x = line.indexOf('|') + 1;
            lines[y] = line.replace('|', '');
            break;
        }
    }
    return {
        written,
        cursor,
        expectWritten: (s) => {
            assert.strictEqual(JSON.stringify(written.join('')), JSON.stringify(s));
            written.splice(0, written.length);
        },
        clearWritten: () => written.splice(0, written.length),
        onData: (s) => onData.fire(s),
        csiEmitter,
        onTitleChange,
        terminal: {
            cols: 80,
            rows: 5,
            onResize: new Emitter().event,
            onData: onData.event,
            onTitleChange: onTitleChange.event,
            parser: {
                registerCsiHandler(_, callback) {
                    csiEmitter.event(callback);
                },
            },
            write(line) {
                written.push(line);
            },
            _core: {
                _inputHandler: {
                    _curAttrData: mockCell('', cursorAttrs)
                },
                writeSync() {
                }
            },
            buffer: {
                active: {
                    type: 'normal',
                    baseY: 0,
                    get cursorY() { return cursor.y; },
                    get cursorX() { return cursor.x; },
                    getLine(y) {
                        const s = lines[y - 1] || '';
                        return {
                            length: s.length,
                            getCell: (x) => mockCell(s[x - 1] || ''),
                            translateToString: (trim, start = 0, end = s.length) => {
                                const out = s.slice(start, end);
                                return trim ? out.trimRight() : out;
                            },
                        };
                    },
                }
            }
        }
    };
}
function mockCell(char, attrs = {}) {
    return new Proxy({}, {
        get(_, prop) {
            if (typeof prop === 'string' && attrs.hasOwnProperty(prop)) {
                return () => attrs[prop];
            }
            switch (prop) {
                case 'getWidth':
                    return () => 1;
                case 'getChars':
                    return () => char;
                case 'getCode':
                    return () => char.charCodeAt(0) || 0;
                case 'isAttributeDefault':
                    return () => true;
                default:
                    return String(prop).startsWith('is') ? (() => false) : (() => 0);
            }
        },
    });
}
