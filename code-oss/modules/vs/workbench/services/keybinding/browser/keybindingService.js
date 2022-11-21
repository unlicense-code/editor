/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as nls from 'vs/nls';
import * as browser from 'vs/base/browser/browser';
import * as dom from 'vs/base/browser/dom';
import { printKeyboardEvent, printStandardKeyboardEvent, StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { Emitter, Event } from 'vs/base/common/event';
import { ScanCodeUtils, IMMUTABLE_CODE_TO_KEY_CODE, KeyCodeUtils } from 'vs/base/common/keyCodes';
import { SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { KeybindingParser } from 'vs/base/common/keybindingParser';
import { OS, isMacintosh } from 'vs/base/common/platform';
import { ICommandService, CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as ConfigExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Extensions } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { AbstractKeybindingService } from 'vs/platform/keybinding/common/abstractKeybindingService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { KeybindingResolver } from 'vs/platform/keybinding/common/keybindingResolver';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Registry } from 'vs/platform/registry/common/platform';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { KeybindingIO, OutputBuilder } from 'vs/workbench/services/keybinding/common/keybindingIO';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { MenuRegistry } from 'vs/platform/actions/common/actions';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { commandsExtensionPoint } from 'vs/workbench/services/actions/common/menusExtensionPoint';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { RunOnceScheduler } from 'vs/base/common/async';
import { IFileService } from 'vs/platform/files/common/files';
import { parse } from 'vs/base/common/json';
import * as objects from 'vs/base/common/objects';
import { IKeyboardLayoutService } from 'vs/platform/keyboardLayout/common/keyboardLayout';
import { getDispatchConfig } from 'vs/platform/keyboardLayout/common/dispatchConfig';
import { flatten } from 'vs/base/common/arrays';
import { BrowserFeatures } from 'vs/base/browser/canIUse';
import { ILogService } from 'vs/platform/log/common/log';
import { dirname } from 'vs/base/common/resources';
import { getAllUnboundCommands } from 'vs/workbench/services/keybinding/browser/unboundCommands';
import { UserSettingsLabelProvider } from 'vs/base/common/keybindingLabels';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
function isContributedKeyBindingsArray(thing) {
    return Array.isArray(thing);
}
function isValidContributedKeyBinding(keyBinding, rejects) {
    if (!keyBinding) {
        rejects.push(nls.localize('nonempty', "expected non-empty value."));
        return false;
    }
    if (typeof keyBinding.command !== 'string') {
        rejects.push(nls.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
        return false;
    }
    if (keyBinding.key && typeof keyBinding.key !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'key'));
        return false;
    }
    if (keyBinding.when && typeof keyBinding.when !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
        return false;
    }
    if (keyBinding.mac && typeof keyBinding.mac !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'mac'));
        return false;
    }
    if (keyBinding.linux && typeof keyBinding.linux !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'linux'));
        return false;
    }
    if (keyBinding.win && typeof keyBinding.win !== 'string') {
        rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'win'));
        return false;
    }
    return true;
}
const keybindingType = {
    type: 'object',
    default: { command: '', key: '' },
    properties: {
        command: {
            description: nls.localize('vscode.extension.contributes.keybindings.command', 'Identifier of the command to run when keybinding is triggered.'),
            type: 'string'
        },
        args: {
            description: nls.localize('vscode.extension.contributes.keybindings.args', "Arguments to pass to the command to execute.")
        },
        key: {
            description: nls.localize('vscode.extension.contributes.keybindings.key', 'Key or key sequence (separate keys with plus-sign and sequences with space, e.g. Ctrl+O and Ctrl+L L for a chord).'),
            type: 'string'
        },
        mac: {
            description: nls.localize('vscode.extension.contributes.keybindings.mac', 'Mac specific key or key sequence.'),
            type: 'string'
        },
        linux: {
            description: nls.localize('vscode.extension.contributes.keybindings.linux', 'Linux specific key or key sequence.'),
            type: 'string'
        },
        win: {
            description: nls.localize('vscode.extension.contributes.keybindings.win', 'Windows specific key or key sequence.'),
            type: 'string'
        },
        when: {
            description: nls.localize('vscode.extension.contributes.keybindings.when', 'Condition when the key is active.'),
            type: 'string'
        },
    }
};
const keybindingsExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'keybindings',
    deps: [commandsExtensionPoint],
    jsonSchema: {
        description: nls.localize('vscode.extension.contributes.keybindings', "Contributes keybindings."),
        oneOf: [
            keybindingType,
            {
                type: 'array',
                items: keybindingType
            }
        ]
    }
});
const NUMPAD_PRINTABLE_SCANCODES = [
    90 /* ScanCode.NumpadDivide */,
    91 /* ScanCode.NumpadMultiply */,
    92 /* ScanCode.NumpadSubtract */,
    93 /* ScanCode.NumpadAdd */,
    95 /* ScanCode.Numpad1 */,
    96 /* ScanCode.Numpad2 */,
    97 /* ScanCode.Numpad3 */,
    98 /* ScanCode.Numpad4 */,
    99 /* ScanCode.Numpad5 */,
    100 /* ScanCode.Numpad6 */,
    101 /* ScanCode.Numpad7 */,
    102 /* ScanCode.Numpad8 */,
    103 /* ScanCode.Numpad9 */,
    104 /* ScanCode.Numpad0 */,
    105 /* ScanCode.NumpadDecimal */
];
const otherMacNumpadMapping = new Map();
otherMacNumpadMapping.set(95 /* ScanCode.Numpad1 */, 22 /* KeyCode.Digit1 */);
otherMacNumpadMapping.set(96 /* ScanCode.Numpad2 */, 23 /* KeyCode.Digit2 */);
otherMacNumpadMapping.set(97 /* ScanCode.Numpad3 */, 24 /* KeyCode.Digit3 */);
otherMacNumpadMapping.set(98 /* ScanCode.Numpad4 */, 25 /* KeyCode.Digit4 */);
otherMacNumpadMapping.set(99 /* ScanCode.Numpad5 */, 26 /* KeyCode.Digit5 */);
otherMacNumpadMapping.set(100 /* ScanCode.Numpad6 */, 27 /* KeyCode.Digit6 */);
otherMacNumpadMapping.set(101 /* ScanCode.Numpad7 */, 28 /* KeyCode.Digit7 */);
otherMacNumpadMapping.set(102 /* ScanCode.Numpad8 */, 29 /* KeyCode.Digit8 */);
otherMacNumpadMapping.set(103 /* ScanCode.Numpad9 */, 30 /* KeyCode.Digit9 */);
otherMacNumpadMapping.set(104 /* ScanCode.Numpad0 */, 21 /* KeyCode.Digit0 */);
let WorkbenchKeybindingService = class WorkbenchKeybindingService extends AbstractKeybindingService {
    hostService;
    keyboardLayoutService;
    _keyboardMapper;
    _cachedResolver;
    userKeybindings;
    isComposingGlobalContextKey;
    _contributions = [];
    constructor(contextKeyService, commandService, telemetryService, notificationService, userDataProfileService, configurationService, hostService, extensionService, fileService, logService, keyboardLayoutService) {
        super(contextKeyService, commandService, telemetryService, notificationService, logService);
        this.hostService = hostService;
        this.keyboardLayoutService = keyboardLayoutService;
        this.isComposingGlobalContextKey = contextKeyService.createKey('isComposing', false);
        this.updateSchema();
        let dispatchConfig = getDispatchConfig(configurationService);
        configurationService.onDidChangeConfiguration((e) => {
            const newDispatchConfig = getDispatchConfig(configurationService);
            if (dispatchConfig === newDispatchConfig) {
                return;
            }
            dispatchConfig = newDispatchConfig;
            this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper(dispatchConfig);
            this.updateResolver();
        });
        this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper(dispatchConfig);
        this.keyboardLayoutService.onDidChangeKeyboardLayout(() => {
            this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper(dispatchConfig);
            this.updateResolver();
        });
        this._cachedResolver = null;
        this.userKeybindings = this._register(new UserKeybindings(userDataProfileService, fileService, logService));
        this.userKeybindings.initialize().then(() => {
            if (this.userKeybindings.keybindings.length) {
                this.updateResolver();
            }
        });
        this._register(this.userKeybindings.onDidChange(() => {
            logService.debug('User keybindings changed');
            this.updateResolver();
        }));
        keybindingsExtPoint.setHandler((extensions) => {
            const keybindings = [];
            for (const extension of extensions) {
                this._handleKeybindingsExtensionPointUser(extension.description.identifier, extension.description.isBuiltin, extension.value, extension.collector, keybindings);
            }
            KeybindingsRegistry.setExtensionKeybindings(keybindings);
            this.updateResolver();
        });
        this.updateSchema();
        this._register(extensionService.onDidRegisterExtensions(() => this.updateSchema()));
        // for standard keybindings
        this._register(dom.addDisposableListener(window, dom.EventType.KEY_DOWN, (e) => {
            this.isComposingGlobalContextKey.set(e.isComposing);
            const keyEvent = new StandardKeyboardEvent(e);
            this._log(`/ Received  keydown event - ${printKeyboardEvent(e)}`);
            this._log(`| Converted keydown event - ${printStandardKeyboardEvent(keyEvent)}`);
            const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
            if (shouldPreventDefault) {
                keyEvent.preventDefault();
            }
            this.isComposingGlobalContextKey.set(false);
        }));
        // for single modifier chord keybindings (e.g. shift shift)
        this._register(dom.addDisposableListener(window, dom.EventType.KEY_UP, (e) => {
            this.isComposingGlobalContextKey.set(e.isComposing);
            const keyEvent = new StandardKeyboardEvent(e);
            const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
            if (shouldPreventDefault) {
                keyEvent.preventDefault();
            }
            this.isComposingGlobalContextKey.set(false);
        }));
        this._register(browser.onDidChangeFullscreen(() => {
            const keyboard = navigator.keyboard;
            if (BrowserFeatures.keyboard === 2 /* KeyboardSupport.None */) {
                return;
            }
            if (browser.isFullscreen()) {
                keyboard?.lock(['Escape']);
            }
            else {
                keyboard?.unlock();
            }
            // update resolver which will bring back all unbound keyboard shortcuts
            this._cachedResolver = null;
            this._onDidUpdateKeybindings.fire();
        }));
    }
    registerSchemaContribution(contribution) {
        this._contributions.push(contribution);
        if (contribution.onDidChange) {
            this._register(contribution.onDidChange(() => this.updateSchema()));
        }
        this.updateSchema();
    }
    updateSchema() {
        updateSchema(flatten(this._contributions.map(x => x.getSchemaAdditions())));
    }
    _printUserBinding(parts) {
        return UserSettingsLabelProvider.toLabel(OS, parts, (part) => {
            if (part instanceof SimpleKeybinding) {
                return KeyCodeUtils.toString(part.keyCode);
            }
            return ScanCodeUtils.toString(part.scanCode);
        }) || '[null]';
    }
    _printResolvedKeybinding(resolvedKeybinding) {
        return resolvedKeybinding.getDispatchParts().map(x => x || '[null]').join(' ');
    }
    _printResolvedKeybindings(output, input, resolvedKeybindings) {
        const padLength = 35;
        const firstRow = `${input.padStart(padLength, ' ')} => `;
        if (resolvedKeybindings.length === 0) {
            // no binding found
            output.push(`${firstRow}${'[NO BINDING]'.padStart(padLength, ' ')}`);
            return;
        }
        const firstRowIndentation = firstRow.length;
        const isFirst = true;
        for (const resolvedKeybinding of resolvedKeybindings) {
            if (isFirst) {
                output.push(`${firstRow}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
            }
            else {
                output.push(`${' '.repeat(firstRowIndentation)}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
            }
        }
    }
    _dumpResolveKeybindingDebugInfo() {
        const seenBindings = new Set();
        const result = [];
        result.push(`Default Resolved Keybindings (unique only):`);
        for (const item of KeybindingsRegistry.getDefaultKeybindings()) {
            if (!item.keybinding || item.keybinding.length === 0) {
                continue;
            }
            const input = this._printUserBinding(item.keybinding);
            if (seenBindings.has(input)) {
                continue;
            }
            seenBindings.add(input);
            const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(item.keybinding);
            this._printResolvedKeybindings(result, input, resolvedKeybindings);
        }
        result.push(`User Resolved Keybindings (unique only):`);
        for (const _item of this.userKeybindings.keybindings) {
            const item = KeybindingIO.readUserKeybindingItem(_item);
            if (!item.parts || item.parts.length === 0) {
                continue;
            }
            const input = _item.key;
            if (seenBindings.has(input)) {
                continue;
            }
            seenBindings.add(input);
            const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(item.parts);
            this._printResolvedKeybindings(result, input, resolvedKeybindings);
        }
        return result.join('\n');
    }
    _dumpDebugInfo() {
        const layoutInfo = JSON.stringify(this.keyboardLayoutService.getCurrentKeyboardLayout(), null, '\t');
        const mapperInfo = this._keyboardMapper.dumpDebugInfo();
        const resolvedKeybindings = this._dumpResolveKeybindingDebugInfo();
        const rawMapping = JSON.stringify(this.keyboardLayoutService.getRawKeyboardMapping(), null, '\t');
        return `Layout info:\n${layoutInfo}\n\n${resolvedKeybindings}\n\n${mapperInfo}\n\nRaw mapping:\n${rawMapping}`;
    }
    _dumpDebugInfoJSON() {
        const info = {
            layout: this.keyboardLayoutService.getCurrentKeyboardLayout(),
            rawMapping: this.keyboardLayoutService.getRawKeyboardMapping()
        };
        return JSON.stringify(info, null, '\t');
    }
    customKeybindingsCount() {
        return this.userKeybindings.keybindings.length;
    }
    updateResolver() {
        this._cachedResolver = null;
        this._onDidUpdateKeybindings.fire();
    }
    _getResolver() {
        if (!this._cachedResolver) {
            const defaults = this._resolveKeybindingItems(KeybindingsRegistry.getDefaultKeybindings(), true);
            const overrides = this._resolveUserKeybindingItems(this.userKeybindings.keybindings.map((k) => KeybindingIO.readUserKeybindingItem(k)), false);
            this._cachedResolver = new KeybindingResolver(defaults, overrides, (str) => this._log(str));
        }
        return this._cachedResolver;
    }
    _documentHasFocus() {
        // it is possible that the document has lost focus, but the
        // window is still focused, e.g. when a <webview> element
        // has focus
        return this.hostService.hasFocus;
    }
    _resolveKeybindingItems(items, isDefault) {
        const result = [];
        let resultLen = 0;
        for (const item of items) {
            const when = item.when || undefined;
            const keybinding = item.keybinding;
            if (!keybinding) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
            }
            else {
                if (this._assertBrowserConflicts(keybinding, item.command)) {
                    continue;
                }
                const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(keybinding);
                for (let i = resolvedKeybindings.length - 1; i >= 0; i--) {
                    const resolvedKeybinding = resolvedKeybindings[i];
                    result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                }
            }
        }
        return result;
    }
    _resolveUserKeybindingItems(items, isDefault) {
        const result = [];
        let resultLen = 0;
        for (const item of items) {
            const when = item.when || undefined;
            const parts = item.parts;
            if (parts.length === 0) {
                // This might be a removal keybinding item in user settings => accept it
                result[resultLen++] = new ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, null, false);
            }
            else {
                const resolvedKeybindings = this._keyboardMapper.resolveUserBinding(parts);
                for (const resolvedKeybinding of resolvedKeybindings) {
                    result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
                }
            }
        }
        return result;
    }
    _assertBrowserConflicts(kb, commandId) {
        if (BrowserFeatures.keyboard === 0 /* KeyboardSupport.Always */) {
            return false;
        }
        if (BrowserFeatures.keyboard === 1 /* KeyboardSupport.FullScreen */ && browser.isFullscreen()) {
            return false;
        }
        for (const part of kb) {
            if (!part.metaKey && !part.altKey && !part.ctrlKey && !part.shiftKey) {
                continue;
            }
            const modifiersMask = 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */;
            let partModifiersMask = 0;
            if (part.metaKey) {
                partModifiersMask |= 2048 /* KeyMod.CtrlCmd */;
            }
            if (part.shiftKey) {
                partModifiersMask |= 1024 /* KeyMod.Shift */;
            }
            if (part.altKey) {
                partModifiersMask |= 512 /* KeyMod.Alt */;
            }
            if (part.ctrlKey && OS === 2 /* OperatingSystem.Macintosh */) {
                partModifiersMask |= 256 /* KeyMod.WinCtrl */;
            }
            if ((partModifiersMask & modifiersMask) === (2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */)) {
                if (part instanceof ScanCodeBinding && (part.scanCode === 86 /* ScanCode.ArrowLeft */ || part.scanCode === 85 /* ScanCode.ArrowRight */)) {
                    // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
                if (part instanceof SimpleKeybinding && (part.keyCode === 15 /* KeyCode.LeftArrow */ || part.keyCode === 17 /* KeyCode.RightArrow */)) {
                    // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
            }
            if ((partModifiersMask & modifiersMask) === 2048 /* KeyMod.CtrlCmd */) {
                if (part instanceof ScanCodeBinding && (part.scanCode >= 36 /* ScanCode.Digit1 */ && part.scanCode <= 45 /* ScanCode.Digit0 */)) {
                    // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
                if (part instanceof SimpleKeybinding && (part.keyCode >= 21 /* KeyCode.Digit0 */ && part.keyCode <= 30 /* KeyCode.Digit9 */)) {
                    // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                    return true;
                }
            }
        }
        return false;
    }
    resolveKeybinding(kb) {
        return this._keyboardMapper.resolveKeybinding(kb);
    }
    resolveKeyboardEvent(keyboardEvent) {
        this.keyboardLayoutService.validateCurrentKeyboardMapping(keyboardEvent);
        return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
    }
    resolveUserBinding(userBinding) {
        const parts = KeybindingParser.parseUserBinding(userBinding);
        return this._keyboardMapper.resolveUserBinding(parts);
    }
    _handleKeybindingsExtensionPointUser(extensionId, isBuiltin, keybindings, collector, result) {
        if (isContributedKeyBindingsArray(keybindings)) {
            for (let i = 0, len = keybindings.length; i < len; i++) {
                this._handleKeybinding(extensionId, isBuiltin, i + 1, keybindings[i], collector, result);
            }
        }
        else {
            this._handleKeybinding(extensionId, isBuiltin, 1, keybindings, collector, result);
        }
    }
    _handleKeybinding(extensionId, isBuiltin, idx, keybindings, collector, result) {
        const rejects = [];
        if (isValidContributedKeyBinding(keybindings, rejects)) {
            const rule = this._asCommandRule(extensionId, isBuiltin, idx++, keybindings);
            if (rule) {
                result.push(rule);
            }
        }
        if (rejects.length > 0) {
            collector.error(nls.localize('invalid.keybindings', "Invalid `contributes.{0}`: {1}", keybindingsExtPoint.name, rejects.join('\n')));
        }
    }
    static bindToCurrentPlatform(key, mac, linux, win) {
        if (OS === 1 /* OperatingSystem.Windows */ && win) {
            if (win) {
                return win;
            }
        }
        else if (OS === 2 /* OperatingSystem.Macintosh */) {
            if (mac) {
                return mac;
            }
        }
        else {
            if (linux) {
                return linux;
            }
        }
        return key;
    }
    _asCommandRule(extensionId, isBuiltin, idx, binding) {
        const { command, args, when, key, mac, linux, win } = binding;
        const keybinding = WorkbenchKeybindingService.bindToCurrentPlatform(key, mac, linux, win);
        if (!keybinding) {
            return undefined;
        }
        let weight;
        if (isBuiltin) {
            weight = 300 /* KeybindingWeight.BuiltinExtension */ + idx;
        }
        else {
            weight = 400 /* KeybindingWeight.ExternalExtension */ + idx;
        }
        const commandAction = MenuRegistry.getCommand(command);
        const precondition = commandAction && commandAction.precondition;
        let fullWhen;
        if (when && precondition) {
            fullWhen = ContextKeyExpr.and(precondition, ContextKeyExpr.deserialize(when));
        }
        else if (when) {
            fullWhen = ContextKeyExpr.deserialize(when);
        }
        else if (precondition) {
            fullWhen = precondition;
        }
        const desc = {
            id: command,
            args,
            when: fullWhen,
            weight: weight,
            keybinding: KeybindingParser.parseUserBinding(keybinding),
            extensionId: extensionId.value,
            isBuiltinExtension: isBuiltin
        };
        return desc;
    }
    getDefaultKeybindingsContent() {
        const resolver = this._getResolver();
        const defaultKeybindings = resolver.getDefaultKeybindings();
        const boundCommands = resolver.getDefaultBoundCommands();
        return (WorkbenchKeybindingService._getDefaultKeybindings(defaultKeybindings)
            + '\n\n'
            + WorkbenchKeybindingService._getAllCommandsAsComment(boundCommands));
    }
    static _getDefaultKeybindings(defaultKeybindings) {
        const out = new OutputBuilder();
        out.writeLine('[');
        const lastIndex = defaultKeybindings.length - 1;
        defaultKeybindings.forEach((k, index) => {
            KeybindingIO.writeKeybindingItem(out, k);
            if (index !== lastIndex) {
                out.writeLine(',');
            }
            else {
                out.writeLine();
            }
        });
        out.writeLine(']');
        return out.toString();
    }
    static _getAllCommandsAsComment(boundCommands) {
        const unboundCommands = getAllUnboundCommands(boundCommands);
        const pretty = unboundCommands.sort().join('\n// - ');
        return '// ' + nls.localize('unboundCommands', "Here are other available commands: ") + '\n// - ' + pretty;
    }
    mightProducePrintableCharacter(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) {
            // ignore ctrl/cmd/alt-combination but not shift-combinatios
            return false;
        }
        const code = ScanCodeUtils.toEnum(event.code);
        if (NUMPAD_PRINTABLE_SCANCODES.indexOf(code) !== -1) {
            // This is a numpad key that might produce a printable character based on NumLock.
            // Let's check if NumLock is on or off based on the event's keyCode.
            // e.g.
            // - when NumLock is off, ScanCode.Numpad4 produces KeyCode.LeftArrow
            // - when NumLock is on, ScanCode.Numpad4 produces KeyCode.NUMPAD_4
            // However, ScanCode.NumpadAdd always produces KeyCode.NUMPAD_ADD
            if (event.keyCode === IMMUTABLE_CODE_TO_KEY_CODE[code]) {
                // NumLock is on or this is /, *, -, + on the numpad
                return true;
            }
            if (isMacintosh && event.keyCode === otherMacNumpadMapping.get(code)) {
                // on macOS, the numpad keys can also map to keys 1 - 0.
                return true;
            }
            return false;
        }
        const keycode = IMMUTABLE_CODE_TO_KEY_CODE[code];
        if (keycode !== -1) {
            // https://github.com/microsoft/vscode/issues/74934
            return false;
        }
        // consult the KeyboardMapperFactory to check the given event for
        // a printable value.
        const mapping = this.keyboardLayoutService.getRawKeyboardMapping();
        if (!mapping) {
            return false;
        }
        const keyInfo = mapping[event.code];
        if (!keyInfo) {
            return false;
        }
        if (!keyInfo.value || /\s/.test(keyInfo.value)) {
            return false;
        }
        return true;
    }
};
WorkbenchKeybindingService = __decorate([
    __param(0, IContextKeyService),
    __param(1, ICommandService),
    __param(2, ITelemetryService),
    __param(3, INotificationService),
    __param(4, IUserDataProfileService),
    __param(5, IConfigurationService),
    __param(6, IHostService),
    __param(7, IExtensionService),
    __param(8, IFileService),
    __param(9, ILogService),
    __param(10, IKeyboardLayoutService)
], WorkbenchKeybindingService);
export { WorkbenchKeybindingService };
class UserKeybindings extends Disposable {
    userDataProfileService;
    fileService;
    _keybindings = [];
    get keybindings() { return this._keybindings; }
    reloadConfigurationScheduler;
    watchDisposables = this._register(new DisposableStore());
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    constructor(userDataProfileService, fileService, logService) {
        super();
        this.userDataProfileService = userDataProfileService;
        this.fileService = fileService;
        this.watch();
        this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reload().then(changed => {
            if (changed) {
                this._onDidChange.fire();
            }
        }), 50));
        this._register(Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.userDataProfileService.currentProfile.keybindingsResource))(() => {
            logService.debug('Keybindings file changed');
            this.reloadConfigurationScheduler.schedule();
        }));
        this._register(this.fileService.onDidRunOperation((e) => {
            if (e.operation === 4 /* FileOperation.WRITE */ && e.resource.toString() === this.userDataProfileService.currentProfile.keybindingsResource.toString()) {
                logService.debug('Keybindings file written');
                this.reloadConfigurationScheduler.schedule();
            }
        }));
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.whenCurrentProfieChanged(e))));
    }
    async whenCurrentProfieChanged(e) {
        if (e.preserveData) {
            if (await this.fileService.exists(e.previous.keybindingsResource)) {
                await this.fileService.copy(e.previous.keybindingsResource, e.profile.keybindingsResource);
            }
        }
        this.watch();
        this.reloadConfigurationScheduler.schedule();
    }
    watch() {
        this.watchDisposables.clear();
        this.watchDisposables.add(this.fileService.watch(dirname(this.userDataProfileService.currentProfile.keybindingsResource)));
        // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
        this.watchDisposables.add(this.fileService.watch(this.userDataProfileService.currentProfile.keybindingsResource));
    }
    async initialize() {
        await this.reload();
    }
    async reload() {
        const existing = this._keybindings;
        try {
            const content = await this.fileService.readFile(this.userDataProfileService.currentProfile.keybindingsResource);
            const value = parse(content.value.toString());
            this._keybindings = Array.isArray(value) ? value : [];
        }
        catch (e) {
            this._keybindings = [];
        }
        return existing ? !objects.equals(existing, this._keybindings) : true;
    }
}
const schemaId = 'vscode://schemas/keybindings';
const commandsSchemas = [];
const commandsEnum = [];
const commandsEnumDescriptions = [];
const schema = {
    id: schemaId,
    type: 'array',
    title: nls.localize('keybindings.json.title', "Keybindings configuration"),
    allowTrailingCommas: true,
    allowComments: true,
    definitions: {
        'editorGroupsSchema': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'groups': {
                        '$ref': '#/definitions/editorGroupsSchema',
                        'default': [{}, {}]
                    },
                    'size': {
                        'type': 'number',
                        'default': 0.5
                    }
                }
            }
        }
    },
    items: {
        'required': ['key'],
        'type': 'object',
        'defaultSnippets': [{ 'body': { 'key': '$1', 'command': '$2', 'when': '$3' } }],
        'properties': {
            'key': {
                'type': 'string',
                'description': nls.localize('keybindings.json.key', "Key or key sequence (separated by space)"),
            },
            'command': {
                'anyOf': [
                    {
                        'type': 'string',
                        'enum': commandsEnum,
                        'enumDescriptions': commandsEnumDescriptions,
                        'description': nls.localize('keybindings.json.command', "Name of the command to execute"),
                    },
                    {
                        'type': 'string'
                    }
                ]
            },
            'when': {
                'type': 'string',
                'description': nls.localize('keybindings.json.when', "Condition when the key is active.")
            },
            'args': {
                'description': nls.localize('keybindings.json.args', "Arguments to pass to the command to execute.")
            }
        },
        'allOf': commandsSchemas
    }
};
const schemaRegistry = Registry.as(Extensions.JSONContribution);
schemaRegistry.registerSchema(schemaId, schema);
function updateSchema(additionalContributions) {
    commandsSchemas.length = 0;
    commandsEnum.length = 0;
    commandsEnumDescriptions.length = 0;
    const knownCommands = new Set();
    const addKnownCommand = (commandId, description) => {
        if (!/^_/.test(commandId)) {
            if (!knownCommands.has(commandId)) {
                knownCommands.add(commandId);
                commandsEnum.push(commandId);
                commandsEnumDescriptions.push(description);
                // Also add the negative form for keybinding removal
                commandsEnum.push(`-${commandId}`);
                commandsEnumDescriptions.push(description);
            }
        }
    };
    const allCommands = CommandsRegistry.getCommands();
    for (const [commandId, command] of allCommands) {
        const commandDescription = command.description;
        addKnownCommand(commandId, commandDescription ? commandDescription.description : undefined);
        if (!commandDescription || !commandDescription.args || commandDescription.args.length !== 1 || !commandDescription.args[0].schema) {
            continue;
        }
        const argsSchema = commandDescription.args[0].schema;
        const argsRequired = ((typeof commandDescription.args[0].isOptional !== 'undefined')
            ? (!commandDescription.args[0].isOptional)
            : (Array.isArray(argsSchema.required) && argsSchema.required.length > 0));
        const addition = {
            'if': {
                'properties': {
                    'command': { 'const': commandId }
                }
            },
            'then': {
                'required': [].concat(argsRequired ? ['args'] : []),
                'properties': {
                    'args': argsSchema
                }
            }
        };
        commandsSchemas.push(addition);
    }
    const menuCommands = MenuRegistry.getCommands();
    for (const commandId of menuCommands.keys()) {
        addKnownCommand(commandId);
    }
    commandsSchemas.push(...additionalContributions);
    schemaRegistry.notifySchemaChanged(schemaId);
}
const configurationRegistry = Registry.as(ConfigExtensions.Configuration);
const keyboardConfiguration = {
    'id': 'keyboard',
    'order': 15,
    'type': 'object',
    'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
    'properties': {
        'keyboard.dispatch': {
            scope: 1 /* ConfigurationScope.APPLICATION */,
            type: 'string',
            enum: ['code', 'keyCode'],
            default: 'code',
            markdownDescription: nls.localize('dispatch', "Controls the dispatching logic for key presses to use either `code` (recommended) or `keyCode`."),
            included: OS === 2 /* OperatingSystem.Macintosh */ || OS === 3 /* OperatingSystem.Linux */
        }
    }
};
configurationRegistry.registerConfiguration(keyboardConfiguration);
registerSingleton(IKeybindingService, WorkbenchKeybindingService, 0 /* InstantiationType.Eager */);
