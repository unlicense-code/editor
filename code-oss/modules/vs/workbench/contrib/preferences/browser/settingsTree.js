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
import { BrowserFeatures } from 'vs/base/browser/canIUse';
import * as DOM from 'vs/base/browser/dom';
import { alert as ariaAlert } from 'vs/base/browser/ui/aria/aria';
import { Button } from 'vs/base/browser/ui/button/button';
import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { CachedListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { DefaultStyleController } from 'vs/base/browser/ui/list/listWidget';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { ObjectTreeModel } from 'vs/base/browser/ui/tree/objectTreeModel';
import { Action, Separator } from 'vs/base/common/actions';
import * as arrays from 'vs/base/common/arrays';
import { Color } from 'vs/base/common/color';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, DisposableStore, dispose, isDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { isIOS } from 'vs/base/common/platform';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { isDefined, isUndefinedOrNull } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { getLanguageTagSettingPlainKey, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { editorBackground, foreground } from 'vs/platform/theme/common/colorRegistry';
import { attachInputBoxStyler, attachSelectBoxStyler, attachStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { getIgnoredSettings } from 'vs/platform/userDataSync/common/settingsMerge';
import { inspectSetting, settingKeyToDisplayFormat, SettingsTreeGroupElement, SettingsTreeNewExtensionsElement, SettingsTreeSettingElement } from 'vs/workbench/contrib/preferences/browser/settingsTreeModels';
import { ExcludeSettingWidget, ListSettingWidget, ObjectSettingDropdownWidget, ObjectSettingCheckboxWidget } from 'vs/workbench/contrib/preferences/browser/settingsWidgets';
import { LANGUAGE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU } from 'vs/workbench/contrib/preferences/common/preferences';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { SettingValueType } from 'vs/workbench/services/preferences/common/preferences';
import { getDefaultIgnoredSettings, IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { getInvalidTypeError } from 'vs/workbench/services/preferences/common/preferencesValidation';
import { Codicon } from 'vs/base/common/codicons';
import { SimpleIconLabel } from 'vs/base/browser/ui/iconLabel/simpleIconLabel';
import { IListService, WorkbenchObjectTree } from 'vs/platform/list/browser/listService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { settingsMoreActionIcon } from 'vs/workbench/contrib/preferences/browser/preferencesIcons';
import { MarkdownRenderer } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { settingsNumberInputBackground, settingsNumberInputBorder, settingsNumberInputForeground, settingsSelectBackground, settingsSelectBorder, settingsSelectForeground, settingsSelectListBorder, settingsTextInputBackground, settingsTextInputBorder, settingsTextInputForeground } from 'vs/workbench/contrib/preferences/common/settingsEditorColorRegistry';
import { getIndicatorsLabelAriaLabel, SettingsTreeIndicatorsLabel } from 'vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { defaultButtonStyles, getButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
const $ = DOM.$;
function getExcludeDisplayValue(element) {
    const data = element.isConfigured ?
        { ...element.defaultValue, ...element.scopeValue } :
        element.defaultValue;
    return Object.keys(data)
        .filter(key => !!data[key])
        .map(key => {
        const value = data[key];
        const sibling = typeof value === 'boolean' ? undefined : value.when;
        return {
            value: {
                type: 'string',
                data: key
            },
            sibling,
            elementType: element.valueType
        };
    });
}
function areAllPropertiesDefined(properties, itemsToDisplay) {
    const staticProperties = new Set(properties);
    itemsToDisplay.forEach(({ key }) => staticProperties.delete(key.data));
    return staticProperties.size === 0;
}
function getEnumOptionsFromSchema(schema) {
    if (schema.anyOf) {
        return arrays.flatten(schema.anyOf.map(getEnumOptionsFromSchema));
    }
    const enumDescriptions = schema.enumDescriptions ?? [];
    return (schema.enum ?? []).map((value, idx) => {
        const description = idx < enumDescriptions.length
            ? enumDescriptions[idx]
            : undefined;
        return { value, description };
    });
}
function getObjectValueType(schema) {
    if (schema.anyOf) {
        const subTypes = schema.anyOf.map(getObjectValueType);
        if (subTypes.some(type => type === 'enum')) {
            return 'enum';
        }
        return 'string';
    }
    if (schema.type === 'boolean') {
        return 'boolean';
    }
    else if (schema.type === 'string' && isDefined(schema.enum) && schema.enum.length > 0) {
        return 'enum';
    }
    else {
        return 'string';
    }
}
function getObjectDisplayValue(element) {
    const elementDefaultValue = typeof element.defaultValue === 'object'
        ? element.defaultValue ?? {}
        : {};
    const elementScopeValue = typeof element.scopeValue === 'object'
        ? element.scopeValue ?? {}
        : {};
    const data = element.isConfigured ?
        { ...elementDefaultValue, ...elementScopeValue } :
        elementDefaultValue;
    const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
    const patternsAndSchemas = Object
        .entries(objectPatternProperties ?? {})
        .map(([pattern, schema]) => ({
        pattern: new RegExp(pattern),
        schema
    }));
    const wellDefinedKeyEnumOptions = Object.entries(objectProperties ?? {}).map(([key, schema]) => ({ value: key, description: schema.description }));
    return Object.keys(data).map(key => {
        const defaultValue = elementDefaultValue[key];
        if (isDefined(objectProperties) && key in objectProperties) {
            if (element.setting.allKeysAreBoolean) {
                return {
                    key: {
                        type: 'string',
                        data: key
                    },
                    value: {
                        type: 'boolean',
                        data: data[key]
                    },
                    keyDescription: objectProperties[key].description,
                    removable: false
                };
            }
            const valueEnumOptions = getEnumOptionsFromSchema(objectProperties[key]);
            return {
                key: {
                    type: 'enum',
                    data: key,
                    options: wellDefinedKeyEnumOptions,
                },
                value: {
                    type: getObjectValueType(objectProperties[key]),
                    data: data[key],
                    options: valueEnumOptions,
                },
                keyDescription: objectProperties[key].description,
                removable: isUndefinedOrNull(defaultValue),
            };
        }
        // The row is removable if it doesn't have a default value assigned.
        // Otherwise, it is not removable, but its value can be reset to the default.
        const removable = !defaultValue;
        const schema = patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
        if (schema) {
            const valueEnumOptions = getEnumOptionsFromSchema(schema);
            return {
                key: { type: 'string', data: key },
                value: {
                    type: getObjectValueType(schema),
                    data: data[key],
                    options: valueEnumOptions,
                },
                keyDescription: schema.description,
                removable,
            };
        }
        const additionalValueEnums = getEnumOptionsFromSchema(typeof objectAdditionalProperties === 'boolean'
            ? {}
            : objectAdditionalProperties ?? {});
        return {
            key: { type: 'string', data: key },
            value: {
                type: typeof objectAdditionalProperties === 'object' ? getObjectValueType(objectAdditionalProperties) : 'string',
                data: data[key],
                options: additionalValueEnums,
            },
            keyDescription: typeof objectAdditionalProperties === 'object' ? objectAdditionalProperties.description : undefined,
            removable,
        };
    }).filter(item => !isUndefinedOrNull(item.value.data));
}
function createArraySuggester(element) {
    return (keys, idx) => {
        const enumOptions = [];
        if (element.setting.enum) {
            element.setting.enum.forEach((key, i) => {
                // include the currently selected value, even if uniqueItems is true
                if (!element.setting.uniqueItems || (idx !== undefined && key === keys[idx]) || !keys.includes(key)) {
                    const description = element.setting.enumDescriptions?.[i];
                    enumOptions.push({ value: key, description });
                }
            });
        }
        return enumOptions.length > 0
            ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
            : undefined;
    };
}
function createObjectKeySuggester(element) {
    const { objectProperties } = element.setting;
    const allStaticKeys = Object.keys(objectProperties ?? {});
    return keys => {
        const existingKeys = new Set(keys);
        const enumOptions = [];
        allStaticKeys.forEach(staticKey => {
            if (!existingKeys.has(staticKey)) {
                enumOptions.push({ value: staticKey, description: objectProperties[staticKey].description });
            }
        });
        return enumOptions.length > 0
            ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
            : undefined;
    };
}
function createObjectValueSuggester(element) {
    const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
    const patternsAndSchemas = Object
        .entries(objectPatternProperties ?? {})
        .map(([pattern, schema]) => ({
        pattern: new RegExp(pattern),
        schema
    }));
    return (key) => {
        let suggestedSchema;
        if (isDefined(objectProperties) && key in objectProperties) {
            suggestedSchema = objectProperties[key];
        }
        const patternSchema = suggestedSchema ?? patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
        if (isDefined(patternSchema)) {
            suggestedSchema = patternSchema;
        }
        else if (isDefined(objectAdditionalProperties) && typeof objectAdditionalProperties === 'object') {
            suggestedSchema = objectAdditionalProperties;
        }
        if (isDefined(suggestedSchema)) {
            const type = getObjectValueType(suggestedSchema);
            if (type === 'boolean') {
                return { type, data: suggestedSchema.default ?? true };
            }
            else if (type === 'enum') {
                const options = getEnumOptionsFromSchema(suggestedSchema);
                return { type, data: suggestedSchema.default ?? options[0].value, options };
            }
            else {
                return { type, data: suggestedSchema.default ?? '' };
            }
        }
        return;
    };
}
function isNonNullableNumericType(type) {
    return type === 'number' || type === 'integer';
}
function parseNumericObjectValues(dataElement, v) {
    const newRecord = {};
    for (const key in v) {
        // Set to true/false once we're sure of the answer
        let keyMatchesNumericProperty;
        const patternProperties = dataElement.setting.objectPatternProperties;
        const properties = dataElement.setting.objectProperties;
        const additionalProperties = dataElement.setting.objectAdditionalProperties;
        // Match the current record key against the properties of the object
        if (properties) {
            for (const propKey in properties) {
                if (propKey === key) {
                    keyMatchesNumericProperty = isNonNullableNumericType(properties[propKey].type);
                    break;
                }
            }
        }
        if (keyMatchesNumericProperty === undefined && patternProperties) {
            for (const patternKey in patternProperties) {
                if (key.match(patternKey)) {
                    keyMatchesNumericProperty = isNonNullableNumericType(patternProperties[patternKey].type);
                    break;
                }
            }
        }
        if (keyMatchesNumericProperty === undefined && additionalProperties && typeof additionalProperties !== 'boolean') {
            if (isNonNullableNumericType(additionalProperties.type)) {
                keyMatchesNumericProperty = true;
            }
        }
        newRecord[key] = keyMatchesNumericProperty ? Number(v[key]) : v[key];
    }
    return newRecord;
}
function getListDisplayValue(element) {
    if (!element.value || !Array.isArray(element.value)) {
        return [];
    }
    if (element.setting.arrayItemType === 'enum') {
        let enumOptions = [];
        if (element.setting.enum) {
            enumOptions = element.setting.enum.map((setting, i) => {
                return {
                    value: setting,
                    description: element.setting.enumDescriptions?.[i]
                };
            });
        }
        return element.value.map((key) => {
            return {
                value: {
                    type: 'enum',
                    data: key,
                    options: enumOptions
                }
            };
        });
    }
    else {
        return element.value.map((key) => {
            return {
                value: {
                    type: 'string',
                    data: key
                }
            };
        });
    }
}
function getShowAddButtonList(dataElement, listDisplayValue) {
    if (dataElement.setting.enum && dataElement.setting.uniqueItems) {
        return dataElement.setting.enum.length - listDisplayValue.length > 0;
    }
    else {
        return true;
    }
}
export function resolveSettingsTree(tocData, coreSettingsGroups, logService) {
    const allSettings = getFlatSettings(coreSettingsGroups);
    return {
        tree: _resolveSettingsTree(tocData, allSettings, logService),
        leftoverSettings: allSettings
    };
}
export function resolveConfiguredUntrustedSettings(groups, target, languageFilter, configurationService) {
    const allSettings = getFlatSettings(groups);
    return [...allSettings].filter(setting => setting.restricted && inspectSetting(setting.key, target, languageFilter, configurationService).isConfigured);
}
function compareNullableIntegers(a, b) {
    const firstElem = a ?? Number.MAX_SAFE_INTEGER;
    const secondElem = b ?? Number.MAX_SAFE_INTEGER;
    return firstElem - secondElem;
}
export async function createTocTreeForExtensionSettings(extensionService, groups) {
    const extGroupTree = new Map();
    const addEntryToTree = (extensionId, extensionName, childEntry) => {
        if (!extGroupTree.has(extensionId)) {
            const rootEntry = {
                id: extensionId,
                label: extensionName,
                children: []
            };
            extGroupTree.set(extensionId, rootEntry);
        }
        extGroupTree.get(extensionId).children.push(childEntry);
    };
    const processGroupEntry = async (group) => {
        const flatSettings = arrays.flatten(group.sections.map(section => section.settings));
        const extensionId = group.extensionInfo.id;
        const extension = await extensionService.getExtension(extensionId);
        const extensionName = extension?.displayName ?? extension?.name ?? extensionId;
        // Each group represents a single category of settings.
        // If the extension author forgets to specify an id for the group,
        // fall back to the title given to the group.
        const childEntry = {
            id: group.id || group.title,
            label: group.title,
            order: group.order,
            settings: flatSettings
        };
        addEntryToTree(extensionId, extensionName, childEntry);
    };
    const processPromises = groups.map(g => processGroupEntry(g));
    return Promise.all(processPromises).then(() => {
        const extGroups = [];
        for (const extensionRootEntry of extGroupTree.values()) {
            for (const child of extensionRootEntry.children) {
                // Sort the individual settings of the child.
                child.settings?.sort((a, b) => {
                    return compareNullableIntegers(a.order, b.order);
                });
            }
            if (extensionRootEntry.children.length === 1) {
                // There is a single category for this extension.
                // Push a flattened setting.
                extGroups.push({
                    id: extensionRootEntry.id,
                    label: extensionRootEntry.children[0].label,
                    settings: extensionRootEntry.children[0].settings
                });
            }
            else {
                // Sort the categories.
                extensionRootEntry.children.sort((a, b) => {
                    return compareNullableIntegers(a.order, b.order);
                });
                // If there is a category that matches the setting name,
                // add the settings in manually as "ungrouped" settings.
                // https://github.com/microsoft/vscode/issues/137259
                const ungroupedChild = extensionRootEntry.children.find(child => child.label === extensionRootEntry.label);
                if (ungroupedChild && !ungroupedChild.children) {
                    const groupedChildren = extensionRootEntry.children.filter(child => child !== ungroupedChild);
                    extGroups.push({
                        id: extensionRootEntry.id,
                        label: extensionRootEntry.label,
                        settings: ungroupedChild.settings,
                        children: groupedChildren
                    });
                }
                else {
                    // Push all the groups as-is.
                    extGroups.push(extensionRootEntry);
                }
            }
        }
        // Sort the outermost settings.
        extGroups.sort((a, b) => a.label.localeCompare(b.label));
        return {
            id: 'extensions',
            label: localize('extensions', "Extensions"),
            children: extGroups
        };
    });
}
function _resolveSettingsTree(tocData, allSettings, logService) {
    let children;
    if (tocData.children) {
        children = tocData.children
            .map(child => _resolveSettingsTree(child, allSettings, logService))
            .filter(child => (child.children && child.children.length) || (child.settings && child.settings.length));
    }
    let settings;
    if (tocData.settings) {
        settings = arrays.flatten(tocData.settings.map(pattern => getMatchingSettings(allSettings, pattern, logService)));
    }
    if (!children && !settings) {
        throw new Error(`TOC node has no child groups or settings: ${tocData.id}`);
    }
    return {
        id: tocData.id,
        label: tocData.label,
        children,
        settings
    };
}
const knownDynamicSettingGroups = [
    /^settingsSync\..*/,
    /^sync\..*/,
    /^workbench.fontAliasing$/,
];
function getMatchingSettings(allSettings, pattern, logService) {
    const result = [];
    allSettings.forEach(s => {
        if (settingMatches(s, pattern)) {
            result.push(s);
            allSettings.delete(s);
        }
    });
    if (!result.length && !knownDynamicSettingGroups.some(r => r.test(pattern))) {
        logService.warn(`Settings pattern "${pattern}" doesn't match any settings`);
    }
    return result.sort((a, b) => a.key.localeCompare(b.key));
}
const settingPatternCache = new Map();
export function createSettingMatchRegExp(pattern) {
    pattern = escapeRegExpCharacters(pattern)
        .replace(/\\\*/g, '.*');
    return new RegExp(`^${pattern}$`, 'i');
}
function settingMatches(s, pattern) {
    let regExp = settingPatternCache.get(pattern);
    if (!regExp) {
        regExp = createSettingMatchRegExp(pattern);
        settingPatternCache.set(pattern, regExp);
    }
    return regExp.test(s.key);
}
function getFlatSettings(settingsGroups) {
    const result = new Set();
    for (const group of settingsGroups) {
        for (const section of group.sections) {
            for (const s of section.settings) {
                if (!s.overrides || !s.overrides.length) {
                    result.add(s);
                }
            }
        }
    }
    return result;
}
const SETTINGS_TEXT_TEMPLATE_ID = 'settings.text.template';
const SETTINGS_MULTILINE_TEXT_TEMPLATE_ID = 'settings.multilineText.template';
const SETTINGS_NUMBER_TEMPLATE_ID = 'settings.number.template';
const SETTINGS_ENUM_TEMPLATE_ID = 'settings.enum.template';
const SETTINGS_BOOL_TEMPLATE_ID = 'settings.bool.template';
const SETTINGS_ARRAY_TEMPLATE_ID = 'settings.array.template';
const SETTINGS_EXCLUDE_TEMPLATE_ID = 'settings.exclude.template';
const SETTINGS_OBJECT_TEMPLATE_ID = 'settings.object.template';
const SETTINGS_BOOL_OBJECT_TEMPLATE_ID = 'settings.boolObject.template';
const SETTINGS_COMPLEX_TEMPLATE_ID = 'settings.complex.template';
const SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID = 'settings.newExtensions.template';
const SETTINGS_ELEMENT_TEMPLATE_ID = 'settings.group.template';
function removeChildrenFromTabOrder(node) {
    const focusableElements = node.querySelectorAll(`
		[tabindex="0"],
		input:not([tabindex="-1"]),
		select:not([tabindex="-1"]),
		textarea:not([tabindex="-1"]),
		a:not([tabindex="-1"]),
		button:not([tabindex="-1"]),
		area:not([tabindex="-1"])
	`);
    focusableElements.forEach(element => {
        element.setAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR, 'true');
        element.setAttribute('tabindex', '-1');
    });
}
function addChildrenToTabOrder(node) {
    const focusableElements = node.querySelectorAll(`[${AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR}="true"]`);
    focusableElements.forEach(element => {
        element.removeAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR);
        element.setAttribute('tabindex', '0');
    });
}
let AbstractSettingRenderer = class AbstractSettingRenderer extends Disposable {
    settingActions;
    disposableActionFactory;
    _themeService;
    _contextViewService;
    _openerService;
    _instantiationService;
    _commandService;
    _contextMenuService;
    _keybindingService;
    _configService;
    static CONTROL_CLASS = 'setting-control-focus-target';
    static CONTROL_SELECTOR = '.' + AbstractSettingRenderer.CONTROL_CLASS;
    static CONTENTS_CLASS = 'setting-item-contents';
    static CONTENTS_SELECTOR = '.' + AbstractSettingRenderer.CONTENTS_CLASS;
    static ALL_ROWS_SELECTOR = '.monaco-list-row';
    static SETTING_KEY_ATTR = 'data-key';
    static SETTING_ID_ATTR = 'data-id';
    static ELEMENT_FOCUSABLE_ATTR = 'data-focusable';
    _onDidClickOverrideElement = this._register(new Emitter());
    onDidClickOverrideElement = this._onDidClickOverrideElement.event;
    _onDidChangeSetting = this._register(new Emitter());
    onDidChangeSetting = this._onDidChangeSetting.event;
    _onDidOpenSettings = this._register(new Emitter());
    onDidOpenSettings = this._onDidOpenSettings.event;
    _onDidClickSettingLink = this._register(new Emitter());
    onDidClickSettingLink = this._onDidClickSettingLink.event;
    _onDidFocusSetting = this._register(new Emitter());
    onDidFocusSetting = this._onDidFocusSetting.event;
    ignoredSettings;
    _onDidChangeIgnoredSettings = this._register(new Emitter());
    onDidChangeIgnoredSettings = this._onDidChangeIgnoredSettings.event;
    _onDidChangeSettingHeight = this._register(new Emitter());
    onDidChangeSettingHeight = this._onDidChangeSettingHeight.event;
    _onApplyFilter = this._register(new Emitter());
    onApplyFilter = this._onApplyFilter.event;
    markdownRenderer;
    constructor(settingActions, disposableActionFactory, _themeService, _contextViewService, _openerService, _instantiationService, _commandService, _contextMenuService, _keybindingService, _configService) {
        super();
        this.settingActions = settingActions;
        this.disposableActionFactory = disposableActionFactory;
        this._themeService = _themeService;
        this._contextViewService = _contextViewService;
        this._openerService = _openerService;
        this._instantiationService = _instantiationService;
        this._commandService = _commandService;
        this._contextMenuService = _contextMenuService;
        this._keybindingService = _keybindingService;
        this._configService = _configService;
        this.markdownRenderer = this._register(_instantiationService.createInstance(MarkdownRenderer, {}));
        this.ignoredSettings = getIgnoredSettings(getDefaultIgnoredSettings(), this._configService);
        this._register(this._configService.onDidChangeConfiguration(e => {
            this.ignoredSettings = getIgnoredSettings(getDefaultIgnoredSettings(), this._configService);
            this._onDidChangeIgnoredSettings.fire();
        }));
    }
    renderCommonTemplate(tree, _container, typeClass) {
        _container.classList.add('setting-item');
        _container.classList.add('setting-item-' + typeClass);
        const toDispose = new DisposableStore();
        const container = DOM.append(_container, $(AbstractSettingRenderer.CONTENTS_SELECTOR));
        container.classList.add('settings-row-inner-container');
        const titleElement = DOM.append(container, $('.setting-item-title'));
        const labelCategoryContainer = DOM.append(titleElement, $('.setting-item-cat-label-container'));
        const categoryElement = DOM.append(labelCategoryContainer, $('span.setting-item-category'));
        const labelElementContainer = DOM.append(labelCategoryContainer, $('span.setting-item-label'));
        const labelElement = new SimpleIconLabel(labelElementContainer);
        const indicatorsLabel = this._instantiationService.createInstance(SettingsTreeIndicatorsLabel, titleElement);
        toDispose.add(indicatorsLabel);
        const descriptionElement = DOM.append(container, $('.setting-item-description'));
        const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
        modifiedIndicatorElement.title = localize('modified', "The setting has been configured in the current scope.");
        const valueElement = DOM.append(container, $('.setting-item-value'));
        const controlElement = DOM.append(valueElement, $('div.setting-item-control'));
        const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
        const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
        const toolbar = this.renderSettingToolbar(toolbarContainer);
        const template = {
            toDispose,
            elementDisposables: toDispose.add(new DisposableStore()),
            containerElement: container,
            categoryElement,
            labelElement,
            descriptionElement,
            controlElement,
            deprecationWarningElement,
            indicatorsLabel,
            toolbar
        };
        // Prevent clicks from being handled by list
        toDispose.add(DOM.addDisposableListener(controlElement, DOM.EventType.MOUSE_DOWN, e => e.stopPropagation()));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
        return template;
    }
    addSettingElementFocusHandler(template) {
        const focusTracker = DOM.trackFocus(template.containerElement);
        template.toDispose.add(focusTracker);
        focusTracker.onDidBlur(() => {
            if (template.containerElement.classList.contains('focused')) {
                template.containerElement.classList.remove('focused');
            }
        });
        focusTracker.onDidFocus(() => {
            template.containerElement.classList.add('focused');
            if (template.context) {
                this._onDidFocusSetting.fire(template.context);
            }
        });
    }
    renderSettingToolbar(container) {
        const toggleMenuKeybinding = this._keybindingService.lookupKeybinding(SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU);
        let toggleMenuTitle = localize('settingsContextMenuTitle', "More Actions... ");
        if (toggleMenuKeybinding) {
            toggleMenuTitle += ` (${toggleMenuKeybinding && toggleMenuKeybinding.getLabel()})`;
        }
        const toolbar = new ToolBar(container, this._contextMenuService, {
            toggleMenuTitle,
            renderDropdownAsChildElement: !isIOS,
            moreIcon: settingsMoreActionIcon
        });
        return toolbar;
    }
    renderSettingElement(node, index, template) {
        const element = node.element;
        template.context = element;
        template.toolbar.context = element;
        const actions = this.disposableActionFactory(element.setting);
        actions.forEach(a => isDisposable(a) && template.elementDisposables.add(a));
        template.toolbar.setActions([], [...this.settingActions, ...actions]);
        const setting = element.setting;
        template.containerElement.classList.toggle('is-configured', element.isConfigured);
        template.containerElement.setAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR, element.setting.key);
        template.containerElement.setAttribute(AbstractSettingRenderer.SETTING_ID_ATTR, element.id);
        const titleTooltip = setting.key + (element.isConfigured ? ' - Modified' : '');
        template.categoryElement.textContent = element.displayCategory && (element.displayCategory + ': ');
        template.categoryElement.title = titleTooltip;
        template.labelElement.text = element.displayLabel;
        template.labelElement.title = titleTooltip;
        template.descriptionElement.innerText = '';
        if (element.setting.descriptionIsMarkdown) {
            const renderedDescription = this.renderSettingMarkdown(element, template.containerElement, element.description, template.elementDisposables);
            template.descriptionElement.appendChild(renderedDescription);
        }
        else {
            template.descriptionElement.innerText = element.description;
        }
        template.indicatorsLabel.updateScopeOverrides(element, template.elementDisposables, this._onDidClickOverrideElement, this._onApplyFilter);
        const onChange = (value) => this._onDidChangeSetting.fire({
            key: element.setting.key,
            value,
            type: template.context.valueType,
            manualReset: false,
            scope: element.setting.scope
        });
        const deprecationText = element.setting.deprecationMessage || '';
        if (deprecationText && element.setting.deprecationMessageIsMarkdown) {
            template.deprecationWarningElement.innerText = '';
            template.deprecationWarningElement.appendChild(this.renderSettingMarkdown(element, template.containerElement, element.setting.deprecationMessage, template.elementDisposables));
        }
        else {
            template.deprecationWarningElement.innerText = deprecationText;
        }
        template.deprecationWarningElement.prepend($('.codicon.codicon-error'));
        template.containerElement.classList.toggle('is-deprecated', !!deprecationText);
        this.renderValue(element, template, onChange);
        template.indicatorsLabel.updateWorkspaceTrust(element);
        template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
        template.indicatorsLabel.updateDefaultOverrideIndicator(element);
        template.elementDisposables.add(this.onDidChangeIgnoredSettings(() => {
            template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
        }));
        this.updateSettingTabbable(element, template);
        template.elementDisposables.add(element.onDidChangeTabbable(() => {
            this.updateSettingTabbable(element, template);
        }));
    }
    updateSettingTabbable(element, template) {
        if (element.tabbable) {
            addChildrenToTabOrder(template.containerElement);
        }
        else {
            removeChildrenFromTabOrder(template.containerElement);
        }
    }
    renderSettingMarkdown(element, container, text, disposables) {
        // Rewrite `#editor.fontSize#` to link format
        text = fixSettingLinks(text);
        const renderedMarkdown = this.markdownRenderer.render({ value: text, isTrusted: true }, {
            actionHandler: {
                callback: (content) => {
                    if (content.startsWith('#')) {
                        const e = {
                            source: element,
                            targetKey: content.substring(1)
                        };
                        this._onDidClickSettingLink.fire(e);
                    }
                    else {
                        this._openerService.open(content, { allowCommands: true }).catch(onUnexpectedError);
                    }
                },
                disposables
            },
            asyncRenderCallback: () => {
                const height = container.clientHeight;
                if (height) {
                    this._onDidChangeSettingHeight.fire({ element, height });
                }
            },
        });
        disposables.add(renderedMarkdown);
        renderedMarkdown.element.classList.add('setting-item-markdown');
        cleanRenderedMarkdown(renderedMarkdown.element);
        return renderedMarkdown.element;
    }
    disposeTemplate(template) {
        template.toDispose.dispose();
    }
    disposeElement(_element, _index, template, _height) {
        template.elementDisposables?.clear();
    }
};
AbstractSettingRenderer = __decorate([
    __param(2, IThemeService),
    __param(3, IContextViewService),
    __param(4, IOpenerService),
    __param(5, IInstantiationService),
    __param(6, ICommandService),
    __param(7, IContextMenuService),
    __param(8, IKeybindingService),
    __param(9, IConfigurationService)
], AbstractSettingRenderer);
export { AbstractSettingRenderer };
export class SettingGroupRenderer {
    templateId = SETTINGS_ELEMENT_TEMPLATE_ID;
    renderTemplate(container) {
        container.classList.add('group-title');
        const template = {
            parent: container,
            toDispose: new DisposableStore()
        };
        return template;
    }
    renderElement(element, index, templateData) {
        templateData.parent.innerText = '';
        const labelElement = DOM.append(templateData.parent, $('div.settings-group-title-label.settings-row-inner-container'));
        labelElement.classList.add(`settings-group-level-${element.element.level}`);
        labelElement.textContent = element.element.label;
        if (element.element.isFirstGroup) {
            labelElement.classList.add('settings-group-first');
        }
    }
    disposeTemplate(templateData) {
    }
}
let SettingNewExtensionsRenderer = class SettingNewExtensionsRenderer {
    _commandService;
    templateId = SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
    constructor(_commandService) {
        this._commandService = _commandService;
    }
    renderTemplate(container) {
        const toDispose = new DisposableStore();
        container.classList.add('setting-item-new-extensions');
        const button = new Button(container, { title: true, ...defaultButtonStyles });
        toDispose.add(button);
        toDispose.add(button.onDidClick(() => {
            if (template.context) {
                this._commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', template.context.extensionIds);
            }
        }));
        button.label = localize('newExtensionsButtonLabel', "Show matching extensions");
        button.element.classList.add('settings-new-extensions-button');
        const template = {
            button,
            toDispose
        };
        return template;
    }
    renderElement(element, index, templateData) {
        templateData.context = element.element;
    }
    disposeTemplate(template) {
        dispose(template.toDispose);
    }
};
SettingNewExtensionsRenderer = __decorate([
    __param(0, ICommandService)
], SettingNewExtensionsRenderer);
export { SettingNewExtensionsRenderer };
export class SettingComplexRenderer extends AbstractSettingRenderer {
    static EDIT_IN_JSON_LABEL = localize('editInSettingsJson', "Edit in settings.json");
    templateId = SETTINGS_COMPLEX_TEMPLATE_ID;
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'complex');
        const openSettingsButton = new Button(common.controlElement, {
            title: true, ...getButtonStyles({
                buttonBackground: Color.transparent.toString(),
                buttonHoverBackground: Color.transparent.toString(),
                buttonForeground: 'foreground'
            })
        });
        common.toDispose.add(openSettingsButton);
        openSettingsButton.element.classList.add('edit-in-settings-button');
        openSettingsButton.element.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        const validationErrorMessageElement = $('.setting-item-validation-message');
        common.containerElement.appendChild(validationErrorMessageElement);
        const template = {
            ...common,
            button: openSettingsButton,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const plainKey = getLanguageTagSettingPlainKey(dataElement.setting.key);
        const editLanguageSettingLabel = localize('editLanguageSettingLabel', "Edit settings for {0}", plainKey);
        const isLanguageTagSetting = dataElement.setting.isLanguageTagSetting;
        template.button.label = isLanguageTagSetting
            ? editLanguageSettingLabel
            : SettingComplexRenderer.EDIT_IN_JSON_LABEL;
        template.elementDisposables.add(template.button.onDidClick(() => {
            if (isLanguageTagSetting) {
                this._onApplyFilter.fire(`@${LANGUAGE_SETTING_TAG}${plainKey}`);
            }
            else {
                this._onDidOpenSettings.fire(dataElement.setting.key);
            }
        }));
        this.renderValidations(dataElement, template);
        if (isLanguageTagSetting) {
            template.button.element.setAttribute('aria-label', editLanguageSettingLabel);
        }
        else {
            template.button.element.setAttribute('aria-label', `${SettingComplexRenderer.EDIT_IN_JSON_LABEL}: ${dataElement.setting.key}`);
        }
    }
    renderValidations(dataElement, template) {
        const errMsg = dataElement.isConfigured && getInvalidTypeError(dataElement.value, dataElement.setting.type);
        if (errMsg) {
            template.containerElement.classList.add('invalid-input');
            template.validationErrorMessageElement.innerText = errMsg;
            return;
        }
        template.containerElement.classList.remove('invalid-input');
    }
}
class SettingArrayRenderer extends AbstractSettingRenderer {
    templateId = SETTINGS_ARRAY_TEMPLATE_ID;
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const descriptionElement = common.containerElement.querySelector('.setting-item-description');
        const validationErrorMessageElement = $('.setting-item-validation-message');
        descriptionElement.after(validationErrorMessageElement);
        const listWidget = this._instantiationService.createInstance(ListSettingWidget, common.controlElement);
        listWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        common.toDispose.add(listWidget);
        const template = {
            ...common,
            listWidget,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        common.toDispose.add(listWidget.onDidChangeList(e => {
            const newList = this.computeNewList(template, e);
            template.onChange?.(newList);
        }));
        return template;
    }
    computeNewList(template, e) {
        if (template.context) {
            let newValue = [];
            if (Array.isArray(template.context.scopeValue)) {
                newValue = [...template.context.scopeValue];
            }
            else if (Array.isArray(template.context.value)) {
                newValue = [...template.context.value];
            }
            if (e.sourceIndex !== undefined) {
                // A drag and drop occurred
                const sourceIndex = e.sourceIndex;
                const targetIndex = e.targetIndex;
                const splicedElem = newValue.splice(sourceIndex, 1)[0];
                newValue.splice(targetIndex, 0, splicedElem);
            }
            else if (e.targetIndex !== undefined) {
                const itemValueData = e.item?.value.data.toString() ?? '';
                // Delete value
                if (!e.item?.value.data && e.originalItem.value.data && e.targetIndex > -1) {
                    newValue.splice(e.targetIndex, 1);
                }
                // Update value
                else if (e.item?.value.data && e.originalItem.value.data) {
                    if (e.targetIndex > -1) {
                        newValue[e.targetIndex] = itemValueData;
                    }
                    // For some reason, we are updating and cannot find original value
                    // Just append the value in this case
                    else {
                        newValue.push(itemValueData);
                    }
                }
                // Add value
                else if (e.item?.value.data && !e.originalItem.value.data && e.targetIndex >= newValue.length) {
                    newValue.push(itemValueData);
                }
            }
            if (template.context.defaultValue &&
                Array.isArray(template.context.defaultValue) &&
                template.context.defaultValue.length === newValue.length &&
                template.context.defaultValue.join() === newValue.join()) {
                return undefined;
            }
            return newValue;
        }
        return undefined;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const value = getListDisplayValue(dataElement);
        const keySuggester = dataElement.setting.enum ? createArraySuggester(dataElement) : undefined;
        template.listWidget.setValue(value, {
            showAddButton: getShowAddButtonList(dataElement, value),
            keySuggester
        });
        template.context = dataElement;
        template.elementDisposables.add(toDisposable(() => {
            template.listWidget.cancelEdit();
        }));
        template.onChange = (v) => {
            if (v && !renderArrayValidations(dataElement, template, v, false)) {
                const itemType = dataElement.setting.arrayItemType;
                const arrToSave = isNonNullableNumericType(itemType) ? v.map(a => +a) : v;
                onChange(arrToSave);
            }
            else {
                // Save the setting unparsed and containing the errors.
                // renderArrayValidations will render relevant error messages.
                onChange(v);
            }
        };
        renderArrayValidations(dataElement, template, value.map(v => v.value.data.toString()), true);
    }
}
class AbstractSettingObjectRenderer extends AbstractSettingRenderer {
    renderTemplateWithWidget(common, widget) {
        widget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        common.toDispose.add(widget);
        const descriptionElement = common.containerElement.querySelector('.setting-item-description');
        const validationErrorMessageElement = $('.setting-item-validation-message');
        descriptionElement.after(validationErrorMessageElement);
        const template = {
            ...common,
            validationErrorMessageElement
        };
        if (widget instanceof ObjectSettingCheckboxWidget) {
            template.objectCheckboxWidget = widget;
        }
        else {
            template.objectDropdownWidget = widget;
        }
        this.addSettingElementFocusHandler(template);
        common.toDispose.add(widget.onDidChangeList(e => {
            this.onDidChangeObject(template, e);
        }));
        return template;
    }
    onDidChangeObject(template, e) {
        const widget = (template.objectCheckboxWidget ?? template.objectDropdownWidget);
        if (template.context) {
            const defaultValue = typeof template.context.defaultValue === 'object'
                ? template.context.defaultValue ?? {}
                : {};
            const scopeValue = typeof template.context.scopeValue === 'object'
                ? template.context.scopeValue ?? {}
                : {};
            const newValue = {};
            const newItems = [];
            widget.items.forEach((item, idx) => {
                // Item was updated
                if (isDefined(e.item) && e.targetIndex === idx) {
                    newValue[e.item.key.data] = e.item.value.data;
                    newItems.push(e.item);
                }
                // All remaining items, but skip the one that we just updated
                else if (isUndefinedOrNull(e.item) || e.item.key.data !== item.key.data) {
                    newValue[item.key.data] = item.value.data;
                    newItems.push(item);
                }
            });
            // Item was deleted
            if (isUndefinedOrNull(e.item)) {
                delete newValue[e.originalItem.key.data];
                const itemToDelete = newItems.findIndex(item => item.key.data === e.originalItem.key.data);
                const defaultItemValue = defaultValue[e.originalItem.key.data];
                // Item does not have a default
                if (isUndefinedOrNull(defaultValue[e.originalItem.key.data]) && itemToDelete > -1) {
                    newItems.splice(itemToDelete, 1);
                }
                else if (itemToDelete > -1) {
                    newItems[itemToDelete].value.data = defaultItemValue;
                }
            }
            // New item was added
            else if (widget.isItemNew(e.originalItem) && e.item.key.data !== '') {
                newValue[e.item.key.data] = e.item.value.data;
                newItems.push(e.item);
            }
            Object.entries(newValue).forEach(([key, value]) => {
                // value from the scope has changed back to the default
                if (scopeValue[key] !== value && defaultValue[key] === value) {
                    delete newValue[key];
                }
            });
            const newObject = Object.keys(newValue).length === 0 ? undefined : newValue;
            if (template.objectCheckboxWidget) {
                template.objectCheckboxWidget.setValue(newItems);
            }
            else {
                template.objectDropdownWidget.setValue(newItems);
            }
            template.onChange?.(newObject);
        }
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
}
class SettingObjectRenderer extends AbstractSettingObjectRenderer {
    templateId = SETTINGS_OBJECT_TEMPLATE_ID;
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const widget = this._instantiationService.createInstance(ObjectSettingDropdownWidget, common.controlElement);
        return this.renderTemplateWithWidget(common, widget);
    }
    renderValue(dataElement, template, onChange) {
        const items = getObjectDisplayValue(dataElement);
        const { key, objectProperties, objectPatternProperties, objectAdditionalProperties } = dataElement.setting;
        template.objectDropdownWidget.setValue(items, {
            settingKey: key,
            showAddButton: objectAdditionalProperties === false
                ? (!areAllPropertiesDefined(Object.keys(objectProperties ?? {}), items) ||
                    isDefined(objectPatternProperties))
                : true,
            keySuggester: createObjectKeySuggester(dataElement),
            valueSuggester: createObjectValueSuggester(dataElement)
        });
        template.context = dataElement;
        template.elementDisposables.add(toDisposable(() => {
            template.objectDropdownWidget.cancelEdit();
        }));
        template.onChange = (v) => {
            if (v && !renderArrayValidations(dataElement, template, v, false)) {
                const parsedRecord = parseNumericObjectValues(dataElement, v);
                onChange(parsedRecord);
            }
            else {
                // Save the setting unparsed and containing the errors.
                // renderArrayValidations will render relevant error messages.
                onChange(v);
            }
        };
        renderArrayValidations(dataElement, template, dataElement.value, true);
    }
}
class SettingBoolObjectRenderer extends AbstractSettingObjectRenderer {
    templateId = SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const widget = this._instantiationService.createInstance(ObjectSettingCheckboxWidget, common.controlElement);
        return this.renderTemplateWithWidget(common, widget);
    }
    onDidChangeObject(template, e) {
        if (template.context) {
            super.onDidChangeObject(template, e);
            // Focus this setting explicitly, in case we were previously
            // focused on another setting and clicked a checkbox/value container
            // for this setting.
            this._onDidFocusSetting.fire(template.context);
        }
    }
    renderValue(dataElement, template, onChange) {
        const items = getObjectDisplayValue(dataElement);
        const { key } = dataElement.setting;
        template.objectCheckboxWidget.setValue(items, {
            settingKey: key
        });
        template.context = dataElement;
        template.onChange = (v) => {
            onChange(v);
        };
    }
}
export class SettingExcludeRenderer extends AbstractSettingRenderer {
    templateId = SETTINGS_EXCLUDE_TEMPLATE_ID;
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const excludeWidget = this._instantiationService.createInstance(ExcludeSettingWidget, common.controlElement);
        excludeWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        common.toDispose.add(excludeWidget);
        const template = {
            ...common,
            excludeWidget
        };
        this.addSettingElementFocusHandler(template);
        common.toDispose.add(excludeWidget.onDidChangeList(e => this.onDidChangeExclude(template, e)));
        return template;
    }
    onDidChangeExclude(template, e) {
        if (template.context) {
            const newValue = { ...template.context.scopeValue };
            // first delete the existing entry, if present
            if (e.originalItem.value.data.toString() in template.context.defaultValue) {
                // delete a default by overriding it
                newValue[e.originalItem.value.data.toString()] = false;
            }
            else {
                delete newValue[e.originalItem.value.data.toString()];
            }
            // then add the new or updated entry, if present
            if (e.item?.value) {
                if (e.item.value.data.toString() in template.context.defaultValue && !e.item.sibling) {
                    // add a default by deleting its override
                    delete newValue[e.item.value.data.toString()];
                }
                else {
                    newValue[e.item.value.data.toString()] = e.item.sibling ? { when: e.item.sibling } : true;
                }
            }
            function sortKeys(obj) {
                const sortedKeys = Object.keys(obj)
                    .sort((a, b) => a.localeCompare(b));
                const retVal = {};
                for (const key of sortedKeys) {
                    retVal[key] = obj[key];
                }
                return retVal;
            }
            this._onDidChangeSetting.fire({
                key: template.context.setting.key,
                value: Object.keys(newValue).length === 0 ? undefined : sortKeys(newValue),
                type: template.context.valueType,
                manualReset: false,
                scope: template.context.setting.scope
            });
        }
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const value = getExcludeDisplayValue(dataElement);
        template.excludeWidget.setValue(value);
        template.context = dataElement;
        template.elementDisposables.add(toDisposable(() => {
            template.excludeWidget.cancelEdit();
        }));
    }
}
class AbstractSettingTextRenderer extends AbstractSettingRenderer {
    MULTILINE_MAX_HEIGHT = 150;
    renderTemplate(_container, useMultiline) {
        const common = this.renderCommonTemplate(null, _container, 'text');
        const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
        const inputBoxOptions = {
            flexibleHeight: useMultiline,
            flexibleWidth: false,
            flexibleMaxHeight: this.MULTILINE_MAX_HEIGHT
        };
        const inputBox = new InputBox(common.controlElement, this._contextViewService, inputBoxOptions);
        common.toDispose.add(inputBox);
        common.toDispose.add(attachInputBoxStyler(inputBox, this._themeService, {
            inputBackground: settingsTextInputBackground,
            inputForeground: settingsTextInputForeground,
            inputBorder: settingsTextInputBorder
        }));
        common.toDispose.add(inputBox.onDidChange(e => {
            template.onChange?.(e);
        }));
        common.toDispose.add(inputBox);
        inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        inputBox.inputElement.tabIndex = 0;
        const template = {
            ...common,
            inputBox,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        template.onChange = undefined;
        template.inputBox.value = dataElement.value;
        template.inputBox.setAriaLabel(dataElement.setting.key);
        template.onChange = value => {
            if (!renderValidations(dataElement, template, false)) {
                onChange(value);
            }
        };
        renderValidations(dataElement, template, true);
    }
}
class SettingTextRenderer extends AbstractSettingTextRenderer {
    templateId = SETTINGS_TEXT_TEMPLATE_ID;
    renderTemplate(_container) {
        const template = super.renderTemplate(_container, false);
        // TODO@9at8: listWidget filters out all key events from input boxes, so we need to come up with a better way
        // Disable ArrowUp and ArrowDown behaviour in favor of list navigation
        template.toDispose.add(DOM.addStandardDisposableListener(template.inputBox.inputElement, DOM.EventType.KEY_DOWN, e => {
            if (e.equals(16 /* KeyCode.UpArrow */) || e.equals(18 /* KeyCode.DownArrow */)) {
                e.preventDefault();
            }
        }));
        return template;
    }
}
class SettingMultilineTextRenderer extends AbstractSettingTextRenderer {
    templateId = SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
    renderTemplate(_container) {
        return super.renderTemplate(_container, true);
    }
    renderValue(dataElement, template, onChange) {
        const onChangeOverride = (value) => {
            // Ensure the model is up to date since a different value will be rendered as different height when probing the height.
            dataElement.value = value;
            onChange(value);
        };
        super.renderValue(dataElement, template, onChangeOverride);
        template.elementDisposables.add(template.inputBox.onDidHeightChange(e => {
            const height = template.containerElement.clientHeight;
            // Don't fire event if height is reported as 0,
            // which sometimes happens when clicking onto a new setting.
            if (height) {
                this._onDidChangeSettingHeight.fire({
                    element: dataElement,
                    height: template.containerElement.clientHeight
                });
            }
        }));
        template.inputBox.layout();
    }
}
export class SettingEnumRenderer extends AbstractSettingRenderer {
    templateId = SETTINGS_ENUM_TEMPLATE_ID;
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'enum');
        const selectBox = new SelectBox([], 0, this._contextViewService, undefined, {
            useCustomDrawn: !(isIOS && BrowserFeatures.pointerEvents)
        });
        common.toDispose.add(selectBox);
        common.toDispose.add(attachSelectBoxStyler(selectBox, this._themeService, {
            selectBackground: settingsSelectBackground,
            selectForeground: settingsSelectForeground,
            selectBorder: settingsSelectBorder,
            selectListBorder: settingsSelectListBorder
        }));
        selectBox.render(common.controlElement);
        const selectElement = common.controlElement.querySelector('select');
        if (selectElement) {
            selectElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            selectElement.tabIndex = 0;
        }
        common.toDispose.add(selectBox.onDidSelect(e => {
            template.onChange?.(e.index);
        }));
        const enumDescriptionElement = common.containerElement.insertBefore($('.setting-item-enumDescription'), common.descriptionElement.nextSibling);
        const template = {
            ...common,
            selectBox,
            selectElement,
            enumDescriptionElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        // Make shallow copies here so that we don't modify the actual dataElement later
        const enumItemLabels = dataElement.setting.enumItemLabels ? [...dataElement.setting.enumItemLabels] : [];
        const enumDescriptions = dataElement.setting.enumDescriptions ? [...dataElement.setting.enumDescriptions] : [];
        const settingEnum = [...dataElement.setting.enum];
        const enumDescriptionsAreMarkdown = dataElement.setting.enumDescriptionsAreMarkdown;
        const disposables = new DisposableStore();
        template.toDispose.add(disposables);
        let createdDefault = false;
        if (!settingEnum.includes(dataElement.defaultValue)) {
            // Add a new potentially blank default setting
            settingEnum.unshift(dataElement.defaultValue);
            enumDescriptions.unshift('');
            enumItemLabels.unshift('');
            createdDefault = true;
        }
        // Use String constructor in case of null or undefined values
        const stringifiedDefaultValue = escapeInvisibleChars(String(dataElement.defaultValue));
        const displayOptions = settingEnum
            .map(String)
            .map(escapeInvisibleChars)
            .map((data, index) => {
            const description = (enumDescriptions[index] && (enumDescriptionsAreMarkdown ? fixSettingLinks(enumDescriptions[index], false) : enumDescriptions[index]));
            return {
                text: enumItemLabels[index] ? enumItemLabels[index] : data,
                detail: enumItemLabels[index] ? data : '',
                description,
                descriptionIsMarkdown: enumDescriptionsAreMarkdown,
                descriptionMarkdownActionHandler: {
                    callback: (content) => {
                        this._openerService.open(content).catch(onUnexpectedError);
                    },
                    disposables: disposables
                },
                decoratorRight: (((data === stringifiedDefaultValue) || (createdDefault && index === 0)) ? localize('settings.Default', "default") : '')
            };
        });
        template.selectBox.setOptions(displayOptions);
        template.selectBox.setAriaLabel(dataElement.setting.key);
        let idx = settingEnum.indexOf(dataElement.value);
        if (idx === -1) {
            idx = 0;
        }
        template.onChange = undefined;
        template.selectBox.select(idx);
        template.onChange = (idx) => {
            if (createdDefault && idx === 0) {
                onChange(dataElement.defaultValue);
            }
            else {
                onChange(settingEnum[idx]);
            }
        };
        template.enumDescriptionElement.innerText = '';
    }
}
export class SettingNumberRenderer extends AbstractSettingRenderer {
    templateId = SETTINGS_NUMBER_TEMPLATE_ID;
    renderTemplate(_container) {
        const common = super.renderCommonTemplate(null, _container, 'number');
        const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
        const inputBox = new InputBox(common.controlElement, this._contextViewService, { type: 'number' });
        common.toDispose.add(inputBox);
        common.toDispose.add(attachInputBoxStyler(inputBox, this._themeService, {
            inputBackground: settingsNumberInputBackground,
            inputForeground: settingsNumberInputForeground,
            inputBorder: settingsNumberInputBorder
        }));
        common.toDispose.add(inputBox.onDidChange(e => {
            template.onChange?.(e);
        }));
        common.toDispose.add(inputBox);
        inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        inputBox.inputElement.tabIndex = 0;
        const template = {
            ...common,
            inputBox,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const numParseFn = (dataElement.valueType === 'integer' || dataElement.valueType === 'nullable-integer')
            ? parseInt : parseFloat;
        const nullNumParseFn = (dataElement.valueType === 'nullable-integer' || dataElement.valueType === 'nullable-number')
            ? ((v) => v === '' ? null : numParseFn(v)) : numParseFn;
        template.onChange = undefined;
        template.inputBox.value = dataElement.value;
        template.inputBox.setAriaLabel(dataElement.setting.key);
        template.onChange = value => {
            if (!renderValidations(dataElement, template, false)) {
                onChange(nullNumParseFn(value));
            }
        };
        renderValidations(dataElement, template, true);
    }
}
export class SettingBoolRenderer extends AbstractSettingRenderer {
    templateId = SETTINGS_BOOL_TEMPLATE_ID;
    renderTemplate(_container) {
        _container.classList.add('setting-item');
        _container.classList.add('setting-item-bool');
        const container = DOM.append(_container, $(AbstractSettingRenderer.CONTENTS_SELECTOR));
        container.classList.add('settings-row-inner-container');
        const titleElement = DOM.append(container, $('.setting-item-title'));
        const categoryElement = DOM.append(titleElement, $('span.setting-item-category'));
        const labelElementContainer = DOM.append(titleElement, $('span.setting-item-label'));
        const labelElement = new SimpleIconLabel(labelElementContainer);
        const indicatorsLabel = this._instantiationService.createInstance(SettingsTreeIndicatorsLabel, titleElement);
        const descriptionAndValueElement = DOM.append(container, $('.setting-item-value-description'));
        const controlElement = DOM.append(descriptionAndValueElement, $('.setting-item-bool-control'));
        const descriptionElement = DOM.append(descriptionAndValueElement, $('.setting-item-description'));
        const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
        modifiedIndicatorElement.title = localize('modified', "The setting has been configured in the current scope.");
        const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
        const toDispose = new DisposableStore();
        const checkbox = new Toggle({ icon: Codicon.check, actionClassName: 'setting-value-checkbox', isChecked: true, title: '', inputActiveOptionBorder: undefined });
        controlElement.appendChild(checkbox.domNode);
        toDispose.add(checkbox);
        toDispose.add(checkbox.onChange(() => {
            template.onChange(checkbox.checked);
        }));
        // Need to listen for mouse clicks on description and toggle checkbox - use target ID for safety
        // Also have to ignore embedded links - too buried to stop propagation
        toDispose.add(DOM.addDisposableListener(descriptionElement, DOM.EventType.MOUSE_DOWN, (e) => {
            const targetElement = e.target;
            // Toggle target checkbox
            if (targetElement.tagName.toLowerCase() !== 'a') {
                template.checkbox.checked = !template.checkbox.checked;
                template.onChange(checkbox.checked);
            }
            DOM.EventHelper.stop(e);
        }));
        checkbox.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
        const toolbar = this.renderSettingToolbar(toolbarContainer);
        toDispose.add(toolbar);
        const template = {
            toDispose,
            elementDisposables: toDispose.add(new DisposableStore()),
            containerElement: container,
            categoryElement,
            labelElement,
            controlElement,
            checkbox,
            descriptionElement,
            deprecationWarningElement,
            indicatorsLabel,
            toolbar
        };
        this.addSettingElementFocusHandler(template);
        // Prevent clicks from being handled by list
        toDispose.add(DOM.addDisposableListener(controlElement, 'mousedown', (e) => e.stopPropagation()));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        template.onChange = undefined;
        template.checkbox.checked = dataElement.value;
        template.checkbox.setTitle(dataElement.setting.key);
        template.onChange = onChange;
    }
}
let SettingTreeRenderers = class SettingTreeRenderers {
    _instantiationService;
    _contextMenuService;
    _contextViewService;
    _userDataSyncEnablementService;
    onDidClickOverrideElement;
    _onDidChangeSetting = new Emitter();
    onDidChangeSetting;
    onDidOpenSettings;
    onDidClickSettingLink;
    onDidFocusSetting;
    onDidChangeSettingHeight;
    onApplyFilter;
    allRenderers;
    settingActions;
    constructor(_instantiationService, _contextMenuService, _contextViewService, _userDataSyncEnablementService) {
        this._instantiationService = _instantiationService;
        this._contextMenuService = _contextMenuService;
        this._contextViewService = _contextViewService;
        this._userDataSyncEnablementService = _userDataSyncEnablementService;
        this.settingActions = [
            new Action('settings.resetSetting', localize('resetSettingLabel', "Reset Setting"), undefined, undefined, async (context) => {
                if (context instanceof SettingsTreeSettingElement) {
                    if (!context.isUntrusted) {
                        this._onDidChangeSetting.fire({
                            key: context.setting.key,
                            value: undefined,
                            type: context.setting.type,
                            manualReset: true,
                            scope: context.setting.scope
                        });
                    }
                }
            }),
            new Separator(),
            this._instantiationService.createInstance(CopySettingIdAction),
            this._instantiationService.createInstance(CopySettingAsJSONAction),
        ];
        const actionFactory = (setting) => this.getActionsForSetting(setting);
        const settingRenderers = [
            this._instantiationService.createInstance(SettingBoolRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingNumberRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingArrayRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingComplexRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingTextRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingMultilineTextRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingExcludeRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingEnumRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingObjectRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingBoolObjectRenderer, this.settingActions, actionFactory),
        ];
        this.onDidClickOverrideElement = Event.any(...settingRenderers.map(r => r.onDidClickOverrideElement));
        this.onDidChangeSetting = Event.any(...settingRenderers.map(r => r.onDidChangeSetting), this._onDidChangeSetting.event);
        this.onDidOpenSettings = Event.any(...settingRenderers.map(r => r.onDidOpenSettings));
        this.onDidClickSettingLink = Event.any(...settingRenderers.map(r => r.onDidClickSettingLink));
        this.onDidFocusSetting = Event.any(...settingRenderers.map(r => r.onDidFocusSetting));
        this.onDidChangeSettingHeight = Event.any(...settingRenderers.map(r => r.onDidChangeSettingHeight));
        this.onApplyFilter = Event.any(...settingRenderers.map(r => r.onApplyFilter));
        this.allRenderers = [
            ...settingRenderers,
            this._instantiationService.createInstance(SettingGroupRenderer),
            this._instantiationService.createInstance(SettingNewExtensionsRenderer),
        ];
    }
    getActionsForSetting(setting) {
        const enableSync = this._userDataSyncEnablementService.isEnabled();
        return enableSync && !setting.disallowSyncIgnore ?
            [
                new Separator(),
                this._instantiationService.createInstance(SyncSettingAction, setting)
            ] :
            [];
    }
    cancelSuggesters() {
        this._contextViewService.hideContextView();
    }
    showContextMenu(element, settingDOMElement) {
        const toolbarElement = settingDOMElement.querySelector('.monaco-toolbar');
        if (toolbarElement) {
            this._contextMenuService.showContextMenu({
                getActions: () => this.settingActions,
                getAnchor: () => toolbarElement,
                getActionsContext: () => element
            });
        }
    }
    getSettingDOMElementForDOMElement(domElement) {
        const parent = DOM.findParentWithClass(domElement, AbstractSettingRenderer.CONTENTS_CLASS);
        if (parent) {
            return parent;
        }
        return null;
    }
    getDOMElementsForSettingKey(treeContainer, key) {
        return treeContainer.querySelectorAll(`[${AbstractSettingRenderer.SETTING_KEY_ATTR}="${key}"]`);
    }
    getKeyForDOMElementInSetting(element) {
        const settingElement = this.getSettingDOMElementForDOMElement(element);
        return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
    }
    getIdForDOMElementInSetting(element) {
        const settingElement = this.getSettingDOMElementForDOMElement(element);
        return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_ID_ATTR);
    }
};
SettingTreeRenderers = __decorate([
    __param(0, IInstantiationService),
    __param(1, IContextMenuService),
    __param(2, IContextViewService),
    __param(3, IUserDataSyncEnablementService)
], SettingTreeRenderers);
export { SettingTreeRenderers };
/**
 * Validate and render any error message. Returns true if the value is invalid.
 */
