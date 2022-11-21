/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Terminal } from 'xterm';
import { XtermTerminal } from 'vs/workbench/contrib/terminal/browser/xterm/xtermTerminal';
import { TerminalConfigHelper } from 'vs/workbench/contrib/terminal/browser/terminalConfigHelper';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { TERMINAL_VIEW_ID } from 'vs/workbench/contrib/terminal/common/terminal';
import { deepStrictEqual, strictEqual } from 'assert';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { TestColorTheme, TestThemeService } from 'vs/platform/theme/test/common/testThemeService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { Emitter } from 'vs/base/common/event';
import { TERMINAL_BACKGROUND_COLOR, TERMINAL_FOREGROUND_COLOR, TERMINAL_CURSOR_FOREGROUND_COLOR, TERMINAL_CURSOR_BACKGROUND_COLOR, TERMINAL_SELECTION_BACKGROUND_COLOR, TERMINAL_SELECTION_FOREGROUND_COLOR, TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR } from 'vs/workbench/contrib/terminal/common/terminalColorRegistry';
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from 'vs/workbench/common/theme';
import { ILogService, NullLogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { TestStorageService } from 'vs/workbench/test/common/workbenchTestServices';
import { isSafari } from 'vs/base/browser/browser';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { TerminalCapabilityStore } from 'vs/platform/terminal/common/capabilities/terminalCapabilityStore';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ContextMenuService } from 'vs/platform/contextview/browser/contextMenuService';
import { TestLifecycleService } from 'vs/workbench/test/browser/workbenchTestServices';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
class TestWebglAddon {
    static shouldThrow = false;
    static isEnabled = false;
    onChangeTextureAtlas = new Emitter().event;
    onContextLoss = new Emitter().event;
    activate() {
        TestWebglAddon.isEnabled = !TestWebglAddon.shouldThrow;
        if (TestWebglAddon.shouldThrow) {
            throw new Error('Test webgl set to throw');
        }
    }
    dispose() {
        TestWebglAddon.isEnabled = false;
    }
    clearTextureAtlas() { }
}
class TestXtermTerminal extends XtermTerminal {
    webglAddonPromise = Promise.resolve(TestWebglAddon);
    // Force synchronous to avoid async when activating the addon
    _getWebglAddonConstructor() {
        return this.webglAddonPromise;
    }
}
export class TestViewDescriptorService {
    _location = 1 /* ViewContainerLocation.Panel */;
    _onDidChangeLocation = new Emitter();
    onDidChangeLocation = this._onDidChangeLocation.event;
    getViewLocationById(id) {
        return this._location;
    }
    moveTerminalToLocation(to) {
        const oldLocation = this._location;
        this._location = to;
        this._onDidChangeLocation.fire({
            views: [
                { id: TERMINAL_VIEW_ID }
            ],
            from: oldLocation,
            to
        });
    }
}
const defaultTerminalConfig = {
    fontFamily: 'monospace',
    fontWeight: 'normal',
    fontWeightBold: 'normal',
    gpuAcceleration: 'off',
    scrollback: 1000,
    fastScrollSensitivity: 2,
    mouseWheelScrollSensitivity: 1,
    unicodeVersion: '6'
};
suite('XtermTerminal', () => {
    let instantiationService;
    let configurationService;
    let themeService;
    let viewDescriptorService;
    let xterm;
    let configHelper;
    setup(() => {
        configurationService = new TestConfigurationService({
            editor: {
                fastScrollSensitivity: 2,
                mouseWheelScrollSensitivity: 1
            },
            terminal: {
                integrated: defaultTerminalConfig
            }
        });
        themeService = new TestThemeService();
        viewDescriptorService = new TestViewDescriptorService();
        instantiationService = new TestInstantiationService();
        instantiationService.stub(IConfigurationService, configurationService);
        instantiationService.stub(ILogService, new NullLogService());
        instantiationService.stub(IStorageService, new TestStorageService());
        instantiationService.stub(IThemeService, themeService);
        instantiationService.stub(IViewDescriptorService, viewDescriptorService);
        instantiationService.stub(IContextMenuService, instantiationService.createInstance(ContextMenuService));
        instantiationService.stub(ILifecycleService, new TestLifecycleService());
        configHelper = instantiationService.createInstance(TerminalConfigHelper);
        xterm = instantiationService.createInstance(TestXtermTerminal, Terminal, configHelper, 80, 30, TerminalLocation.Panel, new TerminalCapabilityStore(), true);
        TestWebglAddon.shouldThrow = false;
        TestWebglAddon.isEnabled = false;
    });
    test('should use fallback dimensions of 80x30', () => {
        strictEqual(xterm.raw.cols, 80);
        strictEqual(xterm.raw.rows, 30);
    });
    suite('theme', () => {
        test('should apply correct background color based on the current view', () => {
            themeService.setTheme(new TestColorTheme({
                [PANEL_BACKGROUND]: '#ff0000',
                [SIDE_BAR_BACKGROUND]: '#00ff00'
            }));
            xterm = instantiationService.createInstance(XtermTerminal, Terminal, configHelper, 80, 30, TerminalLocation.Panel, new TerminalCapabilityStore(), true);
            strictEqual(xterm.raw.options.theme?.background, '#ff0000');
            viewDescriptorService.moveTerminalToLocation(0 /* ViewContainerLocation.Sidebar */);
            strictEqual(xterm.raw.options.theme?.background, '#00ff00');
            viewDescriptorService.moveTerminalToLocation(1 /* ViewContainerLocation.Panel */);
            strictEqual(xterm.raw.options.theme?.background, '#ff0000');
            viewDescriptorService.moveTerminalToLocation(2 /* ViewContainerLocation.AuxiliaryBar */);
            strictEqual(xterm.raw.options.theme?.background, '#00ff00');
        });
        test('should react to and apply theme changes', () => {
            themeService.setTheme(new TestColorTheme({
                [TERMINAL_BACKGROUND_COLOR]: '#000100',
                [TERMINAL_FOREGROUND_COLOR]: '#000200',
                [TERMINAL_CURSOR_FOREGROUND_COLOR]: '#000300',
                [TERMINAL_CURSOR_BACKGROUND_COLOR]: '#000400',
                [TERMINAL_SELECTION_BACKGROUND_COLOR]: '#000500',
                [TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR]: '#000600',
                [TERMINAL_SELECTION_FOREGROUND_COLOR]: undefined,
                'terminal.ansiBlack': '#010000',
                'terminal.ansiRed': '#020000',
                'terminal.ansiGreen': '#030000',
                'terminal.ansiYellow': '#040000',
                'terminal.ansiBlue': '#050000',
                'terminal.ansiMagenta': '#060000',
                'terminal.ansiCyan': '#070000',
                'terminal.ansiWhite': '#080000',
                'terminal.ansiBrightBlack': '#090000',
                'terminal.ansiBrightRed': '#100000',
                'terminal.ansiBrightGreen': '#110000',
                'terminal.ansiBrightYellow': '#120000',
                'terminal.ansiBrightBlue': '#130000',
                'terminal.ansiBrightMagenta': '#140000',
                'terminal.ansiBrightCyan': '#150000',
                'terminal.ansiBrightWhite': '#160000',
            }));
            xterm = instantiationService.createInstance(XtermTerminal, Terminal, configHelper, 80, 30, TerminalLocation.Panel, new TerminalCapabilityStore(), true);
            deepStrictEqual(xterm.raw.options.theme, {
                background: '#000100',
                foreground: '#000200',
                cursor: '#000300',
                cursorAccent: '#000400',
                selectionBackground: '#000500',
                selectionInactiveBackground: '#000600',
                selectionForeground: undefined,
                black: '#010000',
                green: '#030000',
                red: '#020000',
                yellow: '#040000',
                blue: '#050000',
                magenta: '#060000',
                cyan: '#070000',
                white: '#080000',
                brightBlack: '#090000',
                brightRed: '#100000',
                brightGreen: '#110000',
                brightYellow: '#120000',
                brightBlue: '#130000',
                brightMagenta: '#140000',
                brightCyan: '#150000',
                brightWhite: '#160000',
            });
            themeService.setTheme(new TestColorTheme({
                [TERMINAL_BACKGROUND_COLOR]: '#00010f',
                [TERMINAL_FOREGROUND_COLOR]: '#00020f',
                [TERMINAL_CURSOR_FOREGROUND_COLOR]: '#00030f',
                [TERMINAL_CURSOR_BACKGROUND_COLOR]: '#00040f',
                [TERMINAL_SELECTION_BACKGROUND_COLOR]: '#00050f',
                [TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR]: '#00060f',
                [TERMINAL_SELECTION_FOREGROUND_COLOR]: '#00070f',
                'terminal.ansiBlack': '#01000f',
                'terminal.ansiRed': '#02000f',
                'terminal.ansiGreen': '#03000f',
                'terminal.ansiYellow': '#04000f',
                'terminal.ansiBlue': '#05000f',
                'terminal.ansiMagenta': '#06000f',
                'terminal.ansiCyan': '#07000f',
                'terminal.ansiWhite': '#08000f',
                'terminal.ansiBrightBlack': '#09000f',
                'terminal.ansiBrightRed': '#10000f',
                'terminal.ansiBrightGreen': '#11000f',
                'terminal.ansiBrightYellow': '#12000f',
                'terminal.ansiBrightBlue': '#13000f',
                'terminal.ansiBrightMagenta': '#14000f',
                'terminal.ansiBrightCyan': '#15000f',
                'terminal.ansiBrightWhite': '#16000f',
            }));
            deepStrictEqual(xterm.raw.options.theme, {
                background: '#00010f',
                foreground: '#00020f',
                cursor: '#00030f',
                cursorAccent: '#00040f',
                selectionBackground: '#00050f',
                selectionInactiveBackground: '#00060f',
                selectionForeground: '#00070f',
                black: '#01000f',
                green: '#03000f',
                red: '#02000f',
                yellow: '#04000f',
                blue: '#05000f',
                magenta: '#06000f',
                cyan: '#07000f',
                white: '#08000f',
                brightBlack: '#09000f',
                brightRed: '#10000f',
                brightGreen: '#11000f',
                brightYellow: '#12000f',
                brightBlue: '#13000f',
                brightMagenta: '#14000f',
                brightCyan: '#15000f',
                brightWhite: '#16000f',
            });
        });
    });
    suite('renderers', () => {
        test('should re-evaluate gpu acceleration auto when the setting is changed', async () => {
            // Check initial state
            strictEqual(TestWebglAddon.isEnabled, false);
            // Open xterm as otherwise the webgl addon won't activate
            const container = document.createElement('div');
            xterm.raw.open(container);
            // Auto should activate the webgl addon
            await configurationService.setUserConfiguration('terminal', { integrated: { ...defaultTerminalConfig, gpuAcceleration: 'auto' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await xterm.webglAddonPromise; // await addon activate
            if (isSafari) {
                strictEqual(TestWebglAddon.isEnabled, false, 'The webgl renderer is always disabled on Safari');
            }
            else {
                strictEqual(TestWebglAddon.isEnabled, true);
            }
            // Turn off to reset state
            await configurationService.setUserConfiguration('terminal', { integrated: { ...defaultTerminalConfig, gpuAcceleration: 'off' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await xterm.webglAddonPromise; // await addon activate
            strictEqual(TestWebglAddon.isEnabled, false);
            // Set to auto again but throw when activating the webgl addon
            TestWebglAddon.shouldThrow = true;
            await configurationService.setUserConfiguration('terminal', { integrated: { ...defaultTerminalConfig, gpuAcceleration: 'auto' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await xterm.webglAddonPromise; // await addon activate
            strictEqual(TestWebglAddon.isEnabled, false);
        });
    });
});
