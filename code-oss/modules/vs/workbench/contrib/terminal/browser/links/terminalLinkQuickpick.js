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
import { EventType } from 'vs/base/browser/dom';
import { Emitter } from 'vs/base/common/event';
import { localize } from 'vs/nls';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { TerminalLinkQuickPickEvent } from 'vs/workbench/contrib/terminal/browser/terminal';
let TerminalLinkQuickpick = class TerminalLinkQuickpick {
    _quickInputService;
    _onDidRequestMoreLinks = new Emitter();
    onDidRequestMoreLinks = this._onDidRequestMoreLinks.event;
    constructor(_quickInputService) {
        this._quickInputService = _quickInputService;
    }
    async show(links) {
        const wordPicks = links.wordLinks ? await this._generatePicks(links.wordLinks) : undefined;
        const filePicks = links.fileLinks ? await this._generatePicks(links.fileLinks) : undefined;
        const webPicks = links.webLinks ? await this._generatePicks(links.webLinks) : undefined;
        const options = {
            placeHolder: localize('terminal.integrated.openDetectedLink', "Select the link to open"),
            canPickMany: false,
        };
        const picks = [];
        if (webPicks) {
            picks.push({ type: 'separator', label: localize('terminal.integrated.urlLinks', "Url") });
            picks.push(...webPicks);
        }
        if (filePicks) {
            picks.push({ type: 'separator', label: localize('terminal.integrated.localFileLinks', "Local File") });
            picks.push(...filePicks);
        }
        if (wordPicks) {
            picks.push({ type: 'separator', label: localize('terminal.integrated.searchLinks', "Workspace Search") });
            picks.push(...wordPicks);
        }
        picks.push({ type: 'separator' });
        if (!links.noMoreResults) {
            const showMoreItem = { label: localize('terminal.integrated.showMoreLinks', "Show more links") };
            picks.push(showMoreItem);
        }
        const pick = await this._quickInputService.pick(picks, options);
        if (!pick) {
            return;
        }
        const event = new TerminalLinkQuickPickEvent(EventType.CLICK);
        if ('link' in pick) {
            pick.link.activate(event, pick.label);
        }
        else {
            this._onDidRequestMoreLinks.fire();
        }
        return;
    }
    async _generatePicks(links) {
        if (!links) {
            return;
        }
        const linkKeys = new Set();
        const picks = [];
        for (const link of links) {
            const label = link.text;
            if (!linkKeys.has(label)) {
                linkKeys.add(label);
                picks.push({ label, link });
            }
        }
        return picks.length > 0 ? picks : undefined;
    }
};
TerminalLinkQuickpick = __decorate([
    __param(0, IQuickInputService)
], TerminalLinkQuickpick);
export { TerminalLinkQuickpick };
