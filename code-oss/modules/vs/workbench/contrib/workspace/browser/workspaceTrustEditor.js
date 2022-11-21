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
import { $, addDisposableListener, addStandardDisposableListener, append, clearNode, EventHelper, EventType, isAncestor } from 'vs/base/browser/dom';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { ButtonBar } from 'vs/base/browser/ui/button/button';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { Action } from 'vs/base/common/actions';
import { Codicon } from 'vs/base/common/codicons';
import { debounce } from 'vs/base/common/decorators';
import { Emitter } from 'vs/base/common/event';
import { splitName } from 'vs/base/common/labels';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { parseLinkedText } from 'vs/base/common/linkedText';
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { WorkbenchTable } from 'vs/platform/list/browser/listService';
import { Link } from 'vs/platform/opener/browser/link';
import { Registry } from 'vs/platform/registry/common/platform';
import { isVirtualResource, isVirtualWorkspace } from 'vs/platform/workspace/common/virtualWorkspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { buttonBackground, buttonSecondaryBackground, editorErrorForeground } from 'vs/platform/theme/common/colorRegistry';
import { IWorkspaceContextService, toWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { attachInputBoxStyler, attachStylerCallback } from 'vs/platform/theme/common/styler';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { ChoiceAction } from 'vs/workbench/common/notifications';
import { debugIconStartForeground } from 'vs/workbench/contrib/debug/browser/debugColors';
import { IExtensionsWorkbenchService, LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { IWorkbenchConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { getExtensionDependencies } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { posix, win32 } from 'vs/base/common/path';
import { hasDriveLetter, toSlashes } from 'vs/base/common/extpath';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { IProductService } from 'vs/platform/product/common/productService';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { defaultButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
export const shieldIcon = registerIcon('workspace-trust-banner', Codicon.shield, localize('shieldIcon', 'Icon for workspace trust ion the banner.'));
const checkListIcon = registerIcon('workspace-trust-editor-check', Codicon.check, localize('checkListIcon', 'Icon for the checkmark in the workspace trust editor.'));
const xListIcon = registerIcon('workspace-trust-editor-cross', Codicon.x, localize('xListIcon', 'Icon for the cross in the workspace trust editor.'));
const folderPickerIcon = registerIcon('workspace-trust-editor-folder-picker', Codicon.folder, localize('folderPickerIcon', 'Icon for the pick folder icon in the workspace trust editor.'));
const editIcon = registerIcon('workspace-trust-editor-edit-folder', Codicon.edit, localize('editIcon', 'Icon for the edit folder icon in the workspace trust editor.'));
const removeIcon = registerIcon('workspace-trust-editor-remove-folder', Codicon.close, localize('removeIcon', 'Icon for the remove folder icon in the workspace trust editor.'));
let WorkspaceTrustedUrisTable = class WorkspaceTrustedUrisTable extends Disposable {
    container;
    instantiationService;
    workspaceService;
    workspaceTrustManagementService;
    uriService;
    labelService;
    fileDialogService;
    _onDidAcceptEdit = this._register(new Emitter());
    onDidAcceptEdit = this._onDidAcceptEdit.event;
    _onDidRejectEdit = this._register(new Emitter());
    onDidRejectEdit = this._onDidRejectEdit.event;
    _onEdit = this._register(new Emitter());
    onEdit = this._onEdit.event;
    _onDelete = this._register(new Emitter());
    onDelete = this._onDelete.event;
    table;
    descriptionElement;
    constructor(container, instantiationService, workspaceService, workspaceTrustManagementService, uriService, labelService, fileDialogService) {
        super();
        this.container = container;
        this.instantiationService = instantiationService;
        this.workspaceService = workspaceService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.uriService = uriService;
        this.labelService = labelService;
        this.fileDialogService = fileDialogService;
        this.descriptionElement = container.appendChild($('.workspace-trusted-folders-description'));
        const tableElement = container.appendChild($('.trusted-uris-table'));
        const addButtonBarElement = container.appendChild($('.trusted-uris-button-bar'));
        this.table = this.instantiationService.createInstance(WorkbenchTable, 'WorkspaceTrust', tableElement, new TrustedUriTableVirtualDelegate(), [
            {
                label: localize('hostColumnLabel', "Host"),
                tooltip: '',
                weight: 1,
                templateId: TrustedUriHostColumnRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
            {
                label: localize('pathColumnLabel', "Path"),
                tooltip: '',
                weight: 8,
                templateId: TrustedUriPathColumnRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
            {
                label: '',
                tooltip: '',
                weight: 1,
                minimumWidth: 75,
                maximumWidth: 75,
                templateId: TrustedUriActionsColumnRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
        ], [
            this.instantiationService.createInstance(TrustedUriHostColumnRenderer),
            this.instantiationService.createInstance(TrustedUriPathColumnRenderer, this),
            this.instantiationService.createInstance(TrustedUriActionsColumnRenderer, this, this.currentWorkspaceUri),
        ], {
            horizontalScrolling: false,
            alwaysConsumeMouseWheel: false,
            openOnSingleClick: false,
            multipleSelectionSupport: false,
            accessibilityProvider: {
                getAriaLabel: (item) => {
                    const hostLabel = getHostLabel(this.labelService, item);
                    if (hostLabel === undefined || hostLabel.length === 0) {
                        return localize('trustedFolderAriaLabel', "{0}, trusted", this.labelService.getUriLabel(item.uri));
                    }
                    return localize('trustedFolderWithHostAriaLabel', "{0} on {1}, trusted", this.labelService.getUriLabel(item.uri), hostLabel);
                },
                getWidgetAriaLabel: () => localize('trustedFoldersAndWorkspaces', "Trusted Folders & Workspaces")
            }
        });
        this._register(this.table.onDidOpen(item => {
            // default prevented when input box is double clicked #125052
            if (item && item.element && !item.browserEvent?.defaultPrevented) {
                this.edit(item.element, true);
            }
        }));
        const buttonBar = this._register(new ButtonBar(addButtonBarElement));
        const addButton = this._register(buttonBar.addButton({ title: localize('addButton', "Add Folder"), ...defaultButtonStyles }));
        addButton.label = localize('addButton', "Add Folder");
        this._register(addButton.onDidClick(async () => {
            const uri = await this.fileDialogService.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: this.currentWorkspaceUri,
                openLabel: localize('trustUri', "Trust Folder"),
                title: localize('selectTrustedUri', "Select Folder To Trust")
            });
            if (uri) {
                this.workspaceTrustManagementService.setUrisTrust(uri, true);
            }
        }));
        this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => {
            this.updateTable();
        }));
    }
    getIndexOfTrustedUriEntry(item) {
        const index = this.trustedUriEntries.indexOf(item);
        if (index === -1) {
            for (let i = 0; i < this.trustedUriEntries.length; i++) {
                if (this.trustedUriEntries[i].uri === item.uri) {
                    return i;
                }
            }
        }
        return index;
    }
    selectTrustedUriEntry(item, focus = true) {
        const index = this.getIndexOfTrustedUriEntry(item);
        if (index !== -1) {
            if (focus) {
                this.table.domFocus();
                this.table.setFocus([index]);
            }
            this.table.setSelection([index]);
        }
    }
    get currentWorkspaceUri() {
        return this.workspaceService.getWorkspace().folders[0]?.uri || URI.file('/');
    }
    get trustedUriEntries() {
        const currentWorkspace = this.workspaceService.getWorkspace();
        const currentWorkspaceUris = currentWorkspace.folders.map(folder => folder.uri);
        if (currentWorkspace.configuration) {
            currentWorkspaceUris.push(currentWorkspace.configuration);
        }
        const entries = this.workspaceTrustManagementService.getTrustedUris().map(uri => {
            let relatedToCurrentWorkspace = false;
            for (const workspaceUri of currentWorkspaceUris) {
                relatedToCurrentWorkspace = relatedToCurrentWorkspace || this.uriService.extUri.isEqualOrParent(workspaceUri, uri);
            }
            return {
                uri,
                parentOfWorkspaceItem: relatedToCurrentWorkspace
            };
        });
        // Sort entries
        const sortedEntries = entries.sort((a, b) => {
            if (a.uri.scheme !== b.uri.scheme) {
                if (a.uri.scheme === Schemas.file) {
                    return -1;
                }
                if (b.uri.scheme === Schemas.file) {
                    return 1;
                }
            }
            const aIsWorkspace = a.uri.path.endsWith('.code-workspace');
            const bIsWorkspace = b.uri.path.endsWith('.code-workspace');
            if (aIsWorkspace !== bIsWorkspace) {
                if (aIsWorkspace) {
                    return 1;
                }
                if (bIsWorkspace) {
                    return -1;
                }
            }
            return a.uri.fsPath.localeCompare(b.uri.fsPath);
        });
        return sortedEntries;
    }
    layout() {
        this.table.layout((this.trustedUriEntries.length * TrustedUriTableVirtualDelegate.ROW_HEIGHT) + TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT, undefined);
    }
    updateTable() {
        const entries = this.trustedUriEntries;
        this.container.classList.toggle('empty', entries.length === 0);
        this.descriptionElement.innerText = entries.length ?
            localize('trustedFoldersDescription', "You trust the following folders, their subfolders, and workspace files.") :
            localize('noTrustedFoldersDescriptions', "You haven't trusted any folders or workspace files yet.");
        this.table.splice(0, Number.POSITIVE_INFINITY, this.trustedUriEntries);
        this.layout();
    }
    validateUri(path, item) {
        if (!item) {
            return null;
        }
        if (item.uri.scheme === 'vscode-vfs') {
            const segments = path.split(posix.sep).filter(s => s.length);
            if (segments.length === 0 && path.startsWith(posix.sep)) {
                return {
                    type: 2 /* MessageType.WARNING */,
                    content: localize('trustAll', "You will trust all repositories on {0}.", getHostLabel(this.labelService, item))
                };
            }
            if (segments.length === 1) {
                return {
                    type: 2 /* MessageType.WARNING */,
                    content: localize('trustOrg', "You will trust all repositories and forks under '{0}' on {1}.", segments[0], getHostLabel(this.labelService, item))
                };
            }
            if (segments.length > 2) {
                return {
                    type: 3 /* MessageType.ERROR */,
                    content: localize('invalidTrust', "You cannot trust individual folders within a repository.", path)
                };
            }
        }
        return null;
    }
    acceptEdit(item, uri) {
        const trustedFolders = this.workspaceTrustManagementService.getTrustedUris();
        const index = trustedFolders.findIndex(u => this.uriService.extUri.isEqual(u, item.uri));
        if (index >= trustedFolders.length || index === -1) {
            trustedFolders.push(uri);
        }
        else {
            trustedFolders[index] = uri;
        }
        this.workspaceTrustManagementService.setTrustedUris(trustedFolders);
        this._onDidAcceptEdit.fire(item);
    }
    rejectEdit(item) {
        this._onDidRejectEdit.fire(item);
    }
    async delete(item) {
        await this.workspaceTrustManagementService.setUrisTrust([item.uri], false);
        this._onDelete.fire(item);
    }
    async edit(item, usePickerIfPossible) {
        const canUseOpenDialog = item.uri.scheme === Schemas.file ||
            (item.uri.scheme === this.currentWorkspaceUri.scheme &&
                this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) &&
                !isVirtualResource(item.uri));
        if (canUseOpenDialog && usePickerIfPossible) {
            const uri = await this.fileDialogService.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: item.uri,
                openLabel: localize('trustUri', "Trust Folder"),
                title: localize('selectTrustedUri', "Select Folder To Trust")
            });
            if (uri) {
                this.acceptEdit(item, uri[0]);
            }
            else {
                this.rejectEdit(item);
            }
        }
        else {
            this.selectTrustedUriEntry(item);
            this._onEdit.fire(item);
        }
    }
};
WorkspaceTrustedUrisTable = __decorate([
    __param(1, IInstantiationService),
    __param(2, IWorkspaceContextService),
    __param(3, IWorkspaceTrustManagementService),
    __param(4, IUriIdentityService),
    __param(5, ILabelService),
    __param(6, IFileDialogService)
], WorkspaceTrustedUrisTable);
class TrustedUriTableVirtualDelegate {
    static HEADER_ROW_HEIGHT = 30;
    static ROW_HEIGHT = 24;
    headerRowHeight = TrustedUriTableVirtualDelegate.HEADER_ROW_HEIGHT;
    getHeight(item) {
        return TrustedUriTableVirtualDelegate.ROW_HEIGHT;
    }
}
let TrustedUriActionsColumnRenderer = class TrustedUriActionsColumnRenderer {
    table;
    currentWorkspaceUri;
    uriService;
    static TEMPLATE_ID = 'actions';
    templateId = TrustedUriActionsColumnRenderer.TEMPLATE_ID;
    constructor(table, currentWorkspaceUri, uriService) {
        this.table = table;
        this.currentWorkspaceUri = currentWorkspaceUri;
        this.uriService = uriService;
    }
    renderTemplate(container) {
        const element = container.appendChild($('.actions'));
        const actionBar = new ActionBar(element, { animated: false });
        return { actionBar };
    }
    renderElement(item, index, templateData, height) {
        templateData.actionBar.clear();
        const canUseOpenDialog = item.uri.scheme === Schemas.file ||
            (item.uri.scheme === this.currentWorkspaceUri.scheme &&
                this.uriService.extUri.isEqualAuthority(this.currentWorkspaceUri.authority, item.uri.authority) &&
                !isVirtualResource(item.uri));
        const actions = [];
        if (canUseOpenDialog) {
            actions.push(this.createPickerAction(item));
        }
        actions.push(this.createEditAction(item));
        actions.push(this.createDeleteAction(item));
        templateData.actionBar.push(actions, { icon: true });
    }
    createEditAction(item) {
        return {
            class: ThemeIcon.asClassName(editIcon),
            enabled: true,
            id: 'editTrustedUri',
            tooltip: localize('editTrustedUri', "Edit Path"),
            run: () => {
                this.table.edit(item, false);
            }
        };
    }
    createPickerAction(item) {
        return {
            class: ThemeIcon.asClassName(folderPickerIcon),
            enabled: true,
            id: 'pickerTrustedUri',
            tooltip: localize('pickerTrustedUri', "Open File Picker"),
            run: () => {
                this.table.edit(item, true);
            }
        };
    }
    createDeleteAction(item) {
        return {
            class: ThemeIcon.asClassName(removeIcon),
            enabled: true,
            id: 'deleteTrustedUri',
            tooltip: localize('deleteTrustedUri', "Delete Path"),
            run: async () => {
                await this.table.delete(item);
            }
        };
    }
    disposeTemplate(templateData) {
        templateData.actionBar.dispose();
    }
};
TrustedUriActionsColumnRenderer = __decorate([
    __param(2, IUriIdentityService)
], TrustedUriActionsColumnRenderer);
let TrustedUriPathColumnRenderer = class TrustedUriPathColumnRenderer {
    table;
    contextViewService;
    themeService;
    static TEMPLATE_ID = 'path';
    templateId = TrustedUriPathColumnRenderer.TEMPLATE_ID;
    currentItem;
    constructor(table, contextViewService, themeService) {
        this.table = table;
        this.contextViewService = contextViewService;
        this.themeService = themeService;
    }
    renderTemplate(container) {
        const element = container.appendChild($('.path'));
        const pathLabel = element.appendChild($('div.path-label'));
        const pathInput = new InputBox(element, this.contextViewService, {
            validationOptions: {
                validation: value => this.table.validateUri(value, this.currentItem)
            }
        });
        const disposables = new DisposableStore();
        disposables.add(attachInputBoxStyler(pathInput, this.themeService));
        const renderDisposables = disposables.add(new DisposableStore());
        return {
            element,
            pathLabel,
            pathInput,
            disposables,
            renderDisposables
        };
    }
    renderElement(item, index, templateData, height) {
        templateData.renderDisposables.clear();
        this.currentItem = item;
        templateData.renderDisposables.add(this.table.onEdit(async (e) => {
            if (item === e) {
                templateData.element.classList.add('input-mode');
                templateData.pathInput.focus();
                templateData.pathInput.select();
                templateData.element.parentElement.style.paddingLeft = '0px';
            }
        }));
        // stop double click action from re-rendering the element on the table #125052
        templateData.renderDisposables.add(addDisposableListener(templateData.pathInput.element, EventType.DBLCLICK, e => {
            EventHelper.stop(e);
        }));
        const hideInputBox = () => {
            templateData.element.classList.remove('input-mode');
            templateData.element.parentElement.style.paddingLeft = '5px';
        };
        const accept = () => {
            hideInputBox();
            const pathToUse = templateData.pathInput.value;
            const uri = hasDriveLetter(pathToUse) ? item.uri.with({ path: posix.sep + toSlashes(pathToUse) }) : item.uri.with({ path: pathToUse });
            templateData.pathLabel.innerText = this.formatPath(uri);
            if (uri) {
                this.table.acceptEdit(item, uri);
            }
        };
        const reject = () => {
            hideInputBox();
            templateData.pathInput.value = stringValue;
            this.table.rejectEdit(item);
        };
        templateData.renderDisposables.add(addStandardDisposableListener(templateData.pathInput.inputElement, EventType.KEY_DOWN, e => {
            let handled = false;
            if (e.equals(3 /* KeyCode.Enter */)) {
                accept();
                handled = true;
            }
            else if (e.equals(9 /* KeyCode.Escape */)) {
                reject();
                handled = true;
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        }));
        templateData.renderDisposables.add((addDisposableListener(templateData.pathInput.inputElement, EventType.BLUR, () => {
            reject();
        })));
        const stringValue = this.formatPath(item.uri);
        templateData.pathInput.value = stringValue;
        templateData.pathLabel.innerText = stringValue;
        templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
        templateData.renderDisposables.dispose();
    }
    formatPath(uri) {
        if (uri.scheme === Schemas.file) {
            return uri.fsPath;
        }
        // If the path is not a file uri, but points to a windows remote, we should create windows fs path
        // e.g. /c:/user/directory => C:\user\directory
        if (uri.path.startsWith(posix.sep)) {
            const pathWithoutLeadingSeparator = uri.path.substring(1);
            const isWindowsPath = hasDriveLetter(pathWithoutLeadingSeparator, true);
            if (isWindowsPath) {
                return win32.normalize(pathWithoutLeadingSeparator);
            }
        }
        return uri.path;
    }
};
TrustedUriPathColumnRenderer = __decorate([
    __param(1, IContextViewService),
    __param(2, IThemeService)
], TrustedUriPathColumnRenderer);
function getHostLabel(labelService, item) {
    return item.uri.authority ? labelService.getHostLabel(item.uri.scheme, item.uri.authority) : localize('localAuthority', "Local");
}
let TrustedUriHostColumnRenderer = class TrustedUriHostColumnRenderer {
    labelService;
    static TEMPLATE_ID = 'host';
    templateId = TrustedUriHostColumnRenderer.TEMPLATE_ID;
    constructor(labelService) {
        this.labelService = labelService;
    }
    renderTemplate(container) {
        const disposables = new DisposableStore();
        const renderDisposables = disposables.add(new DisposableStore());
        const element = container.appendChild($('.host'));
        const hostContainer = element.appendChild($('div.host-label'));
        const buttonBarContainer = element.appendChild($('div.button-bar'));
        return {
            element,
            hostContainer,
            buttonBarContainer,
            disposables,
            renderDisposables
        };
    }
    renderElement(item, index, templateData, height) {
        templateData.renderDisposables.clear();
        templateData.renderDisposables.add({ dispose: () => { clearNode(templateData.buttonBarContainer); } });
        templateData.hostContainer.innerText = getHostLabel(this.labelService, item);
        templateData.element.classList.toggle('current-workspace-parent', item.parentOfWorkspaceItem);
        templateData.hostContainer.style.display = '';
        templateData.buttonBarContainer.style.display = 'none';
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
    }
};
TrustedUriHostColumnRenderer = __decorate([
    __param(0, ILabelService)
], TrustedUriHostColumnRenderer);
let WorkspaceTrustEditor = class WorkspaceTrustEditor extends EditorPane {
    workspaceService;
    extensionWorkbenchService;
    extensionManifestPropertiesService;
    instantiationService;
    contextMenuService;
    workspaceTrustManagementService;
    configurationService;
    extensionEnablementService;
    productService;
    static ID = 'workbench.editor.workspaceTrust';
    rootElement;
    // Header Section
    headerContainer;
    headerTitleContainer;
    headerTitleIcon;
    headerTitleText;
    headerDescription;
    bodyScrollBar;
    // Affected Features Section
    affectedFeaturesContainer;
    trustedContainer;
    untrustedContainer;
    // Settings Section
    configurationContainer;
    workspaceTrustedUrisTable;
    constructor(telemetryService, themeService, storageService, workspaceService, extensionWorkbenchService, extensionManifestPropertiesService, instantiationService, contextMenuService, workspaceTrustManagementService, configurationService, extensionEnablementService, productService) {
        super(WorkspaceTrustEditor.ID, telemetryService, themeService, storageService);
        this.workspaceService = workspaceService;
        this.extensionWorkbenchService = extensionWorkbenchService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.configurationService = configurationService;
        this.extensionEnablementService = extensionEnablementService;
        this.productService = productService;
    }
    createEditor(parent) {
        this.rootElement = append(parent, $('.workspace-trust-editor', { tabindex: '0' }));
        this.rootElement.style.visibility = 'hidden';
        this.createHeaderElement(this.rootElement);
        const scrollableContent = $('.workspace-trust-editor-body');
        this.bodyScrollBar = this._register(new DomScrollableElement(scrollableContent, {
            horizontal: 2 /* ScrollbarVisibility.Hidden */,
            vertical: 1 /* ScrollbarVisibility.Auto */,
        }));
        append(this.rootElement, this.bodyScrollBar.getDomNode());
        this.createAffectedFeaturesElement(scrollableContent);
        this.createConfigurationElement(scrollableContent);
        this._register(attachStylerCallback(this.themeService, { debugIconStartForeground, editorErrorForeground, buttonBackground, buttonSecondaryBackground }, colors => {
            this.rootElement.style.setProperty('--workspace-trust-selected-color', colors.buttonBackground?.toString() || '');
            this.rootElement.style.setProperty('--workspace-trust-unselected-color', colors.buttonSecondaryBackground?.toString() || '');
            this.rootElement.style.setProperty('--workspace-trust-check-color', colors.debugIconStartForeground?.toString() || '');
            this.rootElement.style.setProperty('--workspace-trust-x-color', colors.editorErrorForeground?.toString() || '');
        }));
        // Navigate page with keyboard
        this._register(addDisposableListener(this.rootElement, EventType.KEY_DOWN, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(16 /* KeyCode.UpArrow */) || event.equals(18 /* KeyCode.DownArrow */)) {
                const navOrder = [this.headerContainer, this.trustedContainer, this.untrustedContainer, this.configurationContainer];
                const currentIndex = navOrder.findIndex(element => {
                    return isAncestor(document.activeElement, element);
                });
                let newIndex = currentIndex;
                if (event.equals(18 /* KeyCode.DownArrow */)) {
                    newIndex++;
                }
                else if (event.equals(16 /* KeyCode.UpArrow */)) {
                    newIndex = Math.max(0, newIndex);
                    newIndex--;
                }
                newIndex += navOrder.length;
                newIndex %= navOrder.length;
                navOrder[newIndex].focus();
            }
            else if (event.equals(9 /* KeyCode.Escape */)) {
                this.rootElement.focus();
            }
        }));
    }
    focus() {
        this.rootElement.focus();
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        if (token.isCancellationRequested) {
            return;
        }
        await this.workspaceTrustManagementService.workspaceTrustInitialized;
        this.registerListeners();
        this.render();
    }
    registerListeners() {
        this._register(this.extensionWorkbenchService.onChange(() => this.render()));
        this._register(this.configurationService.onDidChangeRestrictedSettings(() => this.render()));
        this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this.render()));
        this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => this.render()));
    }
    getHeaderContainerClass(trusted) {
        if (trusted) {
            return 'workspace-trust-header workspace-trust-trusted';
        }
        return 'workspace-trust-header workspace-trust-untrusted';
    }
    getHeaderTitleText(trusted) {
        if (trusted) {
            if (this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
                return localize('trustedUnsettableWindow', "This window is trusted");
            }
            switch (this.workspaceService.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */:
                    return localize('trustedHeaderWindow', "You trust this window");
                case 2 /* WorkbenchState.FOLDER */:
                    return localize('trustedHeaderFolder', "You trust this folder");
                case 3 /* WorkbenchState.WORKSPACE */:
                    return localize('trustedHeaderWorkspace', "You trust this workspace");
            }
        }
        return localize('untrustedHeader', "You are in Restricted Mode");
    }
    getHeaderTitleIconClassNames(trusted) {
        return ThemeIcon.asClassNameArray(shieldIcon);
    }
    getFeaturesHeaderText(trusted) {
        let title = '';
        let subTitle = '';
        switch (this.workspaceService.getWorkbenchState()) {
            case 1 /* WorkbenchState.EMPTY */: {
                title = trusted ? localize('trustedWindow', "In a Trusted Window") : localize('untrustedWorkspace', "In Restricted Mode");
                subTitle = trusted ? localize('trustedWindowSubtitle', "You trust the authors of the files in the current window. All features are enabled:") :
                    localize('untrustedWindowSubtitle', "You do not trust the authors of the files in the current window. The following features are disabled:");
                break;
            }
            case 2 /* WorkbenchState.FOLDER */: {
                title = trusted ? localize('trustedFolder', "In a Trusted Folder") : localize('untrustedWorkspace', "In Restricted Mode");
                subTitle = trusted ? localize('trustedFolderSubtitle', "You trust the authors of the files in the current folder. All features are enabled:") :
                    localize('untrustedFolderSubtitle', "You do not trust the authors of the files in the current folder. The following features are disabled:");
                break;
            }
            case 3 /* WorkbenchState.WORKSPACE */: {
                title = trusted ? localize('trustedWorkspace', "In a Trusted Workspace") : localize('untrustedWorkspace', "In Restricted Mode");
                subTitle = trusted ? localize('trustedWorkspaceSubtitle', "You trust the authors of the files in the current workspace. All features are enabled:") :
                    localize('untrustedWorkspaceSubtitle', "You do not trust the authors of the files in the current workspace. The following features are disabled:");
                break;
            }
        }
        return [title, subTitle];
    }
    rendering = false;
    rerenderDisposables = this._register(new DisposableStore());
    async render() {
        if (this.rendering) {
            return;
        }
        this.rendering = true;
        this.rerenderDisposables.clear();
        const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
        this.rootElement.classList.toggle('trusted', isWorkspaceTrusted);
        this.rootElement.classList.toggle('untrusted', !isWorkspaceTrusted);
        // Header Section
        this.headerTitleText.innerText = this.getHeaderTitleText(isWorkspaceTrusted);
        this.headerTitleIcon.className = 'workspace-trust-title-icon';
        this.headerTitleIcon.classList.add(...this.getHeaderTitleIconClassNames(isWorkspaceTrusted));
        this.headerDescription.innerText = '';
        const headerDescriptionText = append(this.headerDescription, $('div'));
        headerDescriptionText.innerText = isWorkspaceTrusted ?
            localize('trustedDescription', "All features are enabled because trust has been granted to the workspace.") :
            localize('untrustedDescription', "{0} is in a restricted mode intended for safe code browsing.", this.productService.nameShort);
        const headerDescriptionActions = append(this.headerDescription, $('div'));
        const headerDescriptionActionsText = localize({ key: 'workspaceTrustEditorHeaderActions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[Configure your settings]({0}) or [learn more](https://aka.ms/vscode-workspace-trust).", `command:workbench.trust.configure`);
        for (const node of parseLinkedText(headerDescriptionActionsText).nodes) {
            if (typeof node === 'string') {
                append(headerDescriptionActions, document.createTextNode(node));
            }
            else {
                this.rerenderDisposables.add(this.instantiationService.createInstance(Link, headerDescriptionActions, { ...node, tabIndex: -1 }, {}));
            }
        }
        this.headerContainer.className = this.getHeaderContainerClass(isWorkspaceTrusted);
        this.rootElement.setAttribute('aria-label', `${localize('root element label', "Manage Workspace Trust")}:  ${this.headerContainer.innerText}`);
        // Settings
        const restrictedSettings = this.configurationService.restrictedSettings;
        const configurationRegistry = Registry.as(Extensions.Configuration);
        const settingsRequiringTrustedWorkspaceCount = restrictedSettings.default.filter(key => {
            const property = configurationRegistry.getConfigurationProperties()[key];
            // cannot be configured in workspace
            if (property.scope === 1 /* ConfigurationScope.APPLICATION */ || property.scope === 2 /* ConfigurationScope.MACHINE */) {
                return false;
            }
            // If deprecated include only those configured in the workspace
            if (property.deprecationMessage || property.markdownDeprecationMessage) {
                if (restrictedSettings.workspace?.includes(key)) {
                    return true;
                }
                if (restrictedSettings.workspaceFolder) {
                    for (const workspaceFolderSettings of restrictedSettings.workspaceFolder.values()) {
                        if (workspaceFolderSettings.includes(key)) {
                            return true;
                        }
                    }
                }
                return false;
            }
            return true;
        }).length;
        // Features List
        this.renderAffectedFeatures(settingsRequiringTrustedWorkspaceCount, this.getExtensionCount());
        // Configuration Tree
        this.workspaceTrustedUrisTable.updateTable();
        this.bodyScrollBar.getDomNode().style.height = `calc(100% - ${this.headerContainer.clientHeight}px)`;
        this.bodyScrollBar.scanDomNode();
        this.rootElement.style.visibility = '';
        this.rendering = false;
    }
    getExtensionCount() {
        const set = new Set();
        const inVirtualWorkspace = isVirtualWorkspace(this.workspaceService.getWorkspace());
        const localExtensions = this.extensionWorkbenchService.local.filter(ext => ext.local).map(ext => ext.local);
        for (const extension of localExtensions) {
            const enablementState = this.extensionEnablementService.getEnablementState(extension);
            if (enablementState !== 8 /* EnablementState.EnabledGlobally */ && enablementState !== 9 /* EnablementState.EnabledWorkspace */ &&
                enablementState !== 0 /* EnablementState.DisabledByTrustRequirement */ && enablementState !== 5 /* EnablementState.DisabledByExtensionDependency */) {
                continue;
            }
            if (inVirtualWorkspace && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) === false) {
                continue;
            }
            if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) !== true) {
                set.add(extension.identifier.id);
                continue;
            }
            const dependencies = getExtensionDependencies(localExtensions, extension);
            if (dependencies.some(ext => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === false)) {
                set.add(extension.identifier.id);
            }
        }
        return set.size;
    }
    createHeaderElement(parent) {
        this.headerContainer = append(parent, $('.workspace-trust-header', { tabIndex: '0' }));
        this.headerTitleContainer = append(this.headerContainer, $('.workspace-trust-title'));
        this.headerTitleIcon = append(this.headerTitleContainer, $('.workspace-trust-title-icon'));
        this.headerTitleText = append(this.headerTitleContainer, $('.workspace-trust-title-text'));
        this.headerDescription = append(this.headerContainer, $('.workspace-trust-description'));
    }
    createConfigurationElement(parent) {
        this.configurationContainer = append(parent, $('.workspace-trust-settings', { tabIndex: '0' }));
        const configurationTitle = append(this.configurationContainer, $('.workspace-trusted-folders-title'));
        configurationTitle.innerText = localize('trustedFoldersAndWorkspaces', "Trusted Folders & Workspaces");
        this.workspaceTrustedUrisTable = this._register(this.instantiationService.createInstance(WorkspaceTrustedUrisTable, this.configurationContainer));
    }
    createAffectedFeaturesElement(parent) {
        this.affectedFeaturesContainer = append(parent, $('.workspace-trust-features'));
        this.trustedContainer = append(this.affectedFeaturesContainer, $('.workspace-trust-limitations.trusted', { tabIndex: '0' }));
        this.untrustedContainer = append(this.affectedFeaturesContainer, $('.workspace-trust-limitations.untrusted', { tabIndex: '0' }));
    }
    async renderAffectedFeatures(numSettings, numExtensions) {
        clearNode(this.trustedContainer);
        clearNode(this.untrustedContainer);
        // Trusted features
        const [trustedTitle, trustedSubTitle] = this.getFeaturesHeaderText(true);
        this.renderLimitationsHeaderElement(this.trustedContainer, trustedTitle, trustedSubTitle);
        const trustedContainerItems = this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ?
            [
                localize('trustedTasks', "Tasks are allowed to run"),
                localize('trustedDebugging', "Debugging is enabled"),
                localize('trustedExtensions', "All extensions are enabled")
            ] :
            [
                localize('trustedTasks', "Tasks are allowed to run"),
                localize('trustedDebugging', "Debugging is enabled"),
                localize('trustedSettings', "All workspace settings are applied"),
                localize('trustedExtensions', "All extensions are enabled")
            ];
        this.renderLimitationsListElement(this.trustedContainer, trustedContainerItems, ThemeIcon.asClassNameArray(checkListIcon));
        // Restricted Mode features
        const [untrustedTitle, untrustedSubTitle] = this.getFeaturesHeaderText(false);
        this.renderLimitationsHeaderElement(this.untrustedContainer, untrustedTitle, untrustedSubTitle);
        const untrustedContainerItems = this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ?
            [
                localize('untrustedTasks', "Tasks are not allowed to run"),
                localize('untrustedDebugging', "Debugging is disabled"),
                fixBadLocalizedLinks(localize({ key: 'untrustedExtensions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} extensions]({1}) are disabled or have limited functionality", numExtensions, `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
            ] :
            [
                localize('untrustedTasks', "Tasks are not allowed to run"),
                localize('untrustedDebugging', "Debugging is disabled"),
                fixBadLocalizedLinks(numSettings ? localize({ key: 'untrustedSettings', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} workspace settings]({1}) are not applied", numSettings, 'command:settings.filterUntrusted') : localize('no untrustedSettings', "Workspace settings requiring trust are not applied")),
                fixBadLocalizedLinks(localize({ key: 'untrustedExtensions', comment: ['Please ensure the markdown link syntax is not broken up with whitespace [text block](link block)'] }, "[{0} extensions]({1}) are disabled or have limited functionality", numExtensions, `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`))
            ];
        this.renderLimitationsListElement(this.untrustedContainer, untrustedContainerItems, ThemeIcon.asClassNameArray(xListIcon));
        if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                this.addDontTrustButtonToElement(this.untrustedContainer);
            }
            else {
                this.addTrustedTextToElement(this.untrustedContainer);
            }
        }
        else {
            if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                this.addTrustButtonToElement(this.trustedContainer);
            }
        }
    }
    createButtonRow(parent, actions, enabled) {
        const buttonRow = append(parent, $('.workspace-trust-buttons-row'));
        const buttonContainer = append(buttonRow, $('.workspace-trust-buttons'));
        const buttonBar = this.rerenderDisposables.add(new ButtonBar(buttonContainer));
        if (actions instanceof Action) {
            actions = [actions];
        }
        for (const action of actions) {
            const button = action instanceof ChoiceAction && action.menu?.length ?
                buttonBar.addButtonWithDropdown({
                    title: true,
                    actions: action.menu ?? [],
                    contextMenuProvider: this.contextMenuService,
                    ...defaultButtonStyles
                }) :
                buttonBar.addButton(defaultButtonStyles);
            button.label = action.label;
            button.enabled = enabled !== undefined ? enabled : action.enabled;
            this.rerenderDisposables.add(button.onDidClick(e => {
                if (e) {
                    EventHelper.stop(e, true);
                }
                action.run();
            }));
        }
    }
    addTrustButtonToElement(parent) {
        const trustActions = [
            new Action('workspace.trust.button.action.grant', localize('trustButton', "Trust"), undefined, true, async () => {
                await this.workspaceTrustManagementService.setWorkspaceTrust(true);
            })
        ];
        if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
            const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceService.getWorkspace());
            const { name } = splitName(splitName(workspaceIdentifier.uri.fsPath).parentPath);
            const trustMessageElement = append(parent, $('.trust-message-box'));
            trustMessageElement.innerText = localize('trustMessage', "Trust the authors of all files in the current folder or its parent '{0}'.", name);
            trustActions.push(new Action('workspace.trust.button.action.grantParent', localize('trustParentButton', "Trust Parent"), undefined, true, async () => {
                await this.workspaceTrustManagementService.setParentFolderTrust(true);
            }));
        }
        this.createButtonRow(parent, trustActions);
    }
    addDontTrustButtonToElement(parent) {
        this.createButtonRow(parent, new Action('workspace.trust.button.action.deny', localize('dontTrustButton', "Don't Trust"), undefined, true, async () => {
            await this.workspaceTrustManagementService.setWorkspaceTrust(false);
        }));
    }
    addTrustedTextToElement(parent) {
        if (this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            return;
        }
        const textElement = append(parent, $('.workspace-trust-untrusted-description'));
        if (!this.workspaceTrustManagementService.isWorkspaceTrustForced()) {
            textElement.innerText = this.workspaceService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? localize('untrustedWorkspaceReason', "This workspace is trusted via the bolded entries in the trusted folders below.") : localize('untrustedFolderReason', "This folder is trusted via the bolded entries in the the trusted folders below.");
        }
        else {
            textElement.innerText = localize('trustedForcedReason', "This window is trusted by nature of the workspace that is opened.");
        }
    }
    renderLimitationsHeaderElement(parent, headerText, subtitleText) {
        const limitationsHeaderContainer = append(parent, $('.workspace-trust-limitations-header'));
        const titleElement = append(limitationsHeaderContainer, $('.workspace-trust-limitations-title'));
        const textElement = append(titleElement, $('.workspace-trust-limitations-title-text'));
        const subtitleElement = append(limitationsHeaderContainer, $('.workspace-trust-limitations-subtitle'));
        textElement.innerText = headerText;
        subtitleElement.innerText = subtitleText;
    }
    renderLimitationsListElement(parent, limitations, iconClassNames) {
        const listContainer = append(parent, $('.workspace-trust-limitations-list-container'));
        const limitationsList = append(listContainer, $('ul'));
        for (const limitation of limitations) {
            const limitationListItem = append(limitationsList, $('li'));
            const icon = append(limitationListItem, $('.list-item-icon'));
            const text = append(limitationListItem, $('.list-item-text'));
            icon.classList.add(...iconClassNames);
            const linkedText = parseLinkedText(limitation);
            for (const node of linkedText.nodes) {
                if (typeof node === 'string') {
                    append(text, document.createTextNode(node));
                }
                else {
                    this.rerenderDisposables.add(this.instantiationService.createInstance(Link, text, { ...node, tabIndex: -1 }, {}));
                }
            }
        }
    }
    layoutParticipants = [];
    layout(dimension) {
        if (!this.isVisible()) {
            return;
        }
        this.workspaceTrustedUrisTable.layout();
        this.layoutParticipants.forEach(participant => {
            participant.layout();
        });
        this.bodyScrollBar.scanDomNode();
    }
};
__decorate([
    debounce(100)
], WorkspaceTrustEditor.prototype, "render", null);
WorkspaceTrustEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IStorageService),
    __param(3, IWorkspaceContextService),
    __param(4, IExtensionsWorkbenchService),
    __param(5, IExtensionManifestPropertiesService),
    __param(6, IInstantiationService),
    __param(7, IContextMenuService),
    __param(8, IWorkspaceTrustManagementService),
    __param(9, IWorkbenchConfigurationService),
    __param(10, IWorkbenchExtensionEnablementService),
    __param(11, IProductService)
], WorkspaceTrustEditor);
export { WorkspaceTrustEditor };
// Highly scoped fix for #126614
function fixBadLocalizedLinks(badString) {
    const regex = /(.*)\[(.+)\]\s*\((.+)\)(.*)/; // markdown link match with spaces
    return badString.replace(regex, '$1[$2]($3)$4');
}
