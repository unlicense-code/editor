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
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { MainContext } from '../common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { dispose } from 'vs/base/common/lifecycle';
import { getCodiconAriaLabel } from 'vs/base/common/codicons';
let MainThreadStatusBar = class MainThreadStatusBar {
    statusbarService;
    entries = new Map();
    constructor(_extHostContext, statusbarService) {
        this.statusbarService = statusbarService;
    }
    dispose() {
        this.entries.forEach(entry => entry.accessor.dispose());
        this.entries.clear();
    }
    $setEntry(entryId, id, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation) {
        // if there are icons in the text use the tooltip for the aria label
        let ariaLabel;
        let role = undefined;
        if (accessibilityInformation) {
            ariaLabel = accessibilityInformation.label;
            role = accessibilityInformation.role;
        }
        else {
            ariaLabel = getCodiconAriaLabel(text);
            if (tooltip) {
                const tooltipString = typeof tooltip === 'string' ? tooltip : tooltip.value;
                ariaLabel += `, ${tooltipString}`;
            }
        }
        const entry = { name, text, tooltip, command, color, backgroundColor, ariaLabel, role };
        if (typeof priority === 'undefined') {
            priority = 0;
        }
        const alignment = alignLeft ? 0 /* StatusbarAlignment.LEFT */ : 1 /* StatusbarAlignment.RIGHT */;
        // Reset existing entry if alignment or priority changed
        let existingEntry = this.entries.get(entryId);
        if (existingEntry && (existingEntry.alignment !== alignment || existingEntry.priority !== priority)) {
            dispose(existingEntry.accessor);
            this.entries.delete(entryId);
            existingEntry = undefined;
        }
        // Create new entry if not existing
        if (!existingEntry) {
            this.entries.set(entryId, { accessor: this.statusbarService.addEntry(entry, id, alignment, priority), alignment, priority });
        }
        // Otherwise update
        else {
            existingEntry.accessor.update(entry);
        }
    }
    $dispose(id) {
        const entry = this.entries.get(id);
        if (entry) {
            dispose(entry.accessor);
            this.entries.delete(id);
        }
    }
};
MainThreadStatusBar = __decorate([
    extHostNamedCustomer(MainContext.MainThreadStatusBar),
    __param(1, IStatusbarService)
], MainThreadStatusBar);
export { MainThreadStatusBar };
