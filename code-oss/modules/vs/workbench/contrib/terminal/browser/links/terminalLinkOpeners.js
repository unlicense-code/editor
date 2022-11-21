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
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { osPathModule, updateLinkWithRelativeCwd } from 'vs/workbench/contrib/terminal/browser/links/terminalLinkHelpers';
import { getLocalLinkRegex, lineAndColumnClause, lineAndColumnClauseGroupCount, unixLineAndColumnMatchIndex, winLineAndColumnMatchIndex } from 'vs/workbench/contrib/terminal/browser/links/terminalLocalLinkDetector';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { QueryBuilder } from 'vs/workbench/services/search/common/queryBuilder';
import { ISearchService } from 'vs/workbench/services/search/common/search';
import { basename } from 'vs/base/common/path';
let TerminalLocalFileLinkOpener = class TerminalLocalFileLinkOpener {
    _os;
    _editorService;
    constructor(_os, _editorService) {
        this._os = _os;
        this._editorService = _editorService;
    }
    async open(link) {
        if (!link.uri) {
            throw new Error('Tried to open file link without a resolved URI');
        }
        const lineColumnInfo = this.extractLineColumnInfo(link.text, link.uri);
        const selection = {
            startLineNumber: lineColumnInfo.lineNumber,
            startColumn: lineColumnInfo.columnNumber
        };
        await this._editorService.openEditor({
            resource: link.uri,
            options: { pinned: true, selection, revealIfOpened: true }
        });
    }
    /**
     * Returns line and column number of URl if that is present, otherwise line 1 column 1.
     *
     * @param link Url link which may contain line and column number.
     */
    extractLineColumnInfo(link, uri) {
        const lineColumnInfo = {
            lineNumber: 1,
            columnNumber: 1
        };
        // Calculate the file name end using the URI if possible, this will help with sanitizing the
        // link for the match regex. The actual path isn't important in extracting the line and
        // column from the regex so modifying the link text before the file name is safe.
        const fileName = basename(uri.path);
        const index = link.indexOf(fileName);
        const fileNameEndIndex = index !== -1 ? index + fileName.length : link.length;
        // Sanitize the link text such that the folders and file name do not contain whitespace.
        let sanitizedLink = link.slice(0, fileNameEndIndex).replace(/\s/g, '_') + link.slice(fileNameEndIndex);
        // Remove / suffixes from Windows paths such that the windows link regex works
        // (eg. /c:/file -> c:/file)
        if (this._os === 1 /* OperatingSystem.Windows */ && sanitizedLink.match(/^\/[a-z]:\//i)) {
            sanitizedLink = sanitizedLink.slice(1);
        }
        // The local link regex only works for non file:// links, check these for a simple
        // `:line:col` suffix
        if (sanitizedLink.startsWith('file://')) {
            const simpleMatches = sanitizedLink.match(/:(\d+)(:(\d+))?$/);
            if (simpleMatches) {
                if (simpleMatches[1] !== undefined) {
                    lineColumnInfo.lineNumber = parseInt(simpleMatches[1]);
                }
                if (simpleMatches[3] !== undefined) {
                    lineColumnInfo.columnNumber = parseInt(simpleMatches[3]);
                }
            }
            return lineColumnInfo;
        }
        const matches = getLocalLinkRegex(this._os).exec(sanitizedLink);
        if (!matches) {
            return lineColumnInfo;
        }
        const lineAndColumnMatchIndex = this._os === 1 /* OperatingSystem.Windows */ ? winLineAndColumnMatchIndex : unixLineAndColumnMatchIndex;
        for (let i = 0; i < lineAndColumnClause.length; i++) {
            const lineMatchIndex = lineAndColumnMatchIndex + (lineAndColumnClauseGroupCount * i);
            const rowNumber = matches[lineMatchIndex];
            if (rowNumber) {
                lineColumnInfo['lineNumber'] = parseInt(rowNumber, 10);
                // Check if column number exists
                const columnNumber = matches[lineMatchIndex + 2];
                if (columnNumber) {
                    lineColumnInfo['columnNumber'] = parseInt(columnNumber, 10);
                }
                break;
            }
        }
        return lineColumnInfo;
    }
};
TerminalLocalFileLinkOpener = __decorate([
    __param(1, IEditorService)
], TerminalLocalFileLinkOpener);
export { TerminalLocalFileLinkOpener };
let TerminalLocalFolderInWorkspaceLinkOpener = class TerminalLocalFolderInWorkspaceLinkOpener {
    _commandService;
    constructor(_commandService) {
        this._commandService = _commandService;
    }
    async open(link) {
        if (!link.uri) {
            throw new Error('Tried to open folder in workspace link without a resolved URI');
        }
        await this._commandService.executeCommand('revealInExplorer', link.uri);
    }
};
TerminalLocalFolderInWorkspaceLinkOpener = __decorate([
    __param(0, ICommandService)
], TerminalLocalFolderInWorkspaceLinkOpener);
export { TerminalLocalFolderInWorkspaceLinkOpener };
let TerminalLocalFolderOutsideWorkspaceLinkOpener = class TerminalLocalFolderOutsideWorkspaceLinkOpener {
    _hostService;
    constructor(_hostService) {
        this._hostService = _hostService;
    }
    async open(link) {
        if (!link.uri) {
            throw new Error('Tried to open folder in workspace link without a resolved URI');
        }
        this._hostService.openWindow([{ folderUri: link.uri }], { forceNewWindow: true });
    }
};
TerminalLocalFolderOutsideWorkspaceLinkOpener = __decorate([
    __param(0, IHostService)
], TerminalLocalFolderOutsideWorkspaceLinkOpener);
export { TerminalLocalFolderOutsideWorkspaceLinkOpener };
let TerminalSearchLinkOpener = class TerminalSearchLinkOpener {
    _capabilities;
    _initialCwd;
    _localFileOpener;
    _localFolderInWorkspaceOpener;
    _os;
    _fileService;
    _instantiationService;
    _quickInputService;
    _searchService;
    _workspaceContextService;
    _workbenchEnvironmentService;
    _fileQueryBuilder = this._instantiationService.createInstance(QueryBuilder);
    constructor(_capabilities, _initialCwd, _localFileOpener, _localFolderInWorkspaceOpener, _os, _fileService, _instantiationService, _quickInputService, _searchService, _workspaceContextService, _workbenchEnvironmentService) {
        this._capabilities = _capabilities;
        this._initialCwd = _initialCwd;
        this._localFileOpener = _localFileOpener;
        this._localFolderInWorkspaceOpener = _localFolderInWorkspaceOpener;
        this._os = _os;
        this._fileService = _fileService;
        this._instantiationService = _instantiationService;
        this._quickInputService = _quickInputService;
        this._searchService = _searchService;
        this._workspaceContextService = _workspaceContextService;
        this._workbenchEnvironmentService = _workbenchEnvironmentService;
    }
    async open(link) {
        const pathSeparator = osPathModule(this._os).sep;
        // Remove file:/// and any leading ./ or ../ since quick access doesn't understand that format
        let text = link.text.replace(/^file:\/\/\/?/, '');
        text = osPathModule(this._os).normalize(text).replace(/^(\.+[\\/])+/, '');
        // Remove `:in` from the end which is how Ruby outputs stack traces
        text = text.replace(/:in$/, '');
        // If any of the names of the folders in the workspace matches
        // a prefix of the link, remove that prefix and continue
        this._workspaceContextService.getWorkspace().folders.forEach((folder) => {
            if (text.substring(0, folder.name.length + 1) === folder.name + pathSeparator) {
                text = text.substring(folder.name.length + 1);
                return;
            }
        });
        let cwdResolvedText = text;
        if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            cwdResolvedText = updateLinkWithRelativeCwd(this._capabilities, link.bufferRange.start.y, text, pathSeparator) || text;
        }
        // Try open the cwd resolved link first
        if (await this._tryOpenExactLink(cwdResolvedText, link)) {
            return;
        }
        // If the cwd resolved text didn't match, try find the link without the cwd resolved, for
        // example when a command prints paths in a sub-directory of the current cwd
        if (text !== cwdResolvedText) {
            if (await this._tryOpenExactLink(text, link)) {
                return;
            }
        }
        // Fallback to searching quick access
        return this._quickInputService.quickAccess.show(text);
    }
    async _getExactMatch(sanitizedLink) {
        // Make the link relative to the cwd if it isn't absolute
        const pathModule = osPathModule(this._os);
        const isAbsolute = pathModule.isAbsolute(sanitizedLink);
        let absolutePath = isAbsolute ? sanitizedLink : undefined;
        const initialCwd = await this._initialCwd;
        if (!isAbsolute && initialCwd.length > 0) {
            absolutePath = pathModule.join(initialCwd, sanitizedLink);
        }
        // Try open as an absolute link
        let resourceMatch;
        if (absolutePath) {
            let normalizedAbsolutePath = absolutePath;
            if (this._os === 1 /* OperatingSystem.Windows */) {
                normalizedAbsolutePath = absolutePath.replace(/\\/g, '/');
                if (normalizedAbsolutePath.match(/[a-z]:/i)) {
                    normalizedAbsolutePath = `/${normalizedAbsolutePath}`;
                }
            }
            let uri;
            if (this._workbenchEnvironmentService.remoteAuthority) {
                uri = URI.from({
                    scheme: Schemas.vscodeRemote,
                    authority: this._workbenchEnvironmentService.remoteAuthority,
                    path: normalizedAbsolutePath
                });
            }
            else {
                uri = URI.file(normalizedAbsolutePath);
            }
            try {
                const fileStat = await this._fileService.stat(uri);
                resourceMatch = { uri, isDirectory: fileStat.isDirectory };
            }
            catch {
                // File or dir doesn't exist, continue on
            }
        }
        // Search the workspace if an exact match based on the absolute path was not found
        if (!resourceMatch) {
            const results = await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
                filePattern: sanitizedLink,
                maxResults: 2
            }));
            if (results.results.length > 0) {
                if (results.results.length === 1) {
                    // If there's exactly 1 search result, return it regardless of whether it's
                    // exact or partial.
                    resourceMatch = { uri: results.results[0].resource };
                }
                else if (!isAbsolute) {
                    // For non-absolute links, exact link matching is allowed only if there is a single an exact
                    // file match. For example searching for `foo.txt` when there is no cwd information
                    // available (ie. only the initial cwd) should open the file directly only if there is a
                    // single file names `foo.txt` anywhere within the folder. These same rules apply to
                    // relative paths with folders such as `src/foo.txt`.
                    const results = await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
                        filePattern: `**/${sanitizedLink}`
                    }));
                    // Find an exact match if it exists
                    const exactMatches = results.results.filter(e => e.resource.toString().endsWith(sanitizedLink));
                    if (exactMatches.length === 1) {
                        resourceMatch = { uri: exactMatches[0].resource };
                    }
                }
            }
        }
        return resourceMatch;
    }
    async _tryOpenExactLink(text, link) {
        const sanitizedLink = text.replace(/:\d+(:\d+)?$/, '');
        try {
            const result = await this._getExactMatch(sanitizedLink);
            if (result) {
                const { uri, isDirectory } = result;
                const linkToOpen = {
                    // Use the absolute URI's path here so the optional line/col get detected
                    text: result.uri.path + (text.match(/:\d+(:\d+)?$/)?.[0] || ''),
                    uri,
                    bufferRange: link.bufferRange,
                    type: link.type
                };
                if (uri) {
                    await (isDirectory ? this._localFolderInWorkspaceOpener.open(linkToOpen) : this._localFileOpener.open(linkToOpen));
                    return true;
                }
            }
        }
        catch {
            return false;
        }
        return false;
    }
};
TerminalSearchLinkOpener = __decorate([
    __param(5, IFileService),
    __param(6, IInstantiationService),
    __param(7, IQuickInputService),
    __param(8, ISearchService),
    __param(9, IWorkspaceContextService),
    __param(10, IWorkbenchEnvironmentService)
], TerminalSearchLinkOpener);
export { TerminalSearchLinkOpener };
let TerminalUrlLinkOpener = class TerminalUrlLinkOpener {
    _isRemote;
    _openerService;
    constructor(_isRemote, _openerService) {
        this._isRemote = _isRemote;
        this._openerService = _openerService;
    }
    async open(link) {
        if (!link.uri) {
            throw new Error('Tried to open a url without a resolved URI');
        }
        // It's important to use the raw string value here to avoid converting pre-encoded values
        // from the URL like `%2B` -> `+`.
        this._openerService.open(link.text, {
            allowTunneling: this._isRemote,
            allowContributedOpeners: true,
        });
    }
};
TerminalUrlLinkOpener = __decorate([
    __param(1, IOpenerService)
], TerminalUrlLinkOpener);
export { TerminalUrlLinkOpener };
