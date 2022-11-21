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
import * as nls from 'vs/nls';
import * as resources from 'vs/base/common/resources';
import * as objects from 'vs/base/common/objects';
import { IFileService, FileKind } from 'vs/platform/files/common/files';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { URI } from 'vs/base/common/uri';
import { isWindows } from 'vs/base/common/platform';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ILabelService } from 'vs/platform/label/common/label';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { getIconClasses } from 'vs/editor/common/services/getIconClasses';
import { Schemas } from 'vs/base/common/network';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { equalsIgnoreCase, format, startsWithIgnoreCase } from 'vs/base/common/strings';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { isValidBasename } from 'vs/base/common/extpath';
import { Emitter } from 'vs/base/common/event';
import { dispose } from 'vs/base/common/lifecycle';
import { createCancelablePromise } from 'vs/base/common/async';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { normalizeDriveLetter } from 'vs/base/common/labels';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
export var OpenLocalFileCommand;
(function (OpenLocalFileCommand) {
    OpenLocalFileCommand.ID = 'workbench.action.files.openLocalFile';
    OpenLocalFileCommand.LABEL = nls.localize('openLocalFile', "Open Local File...");
    function handler() {
        return accessor => {
            const dialogService = accessor.get(IFileDialogService);
            return dialogService.pickFileAndOpen({ forceNewWindow: false, availableFileSystems: [Schemas.file] });
        };
    }
    OpenLocalFileCommand.handler = handler;
})(OpenLocalFileCommand || (OpenLocalFileCommand = {}));
export var SaveLocalFileCommand;
(function (SaveLocalFileCommand) {
    SaveLocalFileCommand.ID = 'workbench.action.files.saveLocalFile';
    SaveLocalFileCommand.LABEL = nls.localize('saveLocalFile', "Save Local File...");
    function handler() {
        return accessor => {
            const editorService = accessor.get(IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane) {
                return editorService.save({ groupId: activeEditorPane.group.id, editor: activeEditorPane.input }, { saveAs: true, availableFileSystems: [Schemas.file], reason: 1 /* SaveReason.EXPLICIT */ });
            }
            return Promise.resolve(undefined);
        };
    }
    SaveLocalFileCommand.handler = handler;
})(SaveLocalFileCommand || (SaveLocalFileCommand = {}));
export var OpenLocalFolderCommand;
(function (OpenLocalFolderCommand) {
    OpenLocalFolderCommand.ID = 'workbench.action.files.openLocalFolder';
    OpenLocalFolderCommand.LABEL = nls.localize('openLocalFolder', "Open Local Folder...");
    function handler() {
        return accessor => {
            const dialogService = accessor.get(IFileDialogService);
            return dialogService.pickFolderAndOpen({ forceNewWindow: false, availableFileSystems: [Schemas.file] });
        };
    }
    OpenLocalFolderCommand.handler = handler;
})(OpenLocalFolderCommand || (OpenLocalFolderCommand = {}));
export var OpenLocalFileFolderCommand;
(function (OpenLocalFileFolderCommand) {
    OpenLocalFileFolderCommand.ID = 'workbench.action.files.openLocalFileFolder';
    OpenLocalFileFolderCommand.LABEL = nls.localize('openLocalFileFolder', "Open Local...");
    function handler() {
        return accessor => {
            const dialogService = accessor.get(IFileDialogService);
            return dialogService.pickFileFolderAndOpen({ forceNewWindow: false, availableFileSystems: [Schemas.file] });
        };
    }
    OpenLocalFileFolderCommand.handler = handler;
})(OpenLocalFileFolderCommand || (OpenLocalFileFolderCommand = {}));
var UpdateResult;
(function (UpdateResult) {
    UpdateResult[UpdateResult["Updated"] = 0] = "Updated";
    UpdateResult[UpdateResult["UpdatedWithTrailing"] = 1] = "UpdatedWithTrailing";
    UpdateResult[UpdateResult["Updating"] = 2] = "Updating";
    UpdateResult[UpdateResult["NotUpdated"] = 3] = "NotUpdated";
    UpdateResult[UpdateResult["InvalidPath"] = 4] = "InvalidPath";
})(UpdateResult || (UpdateResult = {}));
export const RemoteFileDialogContext = new RawContextKey('remoteFileDialogVisible', false);
let SimpleFileDialog = class SimpleFileDialog {
    fileService;
    quickInputService;
    labelService;
    workspaceContextService;
    notificationService;
    fileDialogService;
    modelService;
    languageService;
    environmentService;
    remoteAgentService;
    pathService;
    keybindingService;
    accessibilityService;
    options;
    currentFolder;
    filePickBox;
    hidden = false;
    allowFileSelection = true;
    allowFolderSelection = false;
    remoteAuthority;
    requiresTrailing = false;
    trailing;
    scheme;
    contextKey;
    userEnteredPathSegment = '';
    autoCompletePathSegment = '';
    activeItem;
    userHome;
    isWindows = false;
    badPath;
    remoteAgentEnvironment;
    separator = '/';
    onBusyChangeEmitter = new Emitter();
    updatingPromise;
    disposables = [
        this.onBusyChangeEmitter
    ];
    constructor(fileService, quickInputService, labelService, workspaceContextService, notificationService, fileDialogService, modelService, languageService, environmentService, remoteAgentService, pathService, keybindingService, contextKeyService, accessibilityService) {
        this.fileService = fileService;
        this.quickInputService = quickInputService;
        this.labelService = labelService;
        this.workspaceContextService = workspaceContextService;
        this.notificationService = notificationService;
        this.fileDialogService = fileDialogService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.environmentService = environmentService;
        this.remoteAgentService = remoteAgentService;
        this.pathService = pathService;
        this.keybindingService = keybindingService;
        this.accessibilityService = accessibilityService;
        this.remoteAuthority = this.environmentService.remoteAuthority;
        this.contextKey = RemoteFileDialogContext.bindTo(contextKeyService);
        this.scheme = this.pathService.defaultUriScheme;
    }
    set busy(busy) {
        if (this.filePickBox.busy !== busy) {
            this.filePickBox.busy = busy;
            this.onBusyChangeEmitter.fire(busy);
        }
    }
    get busy() {
        return this.filePickBox.busy;
    }
    async showOpenDialog(options = {}) {
        this.scheme = this.getScheme(options.availableFileSystems, options.defaultUri);
        this.userHome = await this.getUserHome();
        const newOptions = this.getOptions(options);
        if (!newOptions) {
            return Promise.resolve(undefined);
        }
        this.options = newOptions;
        return this.pickResource();
    }
    async showSaveDialog(options) {
        this.scheme = this.getScheme(options.availableFileSystems, options.defaultUri);
        this.userHome = await this.getUserHome();
        this.requiresTrailing = true;
        const newOptions = this.getOptions(options, true);
        if (!newOptions) {
            return Promise.resolve(undefined);
        }
        this.options = newOptions;
        this.options.canSelectFolders = true;
        this.options.canSelectFiles = true;
        return new Promise((resolve) => {
            this.pickResource(true).then(folderUri => {
                resolve(folderUri);
            });
        });
    }
    getOptions(options, isSave = false) {
        let defaultUri = undefined;
        let filename = undefined;
        if (options.defaultUri) {
            defaultUri = (this.scheme === options.defaultUri.scheme) ? options.defaultUri : undefined;
            filename = isSave ? resources.basename(options.defaultUri) : undefined;
        }
        if (!defaultUri) {
            defaultUri = this.userHome;
            if (filename) {
                defaultUri = resources.joinPath(defaultUri, filename);
            }
        }
        if ((this.scheme !== Schemas.file) && !this.fileService.hasProvider(defaultUri)) {
            this.notificationService.info(nls.localize('remoteFileDialog.notConnectedToRemote', 'File system provider for {0} is not available.', defaultUri.toString()));
            return undefined;
        }
        const newOptions = objects.deepClone(options);
        newOptions.defaultUri = defaultUri;
        return newOptions;
    }
    remoteUriFrom(path, hintUri) {
        if (!path.startsWith('\\\\')) {
            path = path.replace(/\\/g, '/');
        }
        const uri = this.scheme === Schemas.file ? URI.file(path) : URI.from({ scheme: this.scheme, path, query: hintUri?.query, fragment: hintUri?.fragment });
        // If the default scheme is file, then we don't care about the remote authority or the hint authority
        const authority = (uri.scheme === Schemas.file) ? undefined : (this.remoteAuthority ?? hintUri?.authority);
        return resources.toLocalResource(uri, authority, 
        // If there is a remote authority, then we should use the system's default URI as the local scheme.
        // If there is *no* remote authority, then we should use the default scheme for this dialog as that is already local.
        authority ? this.pathService.defaultUriScheme : uri.scheme);
    }
    getScheme(available, defaultUri) {
        if (available && available.length > 0) {
            if (defaultUri && (available.indexOf(defaultUri.scheme) >= 0)) {
                return defaultUri.scheme;
            }
            return available[0];
        }
        else if (defaultUri) {
            return defaultUri.scheme;
        }
        return Schemas.file;
    }
    async getRemoteAgentEnvironment() {
        if (this.remoteAgentEnvironment === undefined) {
            this.remoteAgentEnvironment = await this.remoteAgentService.getEnvironment();
        }
        return this.remoteAgentEnvironment;
    }
    getUserHome() {
        return this.pathService.userHome({ preferLocal: this.scheme === Schemas.file });
    }
    async pickResource(isSave = false) {
        this.allowFolderSelection = !!this.options.canSelectFolders;
        this.allowFileSelection = !!this.options.canSelectFiles;
        this.separator = this.labelService.getSeparator(this.scheme, this.remoteAuthority);
        this.hidden = false;
        this.isWindows = await this.checkIsWindowsOS();
        let homedir = this.options.defaultUri ? this.options.defaultUri : this.workspaceContextService.getWorkspace().folders[0].uri;
        let stat;
        const ext = resources.extname(homedir);
        if (this.options.defaultUri) {
            try {
                stat = await this.fileService.stat(this.options.defaultUri);
            }
            catch (e) {
                // The file or folder doesn't exist
            }
            if (!stat || !stat.isDirectory) {
                homedir = resources.dirname(this.options.defaultUri);
                this.trailing = resources.basename(this.options.defaultUri);
            }
        }
        return new Promise((resolve) => {
            this.filePickBox = this.quickInputService.createQuickPick();
            this.busy = true;
            this.filePickBox.matchOnLabel = false;
            this.filePickBox.sortByLabel = false;
            this.filePickBox.autoFocusOnList = false;
            this.filePickBox.ignoreFocusOut = true;
            this.filePickBox.ok = true;
            if ((this.scheme !== Schemas.file) && this.options && this.options.availableFileSystems && (this.options.availableFileSystems.length > 1) && (this.options.availableFileSystems.indexOf(Schemas.file) > -1)) {
                this.filePickBox.customButton = true;
                this.filePickBox.customLabel = nls.localize('remoteFileDialog.local', 'Show Local');
                let action;
                if (isSave) {
                    action = SaveLocalFileCommand;
                }
                else {
                    action = this.allowFileSelection ? (this.allowFolderSelection ? OpenLocalFileFolderCommand : OpenLocalFileCommand) : OpenLocalFolderCommand;
                }
                const keybinding = this.keybindingService.lookupKeybinding(action.ID);
                if (keybinding) {
                    const label = keybinding.getLabel();
                    if (label) {
                        this.filePickBox.customHover = format('{0} ({1})', action.LABEL, label);
                    }
                }
            }
            let isResolving = 0;
            let isAcceptHandled = false;
            this.currentFolder = resources.dirname(homedir);
            this.userEnteredPathSegment = '';
            this.autoCompletePathSegment = '';
            this.filePickBox.title = this.options.title;
            this.filePickBox.value = this.pathFromUri(this.currentFolder, true);
            this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
            this.filePickBox.items = [];
            function doResolve(dialog, uri) {
                if (uri) {
                    uri = resources.addTrailingPathSeparator(uri, dialog.separator); // Ensures that c: is c:/ since this comes from user input and can be incorrect.
                    // To be consistent, we should never have a trailing path separator on directories (or anything else). Will not remove from c:/.
                    uri = resources.removeTrailingPathSeparator(uri);
                }
                resolve(uri);
                dialog.contextKey.set(false);
                dialog.filePickBox.dispose();
                dispose(dialog.disposables);
            }
            this.filePickBox.onDidCustom(() => {
                if (isAcceptHandled || this.busy) {
                    return;
                }
                isAcceptHandled = true;
                isResolving++;
                if (this.options.availableFileSystems && (this.options.availableFileSystems.length > 1)) {
                    this.options.availableFileSystems = this.options.availableFileSystems.slice(1);
                }
                this.filePickBox.hide();
                if (isSave) {
                    return this.fileDialogService.showSaveDialog(this.options).then(result => {
                        doResolve(this, result);
                    });
                }
                else {
                    return this.fileDialogService.showOpenDialog(this.options).then(result => {
                        doResolve(this, result ? result[0] : undefined);
                    });
                }
            });
            function handleAccept(dialog) {
                if (dialog.busy) {
                    // Save the accept until the file picker is not busy.
                    dialog.onBusyChangeEmitter.event((busy) => {
                        if (!busy) {
                            handleAccept(dialog);
                        }
                    });
                    return;
                }
                else if (isAcceptHandled) {
                    return;
                }
                isAcceptHandled = true;
                isResolving++;
                dialog.onDidAccept().then(resolveValue => {
                    if (resolveValue) {
                        dialog.filePickBox.hide();
                        doResolve(dialog, resolveValue);
                    }
                    else if (dialog.hidden) {
                        doResolve(dialog, undefined);
                    }
                    else {
                        isResolving--;
                        isAcceptHandled = false;
                    }
                });
            }
            this.filePickBox.onDidAccept(_ => {
                handleAccept(this);
            });
            this.filePickBox.onDidChangeActive(i => {
                isAcceptHandled = false;
                // update input box to match the first selected item
                if ((i.length === 1) && this.isSelectionChangeFromUser()) {
                    this.filePickBox.validationMessage = undefined;
                    const userPath = this.constructFullUserPath();
                    if (!equalsIgnoreCase(this.filePickBox.value.substring(0, userPath.length), userPath)) {
                        this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
                        this.insertText(userPath, userPath);
                    }
                    this.setAutoComplete(userPath, this.userEnteredPathSegment, i[0], true);
                }
            });
            this.filePickBox.onDidChangeValue(async (value) => {
                return this.handleValueChange(value);
            });
            this.filePickBox.onDidHide(() => {
                this.hidden = true;
                if (isResolving === 0) {
                    doResolve(this, undefined);
                }
            });
            this.filePickBox.show();
            this.contextKey.set(true);
            this.updateItems(homedir, true, this.trailing).then(() => {
                if (this.trailing) {
                    this.filePickBox.valueSelection = [this.filePickBox.value.length - this.trailing.length, this.filePickBox.value.length - ext.length];
                }
                else {
                    this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                }
                this.busy = false;
            });
        });
    }
    async handleValueChange(value) {
        try {
            // onDidChangeValue can also be triggered by the auto complete, so if it looks like the auto complete, don't do anything
            if (this.isValueChangeFromUser()) {
                // If the user has just entered more bad path, don't change anything
                if (!equalsIgnoreCase(value, this.constructFullUserPath()) && !this.isBadSubpath(value)) {
                    this.filePickBox.validationMessage = undefined;
                    const filePickBoxUri = this.filePickBoxValue();
                    let updated = UpdateResult.NotUpdated;
                    if (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, filePickBoxUri)) {
                        updated = await this.tryUpdateItems(value, filePickBoxUri);
                    }
                    if ((updated === UpdateResult.NotUpdated) || (updated === UpdateResult.UpdatedWithTrailing)) {
                        this.setActiveItems(value);
                    }
                }
                else {
                    this.filePickBox.activeItems = [];
                    this.userEnteredPathSegment = '';
                }
            }
        }
        catch {
            // Since any text can be entered in the input box, there is potential for error causing input. If this happens, do nothing.
        }
    }
    isBadSubpath(value) {
        return this.badPath && (value.length > this.badPath.length) && equalsIgnoreCase(value.substring(0, this.badPath.length), this.badPath);
    }
    isValueChangeFromUser() {
        if (equalsIgnoreCase(this.filePickBox.value, this.pathAppend(this.currentFolder, this.userEnteredPathSegment + this.autoCompletePathSegment))) {
            return false;
        }
        return true;
    }
    isSelectionChangeFromUser() {
        if (this.activeItem === (this.filePickBox.activeItems ? this.filePickBox.activeItems[0] : undefined)) {
            return false;
        }
        return true;
    }
    constructFullUserPath() {
        const currentFolderPath = this.pathFromUri(this.currentFolder);
        if (equalsIgnoreCase(this.filePickBox.value.substr(0, this.userEnteredPathSegment.length), this.userEnteredPathSegment)) {
            if (equalsIgnoreCase(this.filePickBox.value.substr(0, currentFolderPath.length), currentFolderPath)) {
                return currentFolderPath;
            }
            else {
                return this.userEnteredPathSegment;
            }
        }
        else {
            return this.pathAppend(this.currentFolder, this.userEnteredPathSegment);
        }
    }
    filePickBoxValue() {
        // The file pick box can't render everything, so we use the current folder to create the uri so that it is an existing path.
        const directUri = this.remoteUriFrom(this.filePickBox.value.trimRight(), this.currentFolder);
        const currentPath = this.pathFromUri(this.currentFolder);
        if (equalsIgnoreCase(this.filePickBox.value, currentPath)) {
            return this.currentFolder;
        }
        const currentDisplayUri = this.remoteUriFrom(currentPath, this.currentFolder);
        const relativePath = resources.relativePath(currentDisplayUri, directUri);
        const isSameRoot = (this.filePickBox.value.length > 1 && currentPath.length > 1) ? equalsIgnoreCase(this.filePickBox.value.substr(0, 2), currentPath.substr(0, 2)) : false;
        if (relativePath && isSameRoot) {
            let path = resources.joinPath(this.currentFolder, relativePath);
            const directBasename = resources.basename(directUri);
            if ((directBasename === '.') || (directBasename === '..')) {
                path = this.remoteUriFrom(this.pathAppend(path, directBasename), this.currentFolder);
            }
            return resources.hasTrailingPathSeparator(directUri) ? resources.addTrailingPathSeparator(path) : path;
        }
        else {
            return directUri;
        }
    }
    async onDidAccept() {
        this.busy = true;
        if (this.filePickBox.activeItems.length === 1) {
            const item = this.filePickBox.selectedItems[0];
            if (item.isFolder) {
                if (this.trailing) {
                    await this.updateItems(item.uri, true, this.trailing);
                }
                else {
                    // When possible, cause the update to happen by modifying the input box.
                    // This allows all input box updates to happen first, and uses the same code path as the user typing.
                    const newPath = this.pathFromUri(item.uri);
                    if (startsWithIgnoreCase(newPath, this.filePickBox.value) && (equalsIgnoreCase(item.label, resources.basename(item.uri)))) {
                        this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder).length, this.filePickBox.value.length];
                        this.insertText(newPath, this.basenameWithTrailingSlash(item.uri));
                    }
                    else if ((item.label === '..') && startsWithIgnoreCase(this.filePickBox.value, newPath)) {
                        this.filePickBox.valueSelection = [newPath.length, this.filePickBox.value.length];
                        this.insertText(newPath, '');
                    }
                    else {
                        await this.updateItems(item.uri, true);
                    }
                }
                this.filePickBox.busy = false;
                return;
            }
        }
        else {
            // If the items have updated, don't try to resolve
            if ((await this.tryUpdateItems(this.filePickBox.value, this.filePickBoxValue())) !== UpdateResult.NotUpdated) {
                this.filePickBox.busy = false;
                return;
            }
        }
        let resolveValue;
        // Find resolve value
        if (this.filePickBox.activeItems.length === 0) {
            resolveValue = this.filePickBoxValue();
        }
        else if (this.filePickBox.activeItems.length === 1) {
            resolveValue = this.filePickBox.selectedItems[0].uri;
        }
        if (resolveValue) {
            resolveValue = this.addPostfix(resolveValue);
        }
        if (await this.validate(resolveValue)) {
            this.busy = false;
            return resolveValue;
        }
        this.busy = false;
        return undefined;
    }
    root(value) {
        let lastDir = value;
        let dir = resources.dirname(value);
        while (!resources.isEqual(lastDir, dir)) {
            lastDir = dir;
            dir = resources.dirname(dir);
        }
        return dir;
    }
    tildaReplace(value) {
        const home = this.userHome;
        if ((value.length > 0) && (value[0] === '~')) {
            return resources.joinPath(home, value.substring(1));
        }
        return this.remoteUriFrom(value);
    }
    tryAddTrailingSeparatorToDirectory(uri, stat) {
        if (stat.isDirectory) {
            // At this point we know it's a directory and can add the trailing path separator
            if (!this.endsWithSlash(uri.path)) {
                return resources.addTrailingPathSeparator(uri);
            }
        }
        return uri;
    }
    async tryUpdateItems(value, valueUri) {
        if ((value.length > 0) && (value[0] === '~')) {
            const newDir = this.tildaReplace(value);
            return await this.updateItems(newDir, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
        }
        else if (value === '\\') {
            valueUri = this.root(this.currentFolder);
            value = this.pathFromUri(valueUri);
            return await this.updateItems(valueUri, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
        }
        else if (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, valueUri) && (this.endsWithSlash(value) || (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, resources.dirname(valueUri)) && resources.extUriIgnorePathCase.isEqualOrParent(this.currentFolder, resources.dirname(valueUri))))) {
            let stat;
            try {
                stat = await this.fileService.stat(valueUri);
            }
            catch (e) {
                // do nothing
            }
            if (stat && stat.isDirectory && (resources.basename(valueUri) !== '.') && this.endsWithSlash(value)) {
                valueUri = this.tryAddTrailingSeparatorToDirectory(valueUri, stat);
                return await this.updateItems(valueUri) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
            }
            else if (this.endsWithSlash(value)) {
                // The input box contains a path that doesn't exist on the system.
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.badPath', 'The path does not exist.');
                // Save this bad path. It can take too long to a stat on every user entered character, but once a user enters a bad path they are likely
                // to keep typing more bad path. We can compare against this bad path and see if the user entered path starts with it.
                this.badPath = value;
                return UpdateResult.InvalidPath;
            }
            else {
                let inputUriDirname = resources.dirname(valueUri);
                const currentFolderWithoutSep = resources.removeTrailingPathSeparator(resources.addTrailingPathSeparator(this.currentFolder));
                const inputUriDirnameWithoutSep = resources.removeTrailingPathSeparator(resources.addTrailingPathSeparator(inputUriDirname));
                if (!resources.extUriIgnorePathCase.isEqual(currentFolderWithoutSep, inputUriDirnameWithoutSep)
                    && (!/^[a-zA-Z]:$/.test(this.filePickBox.value)
                        || !equalsIgnoreCase(this.pathFromUri(this.currentFolder).substring(0, this.filePickBox.value.length), this.filePickBox.value))) {
                    let statWithoutTrailing;
                    try {
                        statWithoutTrailing = await this.fileService.stat(inputUriDirname);
                    }
                    catch (e) {
                        // do nothing
                    }
                    if (statWithoutTrailing && statWithoutTrailing.isDirectory) {
                        this.badPath = undefined;
                        inputUriDirname = this.tryAddTrailingSeparatorToDirectory(inputUriDirname, statWithoutTrailing);
                        return await this.updateItems(inputUriDirname, false, resources.basename(valueUri)) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
                    }
                }
            }
        }
        this.badPath = undefined;
        return UpdateResult.NotUpdated;
    }
    tryUpdateTrailing(value) {
        const ext = resources.extname(value);
        if (this.trailing && ext) {
            this.trailing = resources.basename(value);
        }
    }
    setActiveItems(value) {
        value = this.pathFromUri(this.tildaReplace(value));
        const asUri = this.remoteUriFrom(value);
        const inputBasename = resources.basename(asUri);
        const userPath = this.constructFullUserPath();
        // Make sure that the folder whose children we are currently viewing matches the path in the input
        const pathsEqual = equalsIgnoreCase(userPath, value.substring(0, userPath.length)) ||
            equalsIgnoreCase(value, userPath.substring(0, value.length));
        if (pathsEqual) {
            let hasMatch = false;
            for (let i = 0; i < this.filePickBox.items.length; i++) {
                const item = this.filePickBox.items[i];
                if (this.setAutoComplete(value, inputBasename, item)) {
                    hasMatch = true;
                    break;
                }
            }
            if (!hasMatch) {
                const userBasename = inputBasename.length >= 2 ? userPath.substring(userPath.length - inputBasename.length + 2) : '';
                this.userEnteredPathSegment = (userBasename === inputBasename) ? inputBasename : '';
                this.autoCompletePathSegment = '';
                this.filePickBox.activeItems = [];
                this.tryUpdateTrailing(asUri);
            }
        }
        else {
            this.userEnteredPathSegment = inputBasename;
            this.autoCompletePathSegment = '';
            this.filePickBox.activeItems = [];
            this.tryUpdateTrailing(asUri);
        }
    }
    setAutoComplete(startingValue, startingBasename, quickPickItem, force = false) {
        if (this.busy) {
            // We're in the middle of something else. Doing an auto complete now can result jumbled or incorrect autocompletes.
            this.userEnteredPathSegment = startingBasename;
            this.autoCompletePathSegment = '';
            return false;
        }
        const itemBasename = quickPickItem.label;
        // Either force the autocomplete, or the old value should be one smaller than the new value and match the new value.
        if (itemBasename === '..') {
            // Don't match on the up directory item ever.
            this.userEnteredPathSegment = '';
            this.autoCompletePathSegment = '';
            this.activeItem = quickPickItem;
            if (force) {
                // clear any selected text
                document.execCommand('insertText', false, '');
            }
            return false;
        }
        else if (!force && (itemBasename.length >= startingBasename.length) && equalsIgnoreCase(itemBasename.substr(0, startingBasename.length), startingBasename)) {
            this.userEnteredPathSegment = startingBasename;
            this.activeItem = quickPickItem;
            // Changing the active items will trigger the onDidActiveItemsChanged. Clear the autocomplete first, then set it after.
            this.autoCompletePathSegment = '';
            if (quickPickItem.isFolder || !this.trailing) {
                this.filePickBox.activeItems = [quickPickItem];
            }
            else {
                this.filePickBox.activeItems = [];
            }
            return true;
        }
        else if (force && (!equalsIgnoreCase(this.basenameWithTrailingSlash(quickPickItem.uri), (this.userEnteredPathSegment + this.autoCompletePathSegment)))) {
            this.userEnteredPathSegment = '';
            if (!this.accessibilityService.isScreenReaderOptimized()) {
                this.autoCompletePathSegment = this.trimTrailingSlash(itemBasename);
            }
            this.activeItem = quickPickItem;
            if (!this.accessibilityService.isScreenReaderOptimized()) {
                this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder, true).length, this.filePickBox.value.length];
                // use insert text to preserve undo buffer
                this.insertText(this.pathAppend(this.currentFolder, this.autoCompletePathSegment), this.autoCompletePathSegment);
                this.filePickBox.valueSelection = [this.filePickBox.value.length - this.autoCompletePathSegment.length, this.filePickBox.value.length];
            }
            return true;
        }
        else {
            this.userEnteredPathSegment = startingBasename;
            this.autoCompletePathSegment = '';
            return false;
        }
    }
    insertText(wholeValue, insertText) {
        if (this.filePickBox.inputHasFocus()) {
            document.execCommand('insertText', false, insertText);
            if (this.filePickBox.value !== wholeValue) {
                this.filePickBox.value = wholeValue;
                this.handleValueChange(wholeValue);
            }
        }
        else {
            this.filePickBox.value = wholeValue;
            this.handleValueChange(wholeValue);
        }
    }
    addPostfix(uri) {
        let result = uri;
        if (this.requiresTrailing && this.options.filters && this.options.filters.length > 0 && !resources.hasTrailingPathSeparator(uri)) {
            // Make sure that the suffix is added. If the user deleted it, we automatically add it here
            let hasExt = false;
            const currentExt = resources.extname(uri).substr(1);
            for (let i = 0; i < this.options.filters.length; i++) {
                for (let j = 0; j < this.options.filters[i].extensions.length; j++) {
                    if ((this.options.filters[i].extensions[j] === '*') || (this.options.filters[i].extensions[j] === currentExt)) {
                        hasExt = true;
                        break;
                    }
                }
                if (hasExt) {
                    break;
                }
            }
            if (!hasExt) {
                result = resources.joinPath(resources.dirname(uri), resources.basename(uri) + '.' + this.options.filters[0].extensions[0]);
            }
        }
        return result;
    }
    trimTrailingSlash(path) {
        return ((path.length > 1) && this.endsWithSlash(path)) ? path.substr(0, path.length - 1) : path;
    }
    yesNoPrompt(uri, message) {
        const prompt = this.quickInputService.createQuickPick();
        prompt.title = message;
        prompt.ignoreFocusOut = true;
        prompt.ok = true;
        prompt.customButton = true;
        prompt.customLabel = nls.localize('remoteFileDialog.cancel', 'Cancel');
        prompt.value = this.pathFromUri(uri);
        let isResolving = false;
        return new Promise(resolve => {
            prompt.onDidAccept(() => {
                isResolving = true;
                prompt.hide();
                resolve(true);
            });
            prompt.onDidHide(() => {
                if (!isResolving) {
                    resolve(false);
                }
                this.filePickBox.show();
                this.hidden = false;
                this.filePickBox.items = this.filePickBox.items;
                prompt.dispose();
            });
            prompt.onDidChangeValue(() => {
                prompt.hide();
            });
            prompt.onDidCustom(() => {
                prompt.hide();
            });
            prompt.show();
        });
    }
    async validate(uri) {
        if (uri === undefined) {
            this.filePickBox.validationMessage = nls.localize('remoteFileDialog.invalidPath', 'Please enter a valid path.');
            return Promise.resolve(false);
        }
        let stat;
        let statDirname;
        try {
            statDirname = await this.fileService.stat(resources.dirname(uri));
            stat = await this.fileService.stat(uri);
        }
        catch (e) {
            // do nothing
        }
        if (this.requiresTrailing) { // save
            if (stat && stat.isDirectory) {
                // Can't do this
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFolder', 'The folder already exists. Please use a new file name.');
                return Promise.resolve(false);
            }
            else if (stat) {
                // Replacing a file.
                // Show a yes/no prompt
                const message = nls.localize('remoteFileDialog.validateExisting', '{0} already exists. Are you sure you want to overwrite it?', resources.basename(uri));
                return this.yesNoPrompt(uri, message);
            }
            else if (!(isValidBasename(resources.basename(uri), this.isWindows))) {
                // Filename not allowed
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateBadFilename', 'Please enter a valid file name.');
                return Promise.resolve(false);
            }
            else if (!statDirname) {
                // Folder to save in doesn't exist
                const message = nls.localize('remoteFileDialog.validateCreateDirectory', 'The folder {0} does not exist. Would you like to create it?', resources.basename(resources.dirname(uri)));
                return this.yesNoPrompt(uri, message);
            }
            else if (!statDirname.isDirectory) {
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateNonexistentDir', 'Please enter a path that exists.');
                return Promise.resolve(false);
            }
        }
        else { // open
            if (!stat) {
                // File or folder doesn't exist
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateNonexistentDir', 'Please enter a path that exists.');
                return Promise.resolve(false);
            }
            else if (uri.path === '/' && this.isWindows) {
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.windowsDriveLetter', 'Please start the path with a drive letter.');
                return Promise.resolve(false);
            }
            else if (stat.isDirectory && !this.allowFolderSelection) {
                // Folder selected when folder selection not permitted
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFileOnly', 'Please select a file.');
                return Promise.resolve(false);
            }
            else if (!stat.isDirectory && !this.allowFileSelection) {
                // File selected when file selection not permitted
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFolderOnly', 'Please select a folder.');
                return Promise.resolve(false);
            }
        }
        return Promise.resolve(true);
    }
    // Returns true if there is a file at the end of the URI.
    async updateItems(newFolder, force = false, trailing) {
        this.busy = true;
        this.autoCompletePathSegment = '';
        const isSave = !!trailing;
        let result = false;
        const updatingPromise = createCancelablePromise(async (token) => {
            let folderStat;
            try {
                folderStat = await this.fileService.resolve(newFolder);
                if (!folderStat.isDirectory) {
                    trailing = resources.basename(newFolder);
                    newFolder = resources.dirname(newFolder);
                    folderStat = undefined;
                    result = true;
                }
            }
            catch (e) {
                // The file/directory doesn't exist
            }
            const newValue = trailing ? this.pathAppend(newFolder, trailing) : this.pathFromUri(newFolder, true);
            this.currentFolder = this.endsWithSlash(newFolder.path) ? newFolder : resources.addTrailingPathSeparator(newFolder, this.separator);
            this.userEnteredPathSegment = trailing ? trailing : '';
            return this.createItems(folderStat, this.currentFolder, token).then(items => {
                if (token.isCancellationRequested) {
                    this.busy = false;
                    return false;
                }
                this.filePickBox.items = items;
                this.filePickBox.activeItems = [this.filePickBox.items[0]];
                this.filePickBox.activeItems = [];
                // the user might have continued typing while we were updating. Only update the input box if it doesn't match the directory.
                if (!equalsIgnoreCase(this.filePickBox.value, newValue) && force) {
                    this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
                    this.insertText(newValue, newValue);
                }
                if (force && trailing && isSave) {
                    // Keep the cursor position in front of the save as name.
                    this.filePickBox.valueSelection = [this.filePickBox.value.length - trailing.length, this.filePickBox.value.length - trailing.length];
                }
                else if (!trailing) {
                    // If there is trailing, we don't move the cursor. If there is no trailing, cursor goes at the end.
                    this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                }
                this.busy = false;
                this.updatingPromise = undefined;
                return result;
            });
        });
        if (this.updatingPromise !== undefined) {
            this.updatingPromise.cancel();
        }
        this.updatingPromise = updatingPromise;
        return updatingPromise;
    }
    pathFromUri(uri, endWithSeparator = false) {
        let result = normalizeDriveLetter(uri.fsPath, this.isWindows).replace(/\n/g, '');
        if (this.separator === '/') {
            result = result.replace(/\\/g, this.separator);
        }
        else {
            result = result.replace(/\//g, this.separator);
        }
        if (endWithSeparator && !this.endsWithSlash(result)) {
            result = result + this.separator;
        }
        return result;
    }
    pathAppend(uri, additional) {
        if ((additional === '..') || (additional === '.')) {
            const basePath = this.pathFromUri(uri, true);
            return basePath + additional;
        }
        else {
            return this.pathFromUri(resources.joinPath(uri, additional));
        }
    }
    async checkIsWindowsOS() {
        let isWindowsOS = isWindows;
        const env = await this.getRemoteAgentEnvironment();
        if (env) {
            isWindowsOS = env.os === 1 /* OperatingSystem.Windows */;
        }
        return isWindowsOS;
    }
    endsWithSlash(s) {
        return /[\/\\]$/.test(s);
    }
    basenameWithTrailingSlash(fullPath) {
        const child = this.pathFromUri(fullPath, true);
        const parent = this.pathFromUri(resources.dirname(fullPath), true);
        return child.substring(parent.length);
    }
    async createBackItem(currFolder) {
        const fileRepresentationCurr = this.currentFolder.with({ scheme: Schemas.file, authority: '' });
        const fileRepresentationParent = resources.dirname(fileRepresentationCurr);
        if (!resources.isEqual(fileRepresentationCurr, fileRepresentationParent)) {
            const parentFolder = resources.dirname(currFolder);
            if (await this.fileService.exists(parentFolder)) {
                return { label: '..', uri: resources.addTrailingPathSeparator(parentFolder, this.separator), isFolder: true };
            }
        }
        return undefined;
    }
    async createItems(folder, currentFolder, token) {
        const result = [];
        const backDir = await this.createBackItem(currentFolder);
        try {
            if (!folder) {
                folder = await this.fileService.resolve(currentFolder);
            }
            const items = folder.children ? await Promise.all(folder.children.map(child => this.createItem(child, currentFolder, token))) : [];
            for (const item of items) {
                if (item) {
                    result.push(item);
                }
            }
        }
        catch (e) {
            // ignore
            console.log(e);
        }
        if (token.isCancellationRequested) {
            return [];
        }
        const sorted = result.sort((i1, i2) => {
            if (i1.isFolder !== i2.isFolder) {
                return i1.isFolder ? -1 : 1;
            }
            const trimmed1 = this.endsWithSlash(i1.label) ? i1.label.substr(0, i1.label.length - 1) : i1.label;
            const trimmed2 = this.endsWithSlash(i2.label) ? i2.label.substr(0, i2.label.length - 1) : i2.label;
            return trimmed1.localeCompare(trimmed2);
        });
        if (backDir) {
            sorted.unshift(backDir);
        }
        return sorted;
    }
    filterFile(file) {
        if (this.options.filters) {
            const ext = resources.extname(file);
            for (let i = 0; i < this.options.filters.length; i++) {
                for (let j = 0; j < this.options.filters[i].extensions.length; j++) {
                    const testExt = this.options.filters[i].extensions[j];
                    if ((testExt === '*') || (ext === ('.' + testExt))) {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }
    async createItem(stat, parent, token) {
        if (token.isCancellationRequested) {
            return undefined;
        }
        let fullPath = resources.joinPath(parent, stat.name);
        if (stat.isDirectory) {
            const filename = resources.basename(fullPath);
            fullPath = resources.addTrailingPathSeparator(fullPath, this.separator);
            return { label: filename, uri: fullPath, isFolder: true, iconClasses: getIconClasses(this.modelService, this.languageService, fullPath || undefined, FileKind.FOLDER) };
        }
        else if (!stat.isDirectory && this.allowFileSelection && this.filterFile(fullPath)) {
            return { label: stat.name, uri: fullPath, isFolder: false, iconClasses: getIconClasses(this.modelService, this.languageService, fullPath || undefined) };
        }
        return undefined;
    }
};
SimpleFileDialog = __decorate([
    __param(0, IFileService),
    __param(1, IQuickInputService),
    __param(2, ILabelService),
    __param(3, IWorkspaceContextService),
    __param(4, INotificationService),
    __param(5, IFileDialogService),
    __param(6, IModelService),
    __param(7, ILanguageService),
    __param(8, IWorkbenchEnvironmentService),
    __param(9, IRemoteAgentService),
    __param(10, IPathService),
    __param(11, IKeybindingService),
    __param(12, IContextKeyService),
    __param(13, IAccessibilityService)
], SimpleFileDialog);
export { SimpleFileDialog };
