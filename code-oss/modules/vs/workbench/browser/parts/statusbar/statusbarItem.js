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
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { SimpleIconLabel } from 'vs/base/browser/ui/iconLabel/simpleIconLabel';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ShowTooltipCommand } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { isThemeColor } from 'vs/editor/common/editorCommon';
import { addDisposableListener, EventType, hide, show, append, EventHelper } from 'vs/base/browser/dom';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { assertIsDefined } from 'vs/base/common/types';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { renderIcon, renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { spinningLoading, syncing } from 'vs/platform/theme/common/iconRegistry';
import { setupCustomHover } from 'vs/base/browser/ui/iconLabel/iconLabelHover';
import { isMarkdownString, markdownStringEqual } from 'vs/base/common/htmlContent';
import { Gesture, EventType as TouchEventType } from 'vs/base/browser/touch';
let StatusbarEntryItem = class StatusbarEntryItem extends Disposable {
    container;
    hoverDelegate;
    commandService;
    notificationService;
    telemetryService;
    themeService;
    label;
    entry = undefined;
    foregroundListener = this._register(new MutableDisposable());
    backgroundListener = this._register(new MutableDisposable());
    commandMouseListener = this._register(new MutableDisposable());
    commandTouchListener = this._register(new MutableDisposable());
    commandKeyboardListener = this._register(new MutableDisposable());
    hover = undefined;
    labelContainer;
    beakContainer;
    get name() {
        return assertIsDefined(this.entry).name;
    }
    get hasCommand() {
        return typeof this.entry?.command !== 'undefined';
    }
    constructor(container, entry, hoverDelegate, commandService, notificationService, telemetryService, themeService) {
        super();
        this.container = container;
        this.hoverDelegate = hoverDelegate;
        this.commandService = commandService;
        this.notificationService = notificationService;
        this.telemetryService = telemetryService;
        this.themeService = themeService;
        // Label Container
        this.labelContainer = document.createElement('a');
        this.labelContainer.tabIndex = -1; // allows screen readers to read title, but still prevents tab focus.
        this.labelContainer.setAttribute('role', 'button');
        this._register(Gesture.addTarget(this.labelContainer)); // enable touch
        // Label (with support for progress)
        this.label = new StatusBarCodiconLabel(this.labelContainer);
        this.container.appendChild(this.labelContainer);
        // Beak Container
        this.beakContainer = document.createElement('div');
        this.beakContainer.className = 'status-bar-item-beak-container';
        this.container.appendChild(this.beakContainer);
        this.update(entry);
    }
    update(entry) {
        // Update: Progress
        this.label.showProgress = entry.showProgress ?? false;
        // Update: Text
        if (!this.entry || entry.text !== this.entry.text) {
            this.label.text = entry.text;
            if (entry.text) {
                show(this.labelContainer);
            }
            else {
                hide(this.labelContainer);
            }
        }
        // Update: ARIA label
        //
        // Set the aria label on both elements so screen readers would read
        // the correct thing without duplication #96210
        if (!this.entry || entry.ariaLabel !== this.entry.ariaLabel) {
            this.container.setAttribute('aria-label', entry.ariaLabel);
            this.labelContainer.setAttribute('aria-label', entry.ariaLabel);
        }
        if (!this.entry || entry.role !== this.entry.role) {
            this.labelContainer.setAttribute('role', entry.role || 'button');
        }
        // Update: Hover
        if (!this.entry || !this.isEqualTooltip(this.entry, entry)) {
            const hoverContents = isMarkdownString(entry.tooltip) ? { markdown: entry.tooltip, markdownNotSupportedFallback: undefined } : entry.tooltip;
            if (this.hover) {
                this.hover.update(hoverContents);
            }
            else {
                this.hover = this._register(setupCustomHover(this.hoverDelegate, this.container, hoverContents));
            }
        }
        // Update: Command
        if (!this.entry || entry.command !== this.entry.command) {
            this.commandMouseListener.clear();
            this.commandTouchListener.clear();
            this.commandKeyboardListener.clear();
            const command = entry.command;
            if (command && (command !== ShowTooltipCommand || this.hover) /* "Show Hover" is only valid when we have a hover */) {
                this.commandMouseListener.value = addDisposableListener(this.labelContainer, EventType.CLICK, () => this.executeCommand(command));
                this.commandTouchListener.value = addDisposableListener(this.labelContainer, TouchEventType.Tap, () => this.executeCommand(command));
                this.commandKeyboardListener.value = addDisposableListener(this.labelContainer, EventType.KEY_DOWN, e => {
                    const event = new StandardKeyboardEvent(e);
                    if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                        EventHelper.stop(e);
                        this.executeCommand(command);
                    }
                });
                this.labelContainer.classList.remove('disabled');
            }
            else {
                this.labelContainer.classList.add('disabled');
            }
        }
        // Update: Beak
        if (!this.entry || entry.showBeak !== this.entry.showBeak) {
            if (entry.showBeak) {
                this.container.classList.add('has-beak');
            }
            else {
                this.container.classList.remove('has-beak');
            }
        }
        // Update: Foreground
        if (!this.entry || entry.color !== this.entry.color) {
            this.applyColor(this.labelContainer, entry.color);
        }
        // Update: Background
        if (!this.entry || entry.backgroundColor !== this.entry.backgroundColor) {
            this.container.classList.toggle('has-background-color', !!entry.backgroundColor);
            this.applyColor(this.container, entry.backgroundColor, true);
        }
        // Remember for next round
        this.entry = entry;
    }
    isEqualTooltip({ tooltip }, { tooltip: otherTooltip }) {
        if (tooltip === undefined) {
            return otherTooltip === undefined;
        }
        if (isMarkdownString(tooltip)) {
            return isMarkdownString(otherTooltip) && markdownStringEqual(tooltip, otherTooltip);
        }
        return tooltip === otherTooltip;
    }
    async executeCommand(command) {
        // Custom command from us: Show tooltip
        if (command === ShowTooltipCommand) {
            this.hover?.show(true /* focus */);
        }
        // Any other command is going through command service
        else {
            const id = typeof command === 'string' ? command : command.id;
            const args = typeof command === 'string' ? [] : command.arguments ?? [];
            this.telemetryService.publicLog2('workbenchActionExecuted', { id, from: 'status bar' });
            try {
                await this.commandService.executeCommand(id, ...args);
            }
            catch (error) {
                this.notificationService.error(toErrorMessage(error));
            }
        }
    }
    applyColor(container, color, isBackground) {
        let colorResult = undefined;
        if (isBackground) {
            this.backgroundListener.clear();
        }
        else {
            this.foregroundListener.clear();
        }
        if (color) {
            if (isThemeColor(color)) {
                colorResult = this.themeService.getColorTheme().getColor(color.id)?.toString();
                const listener = this.themeService.onDidColorThemeChange(theme => {
                    const colorValue = theme.getColor(color.id)?.toString();
                    if (isBackground) {
                        container.style.backgroundColor = colorValue ?? '';
                    }
                    else {
                        container.style.color = colorValue ?? '';
                    }
                });
                if (isBackground) {
                    this.backgroundListener.value = listener;
                }
                else {
                    this.foregroundListener.value = listener;
                }
            }
            else {
                colorResult = color;
            }
        }
        if (isBackground) {
            container.style.backgroundColor = colorResult ?? '';
        }
        else {
            container.style.color = colorResult ?? '';
        }
    }
};
StatusbarEntryItem = __decorate([
    __param(3, ICommandService),
    __param(4, INotificationService),
    __param(5, ITelemetryService),
    __param(6, IThemeService)
], StatusbarEntryItem);
export { StatusbarEntryItem };
class StatusBarCodiconLabel extends SimpleIconLabel {
    container;
    progressCodicon = renderIcon(syncing);
    currentText = '';
    currentShowProgress = false;
    constructor(container) {
        super(container);
        this.container = container;
    }
    set showProgress(showProgress) {
        if (this.currentShowProgress !== showProgress) {
            this.currentShowProgress = showProgress;
            this.progressCodicon = renderIcon(showProgress === 'loading' ? spinningLoading : syncing);
            this.text = this.currentText;
        }
    }
    set text(text) {
        // Progress: insert progress codicon as first element as needed
        // but keep it stable so that the animation does not reset
        if (this.currentShowProgress) {
            // Append as needed
            if (this.container.firstChild !== this.progressCodicon) {
                this.container.appendChild(this.progressCodicon);
            }
            // Remove others
            for (const node of Array.from(this.container.childNodes)) {
                if (node !== this.progressCodicon) {
                    node.remove();
                }
            }
            // If we have text to show, add a space to separate from progress
            let textContent = text ?? '';
            if (textContent) {
                textContent = ` ${textContent}`;
            }
            // Append new elements
            append(this.container, ...renderLabelWithIcons(textContent));
        }
        // No Progress: no special handling
        else {
            super.text = text;
        }
    }
}
