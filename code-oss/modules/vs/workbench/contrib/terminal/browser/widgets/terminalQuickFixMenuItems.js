/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Codicon } from 'vs/base/common/codicons';
import { CodeActionKind } from 'vs/editor/contrib/codeAction/common/types';
import { localize } from 'vs/nls';
export var TerminalQuickFixType;
(function (TerminalQuickFixType) {
    TerminalQuickFixType["Command"] = "command";
    TerminalQuickFixType["Opener"] = "opener";
    TerminalQuickFixType["Port"] = "port";
})(TerminalQuickFixType || (TerminalQuickFixType = {}));
export class TerminalQuickFix {
    action;
    type;
    disabled;
    title;
    constructor(action, type, title, disabled) {
        this.action = action;
        this.disabled = disabled;
        this.title = title;
        this.type = type;
    }
}
export function toMenuItems(inputQuickFixes, showHeaders) {
    const menuItems = [];
    menuItems.push({
        kind: "header" /* ActionListItemKind.Header */,
        group: {
            kind: CodeActionKind.QuickFix,
            title: localize('codeAction.widget.id.quickfix', 'Quick Fix')
        }
    });
    for (const quickFix of showHeaders ? inputQuickFixes : inputQuickFixes.filter(i => !!i.action)) {
        if (!quickFix.disabled && quickFix.action) {
            menuItems.push({
                kind: "action" /* ActionListItemKind.Action */,
                item: quickFix,
                group: {
                    kind: CodeActionKind.QuickFix,
                    icon: getQuickFixIcon(quickFix),
                    title: quickFix.action.label
                },
                disabled: false,
                label: quickFix.title
            });
        }
    }
    return menuItems;
}
function getQuickFixIcon(quickFix) {
    switch (quickFix.type) {
        case "opener" /* TerminalQuickFixType.Opener */:
            // TODO: if it's a file link, use the open file icon
            return { codicon: Codicon.link };
        case "command" /* TerminalQuickFixType.Command */:
            return { codicon: Codicon.run };
        case "port" /* TerminalQuickFixType.Port */:
            return { codicon: Codicon.debugDisconnect };
    }
    return { codicon: Codicon.lightBulb };
}