function renderValidations(dataElement, template, calledOnStartup) {
    if (dataElement.setting.validator) {
        const errMsg = dataElement.setting.validator(template.inputBox.value);
        if (errMsg) {
            template.containerElement.classList.add('invalid-input');
            template.validationErrorMessageElement.innerText = errMsg;
            const validationError = localize('validationError', "Validation Error.");
            template.inputBox.inputElement.parentElement.setAttribute('aria-label', [validationError, errMsg].join(' '));
            if (!calledOnStartup) {
                ariaAlert(validationError + ' ' + errMsg);
            }
            return true;
        }
        else {
            template.inputBox.inputElement.parentElement.removeAttribute('aria-label');
        }
    }
    template.containerElement.classList.remove('invalid-input');
    return false;
}
/**
 * Validate and render any error message for arrays. Returns true if the value is invalid.
 */
function renderArrayValidations(dataElement, template, value, calledOnStartup) {
    template.containerElement.classList.add('invalid-input');
    if (dataElement.setting.validator) {
        const errMsg = dataElement.setting.validator(value);
        if (errMsg && errMsg !== '') {
            template.containerElement.classList.add('invalid-input');
            template.validationErrorMessageElement.innerText = errMsg;
            const validationError = localize('validationError', "Validation Error.");
            template.containerElement.setAttribute('aria-label', [dataElement.setting.key, validationError, errMsg].join(' '));
            if (!calledOnStartup) {
                ariaAlert(validationError + ' ' + errMsg);
            }
            return true;
        }
        else {
            template.containerElement.setAttribute('aria-label', dataElement.setting.key);
            template.containerElement.classList.remove('invalid-input');
        }
    }
    return false;
}
function cleanRenderedMarkdown(element) {
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes.item(i);
        const tagName = child.tagName && child.tagName.toLowerCase();
        if (tagName === 'img') {
            element.removeChild(child);
        }
        else {
            cleanRenderedMarkdown(child);
        }
    }
}
function fixSettingLinks(text, linkify = true) {
    return text.replace(/`#([^#]*)#`|'#([^#]*)#'/g, (match, backticksGroup, quotesGroup) => {
        const settingKey = backticksGroup ?? quotesGroup;
        const targetDisplayFormat = settingKeyToDisplayFormat(settingKey);
        const targetName = `${targetDisplayFormat.category}: ${targetDisplayFormat.label}`;
        return linkify ?
            `[${targetName}](#${settingKey} "${settingKey}")` :
            `"${targetName}"`;
    });
}
function escapeInvisibleChars(enumValue) {
    return enumValue && enumValue
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}
let SettingsTreeFilter = class SettingsTreeFilter {
    viewState;
    environmentService;
    constructor(viewState, environmentService) {
        this.viewState = viewState;
        this.environmentService = environmentService;
    }
    filter(element, parentVisibility) {
        // Filter during search
        if (this.viewState.filterToCategory && element instanceof SettingsTreeSettingElement) {
            if (!this.settingContainedInGroup(element.setting, this.viewState.filterToCategory)) {
                return false;
            }
        }
        // Non-user scope selected
        if (element instanceof SettingsTreeSettingElement && this.viewState.settingsTarget !== 3 /* ConfigurationTarget.USER_LOCAL */) {
            const isRemote = !!this.environmentService.remoteAuthority;
            if (!element.matchesScope(this.viewState.settingsTarget, isRemote)) {
                return false;
            }
        }
        // Group with no visible children
        if (element instanceof SettingsTreeGroupElement) {
            if (typeof element.count === 'number') {
                return element.count > 0;
            }
            return 2 /* TreeVisibility.Recurse */;
        }
        // Filtered "new extensions" button
        if (element instanceof SettingsTreeNewExtensionsElement) {
            if ((this.viewState.tagFilters && this.viewState.tagFilters.size) || this.viewState.filterToCategory) {
                return false;
            }
        }
        return true;
    }
    settingContainedInGroup(setting, group) {
        return group.children.some(child => {
            if (child instanceof SettingsTreeGroupElement) {
                return this.settingContainedInGroup(setting, child);
            }
            else if (child instanceof SettingsTreeSettingElement) {
                return child.setting.key === setting.key;
            }
            else {
                return false;
            }
        });
    }
};
SettingsTreeFilter = __decorate([
    __param(1, IWorkbenchEnvironmentService)
], SettingsTreeFilter);
export { SettingsTreeFilter };
class SettingsTreeDelegate extends CachedListVirtualDelegate {
    getTemplateId(element) {
        if (element instanceof SettingsTreeGroupElement) {
            return SETTINGS_ELEMENT_TEMPLATE_ID;
        }
        if (element instanceof SettingsTreeSettingElement) {
            const invalidTypeError = element.isConfigured && getInvalidTypeError(element.value, element.setting.type);
            if (invalidTypeError) {
                return SETTINGS_COMPLEX_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Boolean) {
                return SETTINGS_BOOL_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Integer ||
                element.valueType === SettingValueType.Number ||
                element.valueType === SettingValueType.NullableInteger ||
                element.valueType === SettingValueType.NullableNumber) {
                return SETTINGS_NUMBER_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.MultilineString) {
                return SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.String) {
                return SETTINGS_TEXT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Enum) {
                return SETTINGS_ENUM_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Array) {
                return SETTINGS_ARRAY_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Exclude) {
                return SETTINGS_EXCLUDE_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Object) {
                return SETTINGS_OBJECT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.BooleanObject) {
                return SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.LanguageTag) {
                return SETTINGS_COMPLEX_TEMPLATE_ID;
            }
            return SETTINGS_COMPLEX_TEMPLATE_ID;
        }
        if (element instanceof SettingsTreeNewExtensionsElement) {
            return SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
        }
        throw new Error('unknown element type: ' + element);
    }
    hasDynamicHeight(element) {
        return !(element instanceof SettingsTreeGroupElement);
    }
    estimateHeight(element) {
        if (element instanceof SettingsTreeGroupElement) {
            return 42;
        }
        return element instanceof SettingsTreeSettingElement && element.valueType === SettingValueType.Boolean ? 78 : 104;
    }
}
export class NonCollapsibleObjectTreeModel extends ObjectTreeModel {
    isCollapsible(element) {
        return false;
    }
    setCollapsed(element, collapsed, recursive) {
        return false;
    }
}
class SettingsTreeAccessibilityProvider {
    configurationService;
    languageService;
    userDataProfilesService;
    constructor(configurationService, languageService, userDataProfilesService) {
        this.configurationService = configurationService;
        this.languageService = languageService;
        this.userDataProfilesService = userDataProfilesService;
    }
    getAriaLabel(element) {
        if (element instanceof SettingsTreeSettingElement) {
            const ariaLabelSections = [];
            ariaLabelSections.push(`${element.displayCategory} ${element.displayLabel}.`);
            if (element.isConfigured) {
                const modifiedText = localize('settings.Modified', 'Modified.');
                ariaLabelSections.push(modifiedText);
            }
            const indicatorsLabelAriaLabel = getIndicatorsLabelAriaLabel(element, this.configurationService, this.userDataProfilesService, this.languageService);
            if (indicatorsLabelAriaLabel.length) {
                ariaLabelSections.push(`${indicatorsLabelAriaLabel}.`);
            }
            const descriptionWithoutSettingLinks = fixSettingLinks(element.description, false);
            if (descriptionWithoutSettingLinks.length) {
                ariaLabelSections.push(descriptionWithoutSettingLinks);
            }
            return ariaLabelSections.join(' ');
        }
        else if (element instanceof SettingsTreeGroupElement) {
            return element.label;
        }
        else {
            return element.id;
        }
    }
    getWidgetAriaLabel() {
        return localize('settings', "Settings");
    }
}
let SettingsTree = class SettingsTree extends WorkbenchObjectTree {
    constructor(container, viewState, renderers, contextKeyService, listService, themeService, configurationService, instantiationService, languageService, userDataProfilesService) {
        super('SettingsTree', container, new SettingsTreeDelegate(), renderers, {
            horizontalScrolling: false,
            supportDynamicHeights: true,
            identityProvider: {
                getId(e) {
                    return e.id;
                }
            },
            accessibilityProvider: new SettingsTreeAccessibilityProvider(configurationService, languageService, userDataProfilesService),
            styleController: id => new DefaultStyleController(DOM.createStyleSheet(container), id),
            filter: instantiationService.createInstance(SettingsTreeFilter, viewState),
            smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
            multipleSelectionSupport: false,
            findWidgetEnabled: false
        }, instantiationService, contextKeyService, listService, themeService, configurationService);
        this.getHTMLElement().classList.add('settings-editor-tree');
        this.disposables.add(attachStyler(themeService, {
            listBackground: editorBackground,
            listActiveSelectionBackground: editorBackground,
            listActiveSelectionForeground: foreground,
            listFocusAndSelectionBackground: editorBackground,
            listFocusAndSelectionForeground: foreground,
            listFocusBackground: editorBackground,
            listFocusForeground: foreground,
            listHoverForeground: foreground,
            listHoverBackground: editorBackground,
            listHoverOutline: editorBackground,
            listFocusOutline: editorBackground,
            listInactiveSelectionBackground: editorBackground,
            listInactiveSelectionForeground: foreground,
            listInactiveFocusBackground: editorBackground,
            listInactiveFocusOutline: editorBackground
        }, colors => {
            this.style(colors);
        }));
        this.disposables.add(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('workbench.list.smoothScrolling')) {
                this.updateOptions({
                    smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling')
                });
            }
        }));
    }
    createModel(user, view, options) {
        return new NonCollapsibleObjectTreeModel(user, view, options);
    }
};
SettingsTree = __decorate([
    __param(3, IContextKeyService),
    __param(4, IListService),
    __param(5, IThemeService),
    __param(6, IConfigurationService),
    __param(7, IInstantiationService),
    __param(8, ILanguageService),
    __param(9, IUserDataProfilesService)
], SettingsTree);
export { SettingsTree };
let CopySettingIdAction = class CopySettingIdAction extends Action {
    clipboardService;
    static ID = 'settings.copySettingId';
    static LABEL = localize('copySettingIdLabel', "Copy Setting ID");
    constructor(clipboardService) {
        super(CopySettingIdAction.ID, CopySettingIdAction.LABEL);
        this.clipboardService = clipboardService;
    }
    async run(context) {
        if (context) {
            await this.clipboardService.writeText(context.setting.key);
        }
        return Promise.resolve(undefined);
    }
};
CopySettingIdAction = __decorate([
    __param(0, IClipboardService)
], CopySettingIdAction);
let CopySettingAsJSONAction = class CopySettingAsJSONAction extends Action {
    clipboardService;
    static ID = 'settings.copySettingAsJSON';
    static LABEL = localize('copySettingAsJSONLabel', "Copy Setting as JSON");
    constructor(clipboardService) {
        super(CopySettingAsJSONAction.ID, CopySettingAsJSONAction.LABEL);
        this.clipboardService = clipboardService;
    }
    async run(context) {
        if (context) {
            const jsonResult = `"${context.setting.key}": ${JSON.stringify(context.value, undefined, '  ')}`;
            await this.clipboardService.writeText(jsonResult);
        }
        return Promise.resolve(undefined);
    }
};
CopySettingAsJSONAction = __decorate([
    __param(0, IClipboardService)
], CopySettingAsJSONAction);
let SyncSettingAction = class SyncSettingAction extends Action {
    setting;
    configService;
    static ID = 'settings.stopSyncingSetting';
    static LABEL = localize('stopSyncingSetting', "Sync This Setting");
    constructor(setting, configService) {
        super(SyncSettingAction.ID, SyncSettingAction.LABEL);
        this.setting = setting;
        this.configService = configService;
        this._register(Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredSettings'))(() => this.update()));
        this.update();
    }
    async update() {
        const ignoredSettings = getIgnoredSettings(getDefaultIgnoredSettings(), this.configService);
        this.checked = !ignoredSettings.includes(this.setting.key);
    }
    async run() {
        // first remove the current setting completely from ignored settings
        let currentValue = [...this.configService.getValue('settingsSync.ignoredSettings')];
        currentValue = currentValue.filter(v => v !== this.setting.key && v !== `-${this.setting.key}`);
        const defaultIgnoredSettings = getDefaultIgnoredSettings();
        const isDefaultIgnored = defaultIgnoredSettings.includes(this.setting.key);
        const askedToSync = !this.checked;
        // If asked to sync, then add only if it is ignored by default
        if (askedToSync && isDefaultIgnored) {
            currentValue.push(`-${this.setting.key}`);
        }
        // If asked not to sync, then add only if it is not ignored by default
        if (!askedToSync && !isDefaultIgnored) {
            currentValue.push(this.setting.key);
        }
        this.configService.updateValue('settingsSync.ignoredSettings', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
        return Promise.resolve(undefined);
    }
};
SyncSettingAction = __decorate([
    __param(1, IConfigurationService)
], SyncSettingAction);
