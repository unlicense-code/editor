/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { StatusBarAlignment as ExtHostStatusBarAlignment, Disposable, ThemeColor } from './extHostTypes';
import { MainContext } from './extHost.protocol';
import { localize } from 'vs/nls';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { MarkdownString } from 'vs/workbench/api/common/extHostTypeConverters';
import { isNumber } from 'vs/base/common/types';
export class ExtHostStatusBarEntry {
    static ID_GEN = 0;
    static ALLOWED_BACKGROUND_COLORS = new Map([
        ['statusBarItem.errorBackground', new ThemeColor('statusBarItem.errorForeground')],
        ['statusBarItem.warningBackground', new ThemeColor('statusBarItem.warningForeground')]
    ]);
    #proxy;
    #commands;
    _entryId;
    _extension;
    _id;
    _alignment;
    _priority;
    _disposed = false;
    _visible = false;
    _text = '';
    _tooltip;
    _name;
    _color;
    _backgroundColor;
    _internalCommandRegistration = new DisposableStore();
    _command;
    _timeoutHandle;
    _accessibilityInformation;
    constructor(proxy, commands, extension, id, alignment = ExtHostStatusBarAlignment.Left, priority) {
        this.#proxy = proxy;
        this.#commands = commands;
        this._entryId = ExtHostStatusBarEntry.ID_GEN++;
        this._extension = extension;
        this._id = id;
        this._alignment = alignment;
        this._priority = this.validatePriority(priority);
    }
    validatePriority(priority) {
        if (!isNumber(priority)) {
            return undefined; // using this method to catch `NaN` too!
        }
        // Our RPC mechanism use JSON to serialize data which does
        // not support `Infinity` so we need to fill in the number
        // equivalent as close as possible.
        // https://github.com/microsoft/vscode/issues/133317
        if (priority === Number.POSITIVE_INFINITY) {
            return Number.MAX_VALUE;
        }
        if (priority === Number.NEGATIVE_INFINITY) {
            return -Number.MAX_VALUE;
        }
        return priority;
    }
    get id() {
        return this._id ?? this._extension.identifier.value;
    }
    get alignment() {
        return this._alignment;
    }
    get priority() {
        return this._priority;
    }
    get text() {
        return this._text;
    }
    get name() {
        return this._name;
    }
    get tooltip() {
        return this._tooltip;
    }
    get color() {
        return this._color;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    get command() {
        return this._command?.fromApi;
    }
    get accessibilityInformation() {
        return this._accessibilityInformation;
    }
    set text(text) {
        this._text = text;
        this.update();
    }
    set name(name) {
        this._name = name;
        this.update();
    }
    set tooltip(tooltip) {
        this._tooltip = tooltip;
        this.update();
    }
    set color(color) {
        this._color = color;
        this.update();
    }
    set backgroundColor(color) {
        if (color && !ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.has(color.id)) {
            color = undefined;
        }
        this._backgroundColor = color;
        this.update();
    }
    set command(command) {
        if (this._command?.fromApi === command) {
            return;
        }
        this._internalCommandRegistration.clear();
        if (typeof command === 'string') {
            this._command = {
                fromApi: command,
                internal: this.#commands.toInternal({ title: '', command }, this._internalCommandRegistration),
            };
        }
        else if (command) {
            this._command = {
                fromApi: command,
                internal: this.#commands.toInternal(command, this._internalCommandRegistration),
            };
        }
        else {
            this._command = undefined;
        }
        this.update();
    }
    set accessibilityInformation(accessibilityInformation) {
        this._accessibilityInformation = accessibilityInformation;
        this.update();
    }
    show() {
        this._visible = true;
        this.update();
    }
    hide() {
        clearTimeout(this._timeoutHandle);
        this._visible = false;
        this.#proxy.$dispose(this._entryId);
    }
    update() {
        if (this._disposed || !this._visible) {
            return;
        }
        clearTimeout(this._timeoutHandle);
        // Defer the update so that multiple changes to setters dont cause a redraw each
        this._timeoutHandle = setTimeout(() => {
            this._timeoutHandle = undefined;
            // If the id is not set, derive it from the extension identifier,
            // otherwise make sure to prefix it with the extension identifier
            // to get a more unique value across extensions.
            let id;
            if (this._extension) {
                if (this._id) {
                    id = `${this._extension.identifier.value}.${this._id}`;
                }
                else {
                    id = this._extension.identifier.value;
                }
            }
            else {
                id = this._id;
            }
            // If the name is not set, derive it from the extension descriptor
            let name;
            if (this._name) {
                name = this._name;
            }
            else {
                name = localize('extensionLabel', "{0} (Extension)", this._extension.displayName || this._extension.name);
            }
            // If a background color is set, the foreground is determined
            let color = this._color;
            if (this._backgroundColor) {
                color = ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.get(this._backgroundColor.id);
            }
            const tooltip = MarkdownString.fromStrict(this._tooltip);
            // Set to status bar
            this.#proxy.$setEntry(this._entryId, id, name, this._text, tooltip, this._command?.internal, color, this._backgroundColor, this._alignment === ExtHostStatusBarAlignment.Left, this._priority, this._accessibilityInformation);
        }, 0);
    }
    dispose() {
        this.hide();
        this._disposed = true;
    }
}
class StatusBarMessage {
    _item;
    _messages = [];
    constructor(statusBar) {
        this._item = statusBar.createStatusBarEntry(undefined, 'status.extensionMessage', ExtHostStatusBarAlignment.Left, Number.MIN_VALUE);
        this._item.name = localize('status.extensionMessage', "Extension Status");
    }
    dispose() {
        this._messages.length = 0;
        this._item.dispose();
    }
    setMessage(message) {
        const data = { message }; // use object to not confuse equal strings
        this._messages.unshift(data);
        this._update();
        return new Disposable(() => {
            const idx = this._messages.indexOf(data);
            if (idx >= 0) {
                this._messages.splice(idx, 1);
                this._update();
            }
        });
    }
    _update() {
        if (this._messages.length > 0) {
            this._item.text = this._messages[0].message;
            this._item.show();
        }
        else {
            this._item.hide();
        }
    }
}
export class ExtHostStatusBar {
    _proxy;
    _commands;
    _statusMessage;
    constructor(mainContext, commands) {
        this._proxy = mainContext.getProxy(MainContext.MainThreadStatusBar);
        this._commands = commands;
        this._statusMessage = new StatusBarMessage(this);
    }
    createStatusBarEntry(extension, id, alignment, priority) {
        return new ExtHostStatusBarEntry(this._proxy, this._commands, extension, id, alignment, priority);
    }
    setStatusBarMessage(text, timeoutOrThenable) {
        const d = this._statusMessage.setMessage(text);
        let handle;
        if (typeof timeoutOrThenable === 'number') {
            handle = setTimeout(() => d.dispose(), timeoutOrThenable);
        }
        else if (typeof timeoutOrThenable !== 'undefined') {
            timeoutOrThenable.then(() => d.dispose(), () => d.dispose());
        }
        return new Disposable(() => {
            d.dispose();
            clearTimeout(handle);
        });
    }
}
