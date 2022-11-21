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
import * as DOM from 'vs/base/browser/dom';
import { DefaultStyleController } from 'vs/base/browser/ui/list/listWidget';
import { Iterable } from 'vs/base/common/iterator';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IListService, WorkbenchObjectTree } from 'vs/platform/list/browser/listService';
import { editorBackground, focusBorder, foreground, transparent } from 'vs/platform/theme/common/colorRegistry';
import { attachStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { SettingsTreeFilter } from 'vs/workbench/contrib/preferences/browser/settingsTree';
import { SettingsTreeGroupElement, SettingsTreeSettingElement } from 'vs/workbench/contrib/preferences/browser/settingsTreeModels';
import { settingsHeaderForeground } from 'vs/workbench/contrib/preferences/common/settingsEditorColorRegistry';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
const $ = DOM.$;
let TOCTreeModel = class TOCTreeModel {
    _viewState;
    environmentService;
    _currentSearchModel = null;
    _settingsTreeRoot;
    constructor(_viewState, environmentService) {
        this._viewState = _viewState;
        this.environmentService = environmentService;
    }
    get settingsTreeRoot() {
        return this._settingsTreeRoot;
    }
    set settingsTreeRoot(value) {
        this._settingsTreeRoot = value;
        this.update();
    }
    get currentSearchModel() {
        return this._currentSearchModel;
    }
    set currentSearchModel(model) {
        this._currentSearchModel = model;
        this.update();
    }
    get children() {
        return this._settingsTreeRoot.children;
    }
    update() {
        if (this._settingsTreeRoot) {
            this.updateGroupCount(this._settingsTreeRoot);
        }
    }
    updateGroupCount(group) {
        group.children.forEach(child => {
            if (child instanceof SettingsTreeGroupElement) {
                this.updateGroupCount(child);
            }
        });
        const childCount = group.children
            .filter(child => child instanceof SettingsTreeGroupElement)
            .reduce((acc, cur) => acc + cur.count, 0);
        group.count = childCount + this.getGroupCount(group);
    }
    getGroupCount(group) {
        return group.children.filter(child => {
            if (!(child instanceof SettingsTreeSettingElement)) {
                return false;
            }
            if (this._currentSearchModel && !this._currentSearchModel.root.containsSetting(child.setting.key)) {
                return false;
            }
            // Check everything that the SettingsFilter checks except whether it's filtered by a category
            const isRemote = !!this.environmentService.remoteAuthority;
            return child.matchesScope(this._viewState.settingsTarget, isRemote) &&
                child.matchesAllTags(this._viewState.tagFilters) &&
                child.matchesAnyFeature(this._viewState.featureFilters) &&
                child.matchesAnyExtension(this._viewState.extensionFilters) &&
                child.matchesAnyId(this._viewState.idFilters);
        }).length;
    }
};
TOCTreeModel = __decorate([
    __param(1, IWorkbenchEnvironmentService)
], TOCTreeModel);
export { TOCTreeModel };
const TOC_ENTRY_TEMPLATE_ID = 'settings.toc.entry';
export class TOCRenderer {
    templateId = TOC_ENTRY_TEMPLATE_ID;
    renderTemplate(container) {
        return {
            labelElement: DOM.append(container, $('.settings-toc-entry')),
            countElement: DOM.append(container, $('.settings-toc-count'))
        };
    }
    renderElement(node, index, template) {
        const element = node.element;
        const count = element.count;
        const label = element.label;
        template.labelElement.textContent = label;
        template.labelElement.title = label;
        if (count) {
            template.countElement.textContent = ` (${count})`;
        }
        else {
            template.countElement.textContent = '';
        }
    }
    disposeTemplate(templateData) {
    }
}
class TOCTreeDelegate {
    getTemplateId(element) {
        return TOC_ENTRY_TEMPLATE_ID;
    }
    getHeight(element) {
        return 22;
    }
}
export function createTOCIterator(model, tree) {
    const groupChildren = model.children.filter(c => c instanceof SettingsTreeGroupElement);
    return Iterable.map(groupChildren, g => {
        const hasGroupChildren = g.children.some(c => c instanceof SettingsTreeGroupElement);
        return {
            element: g,
            collapsed: undefined,
            collapsible: hasGroupChildren,
            children: g instanceof SettingsTreeGroupElement ?
                createTOCIterator(g, tree) :
                undefined
        };
    });
}
class SettingsAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize({
            key: 'settingsTOC',
            comment: ['A label for the table of contents for the full settings list']
        }, "Settings Table of Contents");
    }
    getAriaLabel(element) {
        if (!element) {
            return '';
        }
        if (element instanceof SettingsTreeGroupElement) {
            return localize('groupRowAriaLabel', "{0}, group", element.label);
        }
        return '';
    }
    getAriaLevel(element) {
        let i = 1;
        while (element instanceof SettingsTreeGroupElement && element.parent) {
            i++;
            element = element.parent;
        }
        return i;
    }
}
let TOCTree = class TOCTree extends WorkbenchObjectTree {
    constructor(container, viewState, contextKeyService, listService, themeService, configurationService, instantiationService) {
        // test open mode
        const filter = instantiationService.createInstance(SettingsTreeFilter, viewState);
        const options = {
            filter,
            multipleSelectionSupport: false,
            identityProvider: {
                getId(e) {
                    return e.id;
                }
            },
            styleController: id => new DefaultStyleController(DOM.createStyleSheet(container), id),
            accessibilityProvider: instantiationService.createInstance(SettingsAccessibilityProvider),
            collapseByDefault: true,
            horizontalScrolling: false,
            hideTwistiesOfChildlessElements: true
        };
        super('SettingsTOC', container, new TOCTreeDelegate(), [new TOCRenderer()], options, instantiationService, contextKeyService, listService, themeService, configurationService);
        this.disposables.add(attachStyler(themeService, {
            listBackground: editorBackground,
            listFocusOutline: focusBorder,
            listActiveSelectionBackground: editorBackground,
            listActiveSelectionForeground: settingsHeaderForeground,
            listFocusAndSelectionBackground: editorBackground,
            listFocusAndSelectionForeground: settingsHeaderForeground,
            listFocusBackground: editorBackground,
            listFocusForeground: transparent(foreground, 0.9),
            listHoverForeground: transparent(foreground, 0.9),
            listHoverBackground: editorBackground,
            listInactiveSelectionBackground: editorBackground,
            listInactiveSelectionForeground: settingsHeaderForeground,
            listInactiveFocusBackground: editorBackground,
            listInactiveFocusOutline: editorBackground
        }, colors => {
            this.style(colors);
        }));
    }
};
TOCTree = __decorate([
    __param(2, IContextKeyService),
    __param(3, IListService),
    __param(4, IThemeService),
    __param(5, IConfigurationService),
    __param(6, IInstantiationService)
], TOCTree);
export { TOCTree };
