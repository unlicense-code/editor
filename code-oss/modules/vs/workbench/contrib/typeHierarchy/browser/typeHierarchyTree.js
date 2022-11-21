/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TypeHierarchyModel } from 'vs/workbench/contrib/typeHierarchy/common/typeHierarchy';
import { CancellationToken } from 'vs/base/common/cancellation';
import { createMatches } from 'vs/base/common/filters';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { SymbolKinds } from 'vs/editor/common/languages';
import { compare } from 'vs/base/common/strings';
import { Range } from 'vs/editor/common/core/range';
import { localize } from 'vs/nls';
import { CSSIcon } from 'vs/base/common/codicons';
export class Type {
    item;
    model;
    parent;
    constructor(item, model, parent) {
        this.item = item;
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
        if (element instanceof TypeHierarchyModel) {
            return element.roots.map(root => new Type(root, element, undefined));
        }
        const { model, item } = element;
        if (this.getDirection() === "supertypes" /* TypeHierarchyDirection.Supertypes */) {
            return (await model.provideSupertypes(item, CancellationToken.None)).map(item => {
                return new Type(item, model, element);
            });
        }
        else {
            return (await model.provideSubtypes(item, CancellationToken.None)).map(item => {
                return new Type(item, model, element);
            });
        }
    }
}
export class Sorter {
    compare(element, otherElement) {
        return Type.compare(element, otherElement);
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
class TypeRenderingTemplate {
    icon;
    label;
    constructor(icon, label) {
        this.icon = icon;
        this.label = label;
    }
}
export class TypeRenderer {
    static id = 'TypeRenderer';
    templateId = TypeRenderer.id;
    renderTemplate(container) {
        container.classList.add('typehierarchy-element');
        const icon = document.createElement('div');
        container.appendChild(icon);
        const label = new IconLabel(container, { supportHighlights: true });
        return new TypeRenderingTemplate(icon, label);
    }
    renderElement(node, _index, template) {
        const { element, filterData } = node;
        const deprecated = element.item.tags?.includes(1 /* SymbolTag.Deprecated */);
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
        return TypeRenderer.id;
    }
}
export class AccessibilityProvider {
    getDirection;
    constructor(getDirection) {
        this.getDirection = getDirection;
    }
    getWidgetAriaLabel() {
        return localize('tree.aria', "Type Hierarchy");
    }
    getAriaLabel(element) {
        if (this.getDirection() === "supertypes" /* TypeHierarchyDirection.Supertypes */) {
            return localize('supertypes', "supertypes of {0}", element.item.name);
        }
        else {
            return localize('subtypes', "subtypes of {0}", element.item.name);
        }
    }
}
