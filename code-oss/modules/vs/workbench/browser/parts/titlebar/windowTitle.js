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
import { localize } from 'vs/nls';
import { dirname, basename } from 'vs/base/common/resources';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { isWindows, isWeb } from 'vs/base/common/platform';
import { trim } from 'vs/base/common/strings';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { template } from 'vs/base/common/labels';
import { ILabelService } from 'vs/platform/label/common/label';
import { Emitter } from 'vs/base/common/event';
import { RunOnceScheduler } from 'vs/base/common/async';
import { IProductService } from 'vs/platform/product/common/productService';
import { Schemas } from 'vs/base/common/network';
import { withNullAsUndefined } from 'vs/base/common/types';
import { getVirtualWorkspaceLocation } from 'vs/platform/workspace/common/virtualWorkspace';
var WindowSettingNames;
(function (WindowSettingNames) {
    WindowSettingNames["titleSeparator"] = "window.titleSeparator";
    WindowSettingNames["title"] = "window.title";
})(WindowSettingNames || (WindowSettingNames = {}));
let WindowTitle = class WindowTitle extends Disposable {
    configurationService;
    editorService;
    environmentService;
    contextService;
    instantiationService;
    labelService;
    productService;
    static NLS_USER_IS_ADMIN = isWindows ? localize('userIsAdmin', "[Administrator]") : localize('userIsSudo', "[Superuser]");
    static NLS_EXTENSION_HOST = localize('devExtensionWindowTitlePrefix', "[Extension Development Host]");
    static TITLE_DIRTY = '\u25cf ';
    properties = { isPure: true, isAdmin: false, prefix: undefined };
    activeEditorListeners = this._register(new DisposableStore());
    titleUpdater = this._register(new RunOnceScheduler(() => this.doUpdateTitle(), 0));
    onDidChangeEmitter = new Emitter();
    onDidChange = this.onDidChangeEmitter.event;
    title;
    constructor(configurationService, editorService, environmentService, contextService, instantiationService, labelService, productService) {
        super();
        this.configurationService = configurationService;
        this.editorService = editorService;
        this.environmentService = environmentService;
        this.contextService = contextService;
        this.instantiationService = instantiationService;
        this.labelService = labelService;
        this.productService = productService;
        this.registerListeners();
    }
    get value() {
        return this.title ?? '';
    }
    get workspaceName() {
        return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace());
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
        this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChange()));
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.titleUpdater.schedule()));
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.titleUpdater.schedule()));
        this._register(this.contextService.onDidChangeWorkspaceName(() => this.titleUpdater.schedule()));
        this._register(this.labelService.onDidChangeFormatters(() => this.titleUpdater.schedule()));
    }
    onConfigurationChanged(event) {
        if (event.affectsConfiguration("window.title" /* WindowSettingNames.title */) || event.affectsConfiguration("window.titleSeparator" /* WindowSettingNames.titleSeparator */)) {
            this.titleUpdater.schedule();
        }
    }
    onActiveEditorChange() {
        // Dispose old listeners
        this.activeEditorListeners.clear();
        // Calculate New Window Title
        this.titleUpdater.schedule();
        // Apply listener for dirty and label changes
        const activeEditor = this.editorService.activeEditor;
        if (activeEditor) {
            this.activeEditorListeners.add(activeEditor.onDidChangeDirty(() => this.titleUpdater.schedule()));
            this.activeEditorListeners.add(activeEditor.onDidChangeLabel(() => this.titleUpdater.schedule()));
        }
    }
    doUpdateTitle() {
        const title = this.getFullWindowTitle();
        if (title !== this.title) {
            // Always set the native window title to identify us properly to the OS
            let nativeTitle = title;
            if (!trim(nativeTitle)) {
                nativeTitle = this.productService.nameLong;
            }
            window.document.title = nativeTitle;
            this.title = title;
            this.onDidChangeEmitter.fire();
        }
    }
    getFullWindowTitle() {
        let title = this.getWindowTitle() || this.productService.nameLong;
        const { prefix, suffix } = this.getTitleDecorations();
        if (prefix) {
            title = `${prefix} ${title}`;
        }
        if (suffix) {
            title = `${title} ${suffix}`;
        }
        // Replace non-space whitespace
        title = title.replace(/[^\S ]/g, ' ');
        return title;
    }
    getTitleDecorations() {
        let prefix;
        let suffix;
        if (this.properties.prefix) {
            prefix = this.properties.prefix;
        }
        if (this.environmentService.isExtensionDevelopment) {
            prefix = !prefix
                ? WindowTitle.NLS_EXTENSION_HOST
                : `${WindowTitle.NLS_EXTENSION_HOST} - ${prefix}`;
        }
        if (this.properties.isAdmin) {
            suffix = WindowTitle.NLS_USER_IS_ADMIN;
        }
        return { prefix, suffix };
    }
    updateProperties(properties) {
        const isAdmin = typeof properties.isAdmin === 'boolean' ? properties.isAdmin : this.properties.isAdmin;
        const isPure = typeof properties.isPure === 'boolean' ? properties.isPure : this.properties.isPure;
        const prefix = typeof properties.prefix === 'string' ? properties.prefix : this.properties.prefix;
        if (isAdmin !== this.properties.isAdmin || isPure !== this.properties.isPure || prefix !== this.properties.prefix) {
            this.properties.isAdmin = isAdmin;
            this.properties.isPure = isPure;
            this.properties.prefix = prefix;
            this.titleUpdater.schedule();
        }
    }
    /**
     * Possible template values:
     *
     * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
     * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
     * {activeEditorShort}: e.g. myFile.txt
     * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
     * {activeFolderMedium}: e.g. myFolder/myFileFolder
     * {activeFolderShort}: e.g. myFileFolder
     * {rootName}: e.g. myFolder1, myFolder2, myFolder3
     * {rootPath}: e.g. /Users/Development
     * {folderName}: e.g. myFolder
     * {folderPath}: e.g. /Users/Development/myFolder
     * {appName}: e.g. VS Code
     * {remoteName}: e.g. SSH
     * {dirty}: indicator
     * {separator}: conditional separator
     */
    getWindowTitle() {
        const editor = this.editorService.activeEditor;
        const workspace = this.contextService.getWorkspace();
        // Compute root
        let root;
        if (workspace.configuration) {
            root = workspace.configuration;
        }
        else if (workspace.folders.length) {
            root = workspace.folders[0].uri;
        }
        // Compute active editor folder
        const editorResource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
        let editorFolderResource = editorResource ? dirname(editorResource) : undefined;
        if (editorFolderResource?.path === '.') {
            editorFolderResource = undefined;
        }
        // Compute folder resource
        // Single Root Workspace: always the root single workspace in this case
        // Otherwise: root folder of the currently active file if any
        let folder = undefined;
        if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
            folder = workspace.folders[0];
        }
        else if (editorResource) {
            folder = withNullAsUndefined(this.contextService.getWorkspaceFolder(editorResource));
        }
        // Compute remote
        // vscode-remtoe: use as is
        // otherwise figure out if we have a virtual folder opened
        let remoteName = undefined;
        if (this.environmentService.remoteAuthority && !isWeb) {
            remoteName = this.labelService.getHostLabel(Schemas.vscodeRemote, this.environmentService.remoteAuthority);
        }
        else {
            const virtualWorkspaceLocation = getVirtualWorkspaceLocation(workspace);
            if (virtualWorkspaceLocation) {
                remoteName = this.labelService.getHostLabel(virtualWorkspaceLocation.scheme, virtualWorkspaceLocation.authority);
            }
        }
        // Variables
        const activeEditorShort = editor ? editor.getTitle(0 /* Verbosity.SHORT */) : '';
        const activeEditorMedium = editor ? editor.getTitle(1 /* Verbosity.MEDIUM */) : activeEditorShort;
        const activeEditorLong = editor ? editor.getTitle(2 /* Verbosity.LONG */) : activeEditorMedium;
        const activeFolderShort = editorFolderResource ? basename(editorFolderResource) : '';
        const activeFolderMedium = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource, { relative: true }) : '';
        const activeFolderLong = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource) : '';
        const rootName = this.labelService.getWorkspaceLabel(workspace);
        const rootPath = root ? this.labelService.getUriLabel(root) : '';
        const folderName = folder ? folder.name : '';
        const folderPath = folder ? this.labelService.getUriLabel(folder.uri) : '';
        const dirty = editor?.isDirty() && !editor.isSaving() ? WindowTitle.TITLE_DIRTY : '';
        const appName = this.productService.nameLong;
        const separator = this.configurationService.getValue("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
        const titleTemplate = this.configurationService.getValue("window.title" /* WindowSettingNames.title */);
        return template(titleTemplate, {
            activeEditorShort,
            activeEditorLong,
            activeEditorMedium,
            activeFolderShort,
            activeFolderMedium,
            activeFolderLong,
            rootName,
            rootPath,
            folderName,
            folderPath,
            dirty,
            appName,
            remoteName,
            separator: { label: separator }
        });
    }
    isCustomTitleFormat() {
        const title = this.configurationService.inspect("window.title" /* WindowSettingNames.title */);
        const titleSeparator = this.configurationService.inspect("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
        return title.value !== title.defaultValue || titleSeparator.value !== titleSeparator.defaultValue;
    }
};
WindowTitle = __decorate([
    __param(0, IConfigurationService),
    __param(1, IEditorService),
    __param(2, IBrowserWorkbenchEnvironmentService),
    __param(3, IWorkspaceContextService),
    __param(4, IInstantiationService),
    __param(5, ILabelService),
    __param(6, IProductService)
], WindowTitle);
export { WindowTitle };
