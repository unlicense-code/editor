/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { deepStrictEqual, strictEqual } from 'assert';
import { DEFAULT_TERMINAL_OSX } from 'vs/platform/externalTerminal/common/externalTerminal';
import { LinuxExternalTerminalService, MacExternalTerminalService, WindowsExternalTerminalService } from 'vs/platform/externalTerminal/node/externalTerminalService';
const mockConfig = Object.freeze({
    terminal: {
        explorerKind: 'external',
        external: {
            windowsExec: 'testWindowsShell',
            osxExec: 'testOSXShell',
            linuxExec: 'testLinuxShell'
        }
    }
});
suite('ExternalTerminalService', () => {
    test(`WinTerminalService - uses terminal from configuration`, done => {
        const testShell = 'cmd';
        const testCwd = 'path/to/workspace';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                strictEqual(command, testShell, 'shell should equal expected');
                strictEqual(args[args.length - 1], mockConfig.terminal.external.windowsExec);
                strictEqual(opts.cwd, testCwd);
                done();
                return {
                    on: (evt) => evt
                };
            }
        };
        const testService = new WindowsExternalTerminalService();
        testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
    });
    test(`WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined`, done => {
        const testShell = 'cmd';
        const testCwd = 'path/to/workspace';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                strictEqual(args[args.length - 1], WindowsExternalTerminalService.getDefaultTerminalWindows());
                done();
                return {
                    on: (evt) => evt
                };
            }
        };
        mockConfig.terminal.external.windowsExec = undefined;
        const testService = new WindowsExternalTerminalService();
        testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
    });
    test(`WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined`, done => {
        const testShell = 'cmd';
        const testCwd = 'c:/foo';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                strictEqual(opts.cwd, 'C:/foo', 'cwd should be uppercase regardless of the case that\'s passed in');
                done();
                return {
                    on: (evt) => evt
                };
            }
        };
        const testService = new WindowsExternalTerminalService();
        testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
    });
    test(`WinTerminalService - cmder should be spawned differently`, done => {
        const testShell = 'cmd';
        const testCwd = 'c:/foo';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                deepStrictEqual(args, ['C:/foo']);
                strictEqual(opts, undefined);
                done();
                return { on: (evt) => evt };
            }
        };
        const testService = new WindowsExternalTerminalService();
        testService.spawnTerminal(mockSpawner, { windowsExec: 'cmder' }, testShell, testCwd);
    });
    test(`WinTerminalService - windows terminal should open workspace directory`, done => {
        const testShell = 'wt';
        const testCwd = 'c:/foo';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                strictEqual(opts.cwd, 'C:/foo');
                done();
                return { on: (evt) => evt };
            }
        };
        const testService = new WindowsExternalTerminalService();
        testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testShell, testCwd);
    });
    test(`MacTerminalService - uses terminal from configuration`, done => {
        const testCwd = 'path/to/workspace';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                strictEqual(args[1], mockConfig.terminal.external.osxExec);
                done();
                return {
                    on: (evt) => evt
                };
            }
        };
        const testService = new MacExternalTerminalService();
        testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
    });
    test(`MacTerminalService - uses default terminal when configuration.terminal.external.osxExec is undefined`, done => {
        const testCwd = 'path/to/workspace';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                strictEqual(args[1], DEFAULT_TERMINAL_OSX);
                done();
                return {
                    on: (evt) => evt
                };
            }
        };
        const testService = new MacExternalTerminalService();
        testService.spawnTerminal(mockSpawner, { osxExec: undefined }, testCwd);
    });
    test(`LinuxTerminalService - uses terminal from configuration`, done => {
        const testCwd = 'path/to/workspace';
        const mockSpawner = {
            spawn: (command, args, opts) => {
                strictEqual(command, mockConfig.terminal.external.linuxExec);
                strictEqual(opts.cwd, testCwd);
                done();
                return {
                    on: (evt) => evt
                };
            }
        };
        const testService = new LinuxExternalTerminalService();
        testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
    });
    test(`LinuxTerminalService - uses default terminal when configuration.terminal.external.linuxExec is undefined`, done => {
        LinuxExternalTerminalService.getDefaultTerminalLinuxReady().then(defaultTerminalLinux => {
            const testCwd = 'path/to/workspace';
            const mockSpawner = {
                spawn: (command, args, opts) => {
                    strictEqual(command, defaultTerminalLinux);
                    done();
                    return {
                        on: (evt) => evt
                    };
                }
            };
            mockConfig.terminal.external.linuxExec = undefined;
            const testService = new LinuxExternalTerminalService();
            testService.spawnTerminal(mockSpawner, mockConfig.terminal.external, testCwd);
        });
    });
});
