/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ITerminalProfileResolverService } from 'vs/workbench/contrib/terminal/common/terminal';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { BrowserTerminalProfileResolverService } from 'vs/workbench/contrib/terminal/browser/terminalProfileResolverService';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
registerSingleton(ITerminalProfileResolverService, BrowserTerminalProfileResolverService, 1 /* InstantiationType.Delayed */);
// Register standard external terminal keybinding as integrated terminal when in web as the
// external terminal is not available
KeybindingsRegistry.registerKeybindingRule({
    id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: TerminalContextKeys.notFocus,
    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */
});
