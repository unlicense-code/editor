/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { basename, extname } from 'vs/base/common/path';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { extname as resourceExtname, basenameOrAuthority, joinPath, extUriBiasedIgnorePathCase } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Schemas } from 'vs/base/common/network';
export const IWorkspaceContextService = createDecorator('contextService');
export function isSingleFolderWorkspaceIdentifier(obj) {
    const singleFolderIdentifier = obj;
    return typeof singleFolderIdentifier?.id === 'string' && URI.isUri(singleFolderIdentifier.uri);
}
export const EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = { id: 'ext-dev' };
export function toWorkspaceIdentifier(arg0, isExtensionDevelopment) {
    // Empty workspace
    if (typeof arg0 === 'string' || typeof arg0 === 'undefined') {
        // With a backupPath, the basename is the empty workspace identifier
        if (typeof arg0 === 'string') {
            return {
                id: basename(arg0)
            };
        }
        // Extension development empty windows have backups disabled
        // so we return a constant workspace identifier for extension
        // authors to allow to restore their workspace state even then.
        if (isExtensionDevelopment) {
            return EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE;
        }
        return undefined;
    }
    // Multi root
    const workspace = arg0;
    if (workspace.configuration) {
        return {
            id: workspace.id,
            configPath: workspace.configuration
        };
    }
    // Single folder
    if (workspace.folders.length === 1) {
        return {
            id: workspace.id,
            uri: workspace.folders[0].uri
        };
    }
    return undefined;
}
export function isWorkspaceIdentifier(obj) {
    const workspaceIdentifier = obj;
    return typeof workspaceIdentifier?.id === 'string' && URI.isUri(workspaceIdentifier.configPath);
}
export function reviveIdentifier(identifier) {
    // Single Folder
    const singleFolderIdentifierCandidate = identifier;
    if (singleFolderIdentifierCandidate?.uri) {
        return { id: singleFolderIdentifierCandidate.id, uri: URI.revive(singleFolderIdentifierCandidate.uri) };
    }
    // Multi folder
    const workspaceIdentifierCandidate = identifier;
    if (workspaceIdentifierCandidate?.configPath) {
        return { id: workspaceIdentifierCandidate.id, configPath: URI.revive(workspaceIdentifierCandidate.configPath) };
    }
    // Empty
    if (identifier?.id) {
        return { id: identifier.id };
    }
    return undefined;
}
export var WorkbenchState;
(function (WorkbenchState) {
    WorkbenchState[WorkbenchState["EMPTY"] = 1] = "EMPTY";
    WorkbenchState[WorkbenchState["FOLDER"] = 2] = "FOLDER";
    WorkbenchState[WorkbenchState["WORKSPACE"] = 3] = "WORKSPACE";
})(WorkbenchState || (WorkbenchState = {}));
export function isWorkspace(thing) {
    const candidate = thing;
    return !!(candidate && typeof candidate === 'object'
        && typeof candidate.id === 'string'
        && Array.isArray(candidate.folders));
}
export function isWorkspaceFolder(thing) {
    const candidate = thing;
    return !!(candidate && typeof candidate === 'object'
        && URI.isUri(candidate.uri)
        && typeof candidate.name === 'string'
        && typeof candidate.toResource === 'function');
}
export class Workspace {
    _id;
    _transient;
    _configuration;
    _ignorePathCasing;
    _foldersMap = TernarySearchTree.forUris(this._ignorePathCasing, () => true);
    _folders;
    constructor(_id, folders, _transient, _configuration, _ignorePathCasing) {
        this._id = _id;
        this._transient = _transient;
        this._configuration = _configuration;
        this._ignorePathCasing = _ignorePathCasing;
        this.folders = folders;
    }
    update(workspace) {
        this._id = workspace.id;
        this._configuration = workspace.configuration;
        this._transient = workspace.transient;
        this._ignorePathCasing = workspace._ignorePathCasing;
        this.folders = workspace.folders;
    }
    get folders() {
        return this._folders;
    }
    set folders(folders) {
        this._folders = folders;
        this.updateFoldersMap();
    }
    get id() {
        return this._id;
    }
    get transient() {
        return this._transient;
    }
    get configuration() {
        return this._configuration;
    }
    set configuration(configuration) {
        this._configuration = configuration;
    }
    getFolder(resource) {
        if (!resource) {
            return null;
        }
        return this._foldersMap.findSubstr(resource) || null;
    }
    updateFoldersMap() {
        this._foldersMap = TernarySearchTree.forUris(this._ignorePathCasing, () => true);
        for (const folder of this.folders) {
            this._foldersMap.set(folder.uri, folder);
        }
    }
    toJSON() {
        return { id: this.id, folders: this.folders, transient: this.transient, configuration: this.configuration };
    }
}
export class WorkspaceFolder {
    raw;
    uri;
    name;
    index;
    constructor(data, 
    /**
     * Provides access to the original metadata for this workspace
     * folder. This can be different from the metadata provided in
     * this class:
     * - raw paths can be relative
     * - raw paths are not normalized
     */
    raw) {
        this.raw = raw;
        this.uri = data.uri;
        this.index = data.index;
        this.name = data.name;
    }
    toResource(relativePath) {
        return joinPath(this.uri, relativePath);
    }
    toJSON() {
        return { uri: this.uri, name: this.name, index: this.index };
    }
}
export function toWorkspaceFolder(resource) {
    return new WorkspaceFolder({ uri: resource, index: 0, name: basenameOrAuthority(resource) }, { uri: resource.toString() });
}
export const WORKSPACE_EXTENSION = 'code-workspace';
export const WORKSPACE_SUFFIX = `.${WORKSPACE_EXTENSION}`;
export const WORKSPACE_FILTER = [{ name: localize('codeWorkspace', "Code Workspace"), extensions: [WORKSPACE_EXTENSION] }];
export const UNTITLED_WORKSPACE_NAME = 'workspace.json';
export function isUntitledWorkspace(path, environmentService) {
    return extUriBiasedIgnorePathCase.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
}
export function isTemporaryWorkspace(arg1) {
    let path;
    if (URI.isUri(arg1)) {
        path = arg1;
    }
    else {
        path = arg1.configuration;
    }
    return path?.scheme === Schemas.tmp;
}
export function isSavedWorkspace(path, environmentService) {
    return !isUntitledWorkspace(path, environmentService) && !isTemporaryWorkspace(path);
}
export function hasWorkspaceFileExtension(path) {
    const ext = (typeof path === 'string') ? extname(path) : resourceExtname(path);
    return ext === WORKSPACE_SUFFIX;
}
