/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CallHierarchyModel, } from 'vs/workbench/contrib/callHierarchy/common/callHierarchy';
import { CancellationToken } from 'vs/base/common/cancellation';
import { createMatches } from 'vs/base/common/filters';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { SymbolKinds } from 'vs/editor/common/languages';
import { compare } from 'vs/base/common/strings';
import { Range } from 'vs/editor/common/core/range';
import { localize } from 'vs/nls';
import { CSSIcon } from 'vs/base/common/codicons';
export class Call {
    item;
    locations;
    model;
    parent;
    constructor(item, locations, model, parent) {
        this.item = item;
        this.locations = locations;
        this.model = model;
        this.parent = parent;
    }
    static compare(a, b) {
        let res = compare(a.item.uri.toString(), b.item.uri.toString());
        if (res === 0) {
            res = Range.compareRangesUsingStarts(a.item.range, b.item.range);
        }
        return res;
    }
}
export class DataSource {
    getDirection;
    constructor(getDirection) {
        this.getDirection = getDirection;
    }
    hasChildren() {
        return true;
    }
    async getChildren(element) {
        if (element instanceof CallHierarchyModel) {
            return element.roots.map(root => new Call(root, undefined, element, undefined));
        }
        const { model, item } = element;
        if (this.getDirection() === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
            return (await model.resolveOutgoingCalls(item, CancellationToken.None)).map(call => {
                return new Call(call.to, call.fromRanges.map(range => ({ range, uri: item.uri })), model, element);
            });
        }
        else {
            return (await model.resolveIncomingCalls(item, CancellationToken.None)).map(call => {
                return new Call(call.from, call.fromRanges.map(range => ({ range, uri: call.from.uri })), model, element);
            });
        }
    }
}
export class Sorter {
    compare(element, otherElement) {
        return Call.compare(element, otherElement);
    }
}
export class IdentityProvider {
    getDirection;
    constructor(getDirection) {
        this.getDirection = getDirection;
    }
    getId(element) {
        let res = this.getDirection() + JSON.stringify(element.item.uri) + JSON.stringify(element.item.range);
        if (element.parent) {
            res += this.getId(element.parent);
        }
        return res;
    }
}
class CallRenderingTemplate {
    icon;
    label;
    constructor(icon, label) {
        this.icon = icon;
        this.label = label;
    }
}
export class CallRenderer {
    static id = 'CallRenderer';
    templateId = CallRenderer.id;
    renderTemplate(container) {
        container.classList.add('callhierarchy-element');
        const icon = document.createElement('div');
        container.appendChild(icon);
        const label = new IconLabel(container, { supportHighlights: true });
        return new CallRenderingTemplate(icon, label);
    }
    renderElement(node, _index, template) {
        const { element, filterData } = node;
        const deprecated = element.item.tags?.includes(1 /* SymbolTag.Deprecated */);
        template.icon.className = '';
        template.icon.classList.add('inline', ...CSSIcon.asClassNameArray(SymbolKinds.toIcon(element.item.kind)));
        template.label.setLabel(element.item.name, element.item.detail, { labelEscapeNewLines: true, matches: createMatches(filterData), strikethrough: deprecated });
    }
    disposeTemplate(template) {
        template.label.dispose();
    }
}
export class VirtualDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(_element) {
        return CallRenderer.id;
    }
}
export class AccessibilityProvider {
    getDirection;
    constructor(getDirection) {
        this.getDirection = getDirection;
    }
    getWidgetAriaLabel() {
        return localize('tree.aria', "Call Hierarchy");
    }
    getAriaLabel(element) {
        if (this.getDirection() === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
            return localize('from', "calls from {0}", element.item.name);
        }
        else {
            return localize('to', "callers of {0}", element.item.name);
        }
    }
}
