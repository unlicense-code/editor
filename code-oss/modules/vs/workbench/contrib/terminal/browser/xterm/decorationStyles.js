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
import * as dom from 'vs/base/browser/dom';
import { Delayer } from 'vs/base/common/async';
import { fromNow } from 'vs/base/common/date';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { combinedDisposable, Disposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
var DecorationStyles;
(function (DecorationStyles) {
    DecorationStyles[DecorationStyles["DefaultDimension"] = 16] = "DefaultDimension";
    DecorationStyles[DecorationStyles["MarginLeft"] = -17] = "MarginLeft";
})(DecorationStyles || (DecorationStyles = {}));
export var DecorationSelector;
(function (DecorationSelector) {
    DecorationSelector["CommandDecoration"] = "terminal-command-decoration";
    DecorationSelector["Hide"] = "hide";
    DecorationSelector["ErrorColor"] = "error";
    DecorationSelector["DefaultColor"] = "default-color";
    DecorationSelector["Default"] = "default";
    DecorationSelector["Codicon"] = "codicon";
    DecorationSelector["XtermDecoration"] = "xterm-decoration";
    DecorationSelector["OverviewRuler"] = ".xterm-decoration-overview-ruler";
    DecorationSelector["QuickFix"] = "quick-fix";
    DecorationSelector["LightBulb"] = "codicon-light-bulb";
})(DecorationSelector || (DecorationSelector = {}));
let TerminalDecorationHoverManager = class TerminalDecorationHoverManager extends Disposable {
    _hoverService;
    _hoverDelayer;
    _contextMenuVisible = false;
    constructor(_hoverService, configurationService, contextMenuService) {
        super();
        this._hoverService = _hoverService;
        this._register(contextMenuService.onDidShowContextMenu(() => this._contextMenuVisible = true));
        this._register(contextMenuService.onDidHideContextMenu(() => this._contextMenuVisible = false));
        this._hoverDelayer = this._register(new Delayer(configurationService.getValue('workbench.hover.delay')));
    }
    hideHover() {
        this._hoverDelayer.cancel();
        this._hoverService.hideHover();
    }
    createHover(element, command, hoverMessage) {
        return combinedDisposable(dom.addDisposableListener(element, dom.EventType.MOUSE_ENTER, () => {
            if (this._contextMenuVisible) {
                return;
            }
            this._hoverDelayer.trigger(() => {
                let hoverContent = `${localize('terminalPromptContextMenu', "Show Command Actions")}`;
                hoverContent += '\n\n---\n\n';
                if (!command) {
                    if (hoverMessage) {
                        hoverContent = hoverMessage;
                    }
                    else {
                        return;
                    }
                }
                else if (command.markProperties || hoverMessage) {
                    if (command.markProperties?.hoverMessage || hoverMessage) {
                        hoverContent = command.markProperties?.hoverMessage || hoverMessage || '';
                    }
                    else {
                        return;
                    }
                }
                else if (command.exitCode) {
                    if (command.exitCode === -1) {
                        hoverContent += localize('terminalPromptCommandFailed', 'Command executed {0} and failed', fromNow(command.timestamp, true));
                    }
                    else {
                        hoverContent += localize('terminalPromptCommandFailedWithExitCode', 'Command executed {0} and failed (Exit Code {1})', fromNow(command.timestamp, true), command.exitCode);
                    }
                }
                else {
                    hoverContent += localize('terminalPromptCommandSuccess', 'Command executed {0}', fromNow(command.timestamp, true));
                }
                this._hoverService.showHover({ content: new MarkdownString(hoverContent), target: element });
            });
        }), dom.addDisposableListener(element, dom.EventType.MOUSE_LEAVE, () => this.hideHover()), dom.addDisposableListener(element, dom.EventType.MOUSE_OUT, () => this.hideHover()));
    }
};
TerminalDecorationHoverManager = __decorate([
    __param(0, IHoverService),
    __param(1, IConfigurationService),
    __param(2, IContextMenuService)
], TerminalDecorationHoverManager);
export { TerminalDecorationHoverManager };
export function updateLayout(configurationService, element) {
    if (!element) {
        return;
    }
    const fontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).value;
    const defaultFontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).defaultValue;
    const lineHeight = configurationService.inspect("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */).value;
    if (typeof fontSize === 'number' && typeof defaultFontSize === 'number' && typeof lineHeight === 'number') {
        const scalar = (fontSize / defaultFontSize) <= 1 ? (fontSize / defaultFontSize) : 1;
        // must be inlined to override the inlined styles from xterm
        element.style.width = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
        element.style.height = `${scalar * 16 /* DecorationStyles.DefaultDimension */ * lineHeight}px`;
        element.style.fontSize = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
        element.style.marginLeft = `${scalar * -17 /* DecorationStyles.MarginLeft */}px`;
    }
}
