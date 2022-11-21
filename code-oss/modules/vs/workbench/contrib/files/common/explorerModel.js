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
import { URI } from 'vs/base/common/uri';
import { isEqual } from 'vs/base/common/extpath';
import { posix } from 'vs/base/common/path';
import { ResourceMap } from 'vs/base/common/map';
import { rtrim, startsWithIgnoreCase, equalsIgnoreCase } from 'vs/base/common/strings';
import { coalesce } from 'vs/base/common/arrays';
import { dispose } from 'vs/base/common/lifecycle';
import { memoize } from 'vs/base/common/decorators';
import { Emitter } from 'vs/base/common/event';
import { joinPath, isEqualOrParent, basenameOrAuthority } from 'vs/base/common/resources';
import { ExplorerFileNestingTrie } from 'vs/workbench/contrib/files/common/explorerFileNestingTrie';
import { assertIsDefined } from 'vs/base/common/types';
export class ExplorerModel {
    contextService;
    uriIdentityService;
    _roots;
    _listener;
    _onDidChangeRoots = new Emitter();
    constructor(contextService, uriIdentityService, fileService, configService) {
        this.contextService = contextService;
        this.uriIdentityService = uriIdentityService;
        const setRoots = () => this._roots = this.contextService.getWorkspace().folders
            .map(folder => new ExplorerItem(folder.uri, fileService, configService, undefined, true, false, false, folder.name));
        setRoots();
        this._listener = this.contextService.onDidChangeWorkspaceFolders(() => {
            setRoots();
            this._onDidChangeRoots.fire();
        });
    }
    get roots() {
        return this._roots;
    }
    get onDidChangeRoots() {
        return this._onDidChangeRoots.event;
    }
    /**
     * Returns an array of child stat from this stat that matches with the provided path.
     * Starts matching from the first root.
     * Will return empty array in case the FileStat does not exist.
     */
    findAll(resource) {
        return coalesce(this.roots.map(root => root.find(resource)));
    }
    /**
     * Returns a FileStat that matches the passed resource.
     * In case multiple FileStat are matching the resource (same folder opened multiple times) returns the FileStat that has the closest root.
     * Will return undefined in case the FileStat does not exist.
     */
    findClosest(resource) {
        const folder = this.contextService.getWorkspaceFolder(resource);
        if (folder) {
            const root = this.roots.find(r => this.uriIdentityService.extUri.isEqual(r.resource, folder.uri));
            if (root) {
                return root.find(resource);
            }
        }
        return null;
    }
    dispose() {
        dispose(this._listener);
    }
}
export class ExplorerItem {
    resource;
    fileService;
    configService;
    _parent;
    _isDirectory;
    _isSymbolicLink;
    _readonly;
    _name;
    _mtime;
    _unknown;
    _isDirectoryResolved; // used in tests
    isError = false;
    _isExcluded = false;
    nestedParent;
    nestedChildren;
    constructor(resource, fileService, configService, _parent, _isDirectory, _isSymbolicLink, _readonly, _name = basenameOrAuthority(resource), _mtime, _unknown = false) {
        this.resource = resource;
        this.fileService = fileService;
        this.configService = configService;
        this._parent = _parent;
        this._isDirectory = _isDirectory;
        this._isSymbolicLink = _isSymbolicLink;
        this._readonly = _readonly;
        this._name = _name;
        this._mtime = _mtime;
        this._unknown = _unknown;
        this._isDirectoryResolved = false;
    }
    get isExcluded() {
        if (this._isExcluded) {
            return true;
        }
        if (!this._parent) {
            return false;
        }
        return this._parent.isExcluded;
    }
    set isExcluded(value) {
        this._isExcluded = value;
    }
    hasChildren(filter) {
        if (this.hasNests) {
            return this.nestedChildren?.some(c => filter(c)) ?? false;
        }
        else {
            return this.isDirectory;
        }
    }
    get hasNests() {
        return !!(this.nestedChildren?.length);
    }
    get isDirectoryResolved() {
        return this._isDirectoryResolved;
    }
    get isSymbolicLink() {
        return !!this._isSymbolicLink;
    }
    get isDirectory() {
        return !!this._isDirectory;
    }
    get isReadonly() {
        return this._readonly || this.fileService.hasCapability(this.resource, 2048 /* FileSystemProviderCapabilities.Readonly */);
    }
    get mtime() {
        return this._mtime;
    }
    get name() {
        return this._name;
    }
    get isUnknown() {
        return this._unknown;
    }
    get parent() {
        return this._parent;
    }
    get root() {
        if (!this._parent) {
            return this;
        }
        return this._parent.root;
    }
    get children() {
        return new Map();
    }
    updateName(value) {
        // Re-add to parent since the parent has a name map to children and the name might have changed
        this._parent?.removeChild(this);
        this._name = value;
        this._parent?.addChild(this);
    }
    getId() {
        return this.root.resource.toString() + '::' + this.resource.toString();
    }
    toString() {
        return `ExplorerItem: ${this.name}`;
    }
    get isRoot() {
        return this === this.root;
    }
    static create(fileService, configService, raw, parent, resolveTo) {
        const stat = new ExplorerItem(raw.resource, fileService, configService, parent, raw.isDirectory, raw.isSymbolicLink, raw.readonly, raw.name, raw.mtime, !raw.isFile && !raw.isDirectory);
        // Recursively add children if present
        if (stat.isDirectory) {
            // isDirectoryResolved is a very important indicator in the stat model that tells if the folder was fully resolved
            // the folder is fully resolved if either it has a list of children or the client requested this by using the resolveTo
            // array of resource path to resolve.
            stat._isDirectoryResolved = !!raw.children || (!!resolveTo && resolveTo.some((r) => {
                return isEqualOrParent(r, stat.resource);
            }));
            // Recurse into children
            if (raw.children) {
                for (let i = 0, len = raw.children.length; i < len; i++) {
                    const child = ExplorerItem.create(fileService, configService, raw.children[i], stat, resolveTo);
                    stat.addChild(child);
                }
            }
        }
        return stat;
    }
    /**
     * Merges the stat which was resolved from the disk with the local stat by copying over properties
     * and children. The merge will only consider resolved stat elements to avoid overwriting data which
     * exists locally.
     */
    static mergeLocalWithDisk(disk, local) {
        if (disk.resource.toString() !== local.resource.toString()) {
            return; // Merging only supported for stats with the same resource
        }
        // Stop merging when a folder is not resolved to avoid loosing local data
        const mergingDirectories = disk.isDirectory || local.isDirectory;
        if (mergingDirectories && local._isDirectoryResolved && !disk._isDirectoryResolved) {
            return;
        }
        // Properties
        local.resource = disk.resource;
        if (!local.isRoot) {
            local.updateName(disk.name);
        }
        local._isDirectory = disk.isDirectory;
        local._mtime = disk.mtime;
        local._isDirectoryResolved = disk._isDirectoryResolved;
        local._isSymbolicLink = disk.isSymbolicLink;
        local.isError = disk.isError;
        // Merge Children if resolved
        if (mergingDirectories && disk._isDirectoryResolved) {
            // Map resource => stat
            const oldLocalChildren = new ResourceMap();
            local.children.forEach(child => {
                oldLocalChildren.set(child.resource, child);
            });
            // Clear current children
            local.children.clear();
            // Merge received children
            disk.children.forEach(diskChild => {
                const formerLocalChild = oldLocalChildren.get(diskChild.resource);
                // Existing child: merge
                if (formerLocalChild) {
                    ExplorerItem.mergeLocalWithDisk(diskChild, formerLocalChild);
                    local.addChild(formerLocalChild);
                    oldLocalChildren.delete(diskChild.resource);
                }
                // New child: add
                else {
                    local.addChild(diskChild);
                }
            });
            oldLocalChildren.forEach(oldChild => {
                if (oldChild instanceof NewExplorerItem) {
                    local.addChild(oldChild);
                }
            });
        }
    }
    /**
     * Adds a child element to this folder.
     */
    addChild(child) {
        // Inherit some parent properties to child
        child._parent = this;
        child.updateResource(false);
        this.children.set(this.getPlatformAwareName(child.name), child);
    }
    getChild(name) {
        return this.children.get(this.getPlatformAwareName(name));
    }
    fetchChildren(sortOrder) {
        const nestingConfig = this.configService.getValue({ resource: this.root.resource }).explorer.fileNesting;
        // fast path when the children can be resolved sync
        if (nestingConfig.enabled && this.nestedChildren) {
            return this.nestedChildren;
        }
        return (async () => {
            if (!this._isDirectoryResolved) {
                // Resolve metadata only when the mtime is needed since this can be expensive
                // Mtime is only used when the sort order is 'modified'
                const resolveMetadata = sortOrder === "modified" /* SortOrder.Modified */;
                this.isError = false;
                try {
                    const stat = await this.fileService.resolve(this.resource, { resolveSingleChildDescendants: true, resolveMetadata });
                    const resolved = ExplorerItem.create(this.fileService, this.configService, stat, this);
                    ExplorerItem.mergeLocalWithDisk(resolved, this);
                }
                catch (e) {
                    this.isError = true;
                    throw e;
                }
                this._isDirectoryResolved = true;
            }
            const items = [];
            if (nestingConfig.enabled) {
                const fileChildren = [];
                const dirChildren = [];
                for (const child of this.children.entries()) {
                    child[1].nestedParent = undefined;
                    if (child[1].isDirectory) {
                        dirChildren.push(child);
                    }
                    else {
                        fileChildren.push(child);
                    }
                }
                const nested = this.fileNester.nest(fileChildren.map(([name]) => name), this.getPlatformAwareName(this.name));
                for (const [fileEntryName, fileEntryItem] of fileChildren) {
                    const nestedItems = nested.get(fileEntryName);
                    if (nestedItems !== undefined) {
                        fileEntryItem.nestedChildren = [];
                        for (const name of nestedItems.keys()) {
                            const child = assertIsDefined(this.children.get(name));
                            fileEntryItem.nestedChildren.push(child);
                            child.nestedParent = fileEntryItem;
                        }
                        items.push(fileEntryItem);
                    }
                    else {
                        fileEntryItem.nestedChildren = undefined;
                    }
                }
                for (const [_, dirEntryItem] of dirChildren.values()) {
                    items.push(dirEntryItem);
                }
            }
            else {
                this.children.forEach(child => {
                    items.push(child);
                });
            }
            return items;
        })();
    }
    _fileNester;
    get fileNester() {
        if (!this.root._fileNester) {
            const nestingConfig = this.configService.getValue({ resource: this.root.resource }).explorer.fileNesting;
            const patterns = Object.entries(nestingConfig.patterns)
                .filter(entry => typeof (entry[0]) === 'string' && typeof (entry[1]) === 'string' && entry[0] && entry[1])
                .map(([parentPattern, childrenPatterns]) => [
                this.getPlatformAwareName(parentPattern.trim()),
                childrenPatterns.split(',').map(p => this.getPlatformAwareName(p.trim().replace(/\u200b/g, '')))
            ]);
            this.root._fileNester = new ExplorerFileNestingTrie(patterns);
        }
        return this.root._fileNester;
    }
    /**
     * Removes a child element from this folder.
     */
    removeChild(child) {
        this.nestedChildren = undefined;
        this.children.delete(this.getPlatformAwareName(child.name));
    }
    forgetChildren() {
        this.children.clear();
        this.nestedChildren = undefined;
        this._isDirectoryResolved = false;
        this._fileNester = undefined;
    }
    getPlatformAwareName(name) {
        return this.fileService.hasCapability(this.resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */) ? name : name.toLowerCase();
    }
    /**
     * Moves this element under a new parent element.
     */
    move(newParent) {
        this.nestedParent?.removeChild(this);
        this._parent?.removeChild(this);
        newParent.removeChild(this); // make sure to remove any previous version of the file if any
        newParent.addChild(this);
        this.updateResource(true);
    }
    updateResource(recursive) {
        if (this._parent) {
            this.resource = joinPath(this._parent.resource, this.name);
        }
        if (recursive) {
            if (this.isDirectory) {
                this.children.forEach(child => {
                    child.updateResource(true);
                });
            }
        }
    }
    /**
     * Tells this stat that it was renamed. This requires changes to all children of this stat (if any)
     * so that the path property can be updated properly.
     */
    rename(renamedStat) {
        // Merge a subset of Properties that can change on rename
        this.updateName(renamedStat.name);
        this._mtime = renamedStat.mtime;
        // Update Paths including children
        this.updateResource(true);
    }
    /**
     * Returns a child stat from this stat that matches with the provided path.
     * Will return "null" in case the child does not exist.
     */
    find(resource) {
        // Return if path found
        // For performance reasons try to do the comparison as fast as possible
        const ignoreCase = !this.fileService.hasCapability(resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
        if (resource && this.resource.scheme === resource.scheme && equalsIgnoreCase(this.resource.authority, resource.authority) &&
            (ignoreCase ? startsWithIgnoreCase(resource.path, this.resource.path) : resource.path.startsWith(this.resource.path))) {
            return this.findByPath(rtrim(resource.path, posix.sep), this.resource.path.length, ignoreCase);
        }
        return null; //Unable to find
    }
    findByPath(path, index, ignoreCase) {
        if (isEqual(rtrim(this.resource.path, posix.sep), path, ignoreCase)) {
            return this;
        }
        if (this.isDirectory) {
            // Ignore separtor to more easily deduct the next name to search
            while (index < path.length && path[index] === posix.sep) {
                index++;
            }
            let indexOfNextSep = path.indexOf(posix.sep, index);
            if (indexOfNextSep === -1) {
                // If there is no separator take the remainder of the path
                indexOfNextSep = path.length;
            }
            // The name to search is between two separators
            const name = path.substring(index, indexOfNextSep);
            const child = this.children.get(this.getPlatformAwareName(name));
            if (child) {
                // We found a child with the given name, search inside it
                return child.findByPath(path, indexOfNextSep, ignoreCase);
            }
        }
        return null;
    }
}
__decorate([
    memoize
], ExplorerItem.prototype, "children", null);
export class NewExplorerItem extends ExplorerItem {
    constructor(fileService, configService, parent, isDirectory) {
        super(URI.file(''), fileService, configService, parent, isDirectory);
        this._isDirectoryResolved = true;
    }
}
