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
import { combinedDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import * as resources from 'vs/base/common/resources';
import { isFalsyOrWhitespace } from 'vs/base/common/strings';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { setSnippetSuggestSupport } from 'vs/editor/contrib/suggest/browser/suggest';
import { localize } from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { SnippetFile } from 'vs/workbench/contrib/snippets/browser/snippetsFile';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { languagesExtPoint } from 'vs/workbench/services/language/common/languageService';
import { SnippetCompletionProvider } from './snippetCompletionProvider';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { ResourceMap } from 'vs/base/common/map';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { isStringArray } from 'vs/base/common/types';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { insertInto } from 'vs/base/common/arrays';
var snippetExt;
(function (snippetExt) {
    function toValidSnippet(extension, snippet, languageService) {
        if (isFalsyOrWhitespace(snippet.path)) {
            extension.collector.error(localize('invalid.path.0', "Expected string in `contributes.{0}.path`. Provided value: {1}", extension.description.name, String(snippet.path)));
            return null;
        }
        if (isFalsyOrWhitespace(snippet.language) && !snippet.path.endsWith('.code-snippets')) {
            extension.collector.error(localize('invalid.language.0', "When omitting the language, the value of `contributes.{0}.path` must be a `.code-snippets`-file. Provided value: {1}", extension.description.name, String(snippet.path)));
            return null;
        }
        if (!isFalsyOrWhitespace(snippet.language) && !languageService.isRegisteredLanguageId(snippet.language)) {
            extension.collector.error(localize('invalid.language', "Unknown language in `contributes.{0}.language`. Provided value: {1}", extension.description.name, String(snippet.language)));
            return null;
        }
        const extensionLocation = extension.description.extensionLocation;
        const snippetLocation = resources.joinPath(extensionLocation, snippet.path);
        if (!resources.isEqualOrParent(snippetLocation, extensionLocation)) {
            extension.collector.error(localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", extension.description.name, snippetLocation.path, extensionLocation.path));
            return null;
        }
        return {
            language: snippet.language,
            location: snippetLocation
        };
    }
    snippetExt.toValidSnippet = toValidSnippet;
    snippetExt.snippetsContribution = {
        description: localize('vscode.extension.contributes.snippets', 'Contributes snippets.'),
        type: 'array',
        defaultSnippets: [{ body: [{ language: '', path: '' }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { language: '${1:id}', path: './snippets/${2:id}.json.' } }],
            properties: {
                language: {
                    description: localize('vscode.extension.contributes.snippets-language', 'Language identifier for which this snippet is contributed to.'),
                    type: 'string'
                },
                path: {
                    description: localize('vscode.extension.contributes.snippets-path', 'Path of the snippets file. The path is relative to the extension folder and typically starts with \'./snippets/\'.'),
                    type: 'string'
                }
            }
        }
    };
    snippetExt.point = ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'snippets',
        deps: [languagesExtPoint],
        jsonSchema: snippetExt.snippetsContribution
    });
})(snippetExt || (snippetExt = {}));
function watch(service, resource, callback) {
    return combinedDisposable(service.watch(resource), service.onDidFilesChange(e => {
        if (e.affects(resource)) {
            callback();
        }
    }));
}
let SnippetEnablement = class SnippetEnablement {
    _storageService;
    static _key = 'snippets.ignoredSnippets';
    _ignored;
    constructor(_storageService) {
        this._storageService = _storageService;
        const raw = _storageService.get(SnippetEnablement._key, 0 /* StorageScope.PROFILE */, '');
        let data;
        try {
            data = JSON.parse(raw);
        }
        catch { }
        this._ignored = isStringArray(data) ? new Set(data) : new Set();
    }
    isIgnored(id) {
        return this._ignored.has(id);
    }
    updateIgnored(id, value) {
        let changed = false;
        if (this._ignored.has(id) && !value) {
            this._ignored.delete(id);
            changed = true;
        }
        else if (!this._ignored.has(id) && value) {
            this._ignored.add(id);
            changed = true;
        }
        if (changed) {
            this._storageService.store(SnippetEnablement._key, JSON.stringify(Array.from(this._ignored)), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    }
};
SnippetEnablement = __decorate([
    __param(0, IStorageService)
], SnippetEnablement);
let SnippetUsageTimestamps = class SnippetUsageTimestamps {
    _storageService;
    static _key = 'snippets.usageTimestamps';
    _usages;
    constructor(_storageService) {
        this._storageService = _storageService;
        const raw = _storageService.get(SnippetUsageTimestamps._key, 0 /* StorageScope.PROFILE */, '');
        let data;
        try {
            data = JSON.parse(raw);
        }
        catch {
            data = [];
        }
        this._usages = Array.isArray(data) ? new Map(data) : new Map();
    }
    getUsageTimestamp(id) {
        return this._usages.get(id);
    }
    updateUsageTimestamp(id) {
        // map uses insertion order, we want most recent at the end
        this._usages.delete(id);
        this._usages.set(id, Date.now());
        // persist last 100 item
        const all = [...this._usages].slice(-100);
        this._storageService.store(SnippetUsageTimestamps._key, JSON.stringify(all), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
    }
};
SnippetUsageTimestamps = __decorate([
    __param(0, IStorageService)
], SnippetUsageTimestamps);
let SnippetsService = class SnippetsService {
    _environmentService;
    _userDataProfileService;
    _contextService;
    _languageService;
    _logService;
    _fileService;
    _textfileService;
    _extensionResourceLoaderService;
    _disposables = new DisposableStore();
    _pendingWork = [];
    _files = new ResourceMap();
    _enablement;
    _usageTimestamps;
    constructor(_environmentService, _userDataProfileService, _contextService, _languageService, _logService, _fileService, _textfileService, _extensionResourceLoaderService, lifecycleService, instantiationService, languageConfigurationService) {
        this._environmentService = _environmentService;
        this._userDataProfileService = _userDataProfileService;
        this._contextService = _contextService;
        this._languageService = _languageService;
        this._logService = _logService;
        this._fileService = _fileService;
        this._textfileService = _textfileService;
        this._extensionResourceLoaderService = _extensionResourceLoaderService;
        this._pendingWork.push(Promise.resolve(lifecycleService.when(3 /* LifecyclePhase.Restored */).then(() => {
            this._initExtensionSnippets();
            this._initUserSnippets();
            this._initWorkspaceSnippets();
        })));
        setSnippetSuggestSupport(new SnippetCompletionProvider(this._languageService, this, languageConfigurationService));
        this._enablement = instantiationService.createInstance(SnippetEnablement);
        this._usageTimestamps = instantiationService.createInstance(SnippetUsageTimestamps);
    }
    dispose() {
        this._disposables.dispose();
    }
    isEnabled(snippet) {
        return !this._enablement.isIgnored(snippet.snippetIdentifier);
    }
    updateEnablement(snippet, enabled) {
        this._enablement.updateIgnored(snippet.snippetIdentifier, !enabled);
    }
    updateUsageTimestamp(snippet) {
        this._usageTimestamps.updateUsageTimestamp(snippet.snippetIdentifier);
    }
    _joinSnippets() {
        const promises = this._pendingWork.slice(0);
        this._pendingWork.length = 0;
        return Promise.all(promises);
    }
    async getSnippetFiles() {
        await this._joinSnippets();
        return this._files.values();
    }
    async getSnippets(languageId, opts) {
        await this._joinSnippets();
        const result = [];
        const promises = [];
        if (languageId) {
            if (this._languageService.isRegisteredLanguageId(languageId)) {
                for (const file of this._files.values()) {
                    promises.push(file.load()
                        .then(file => file.select(languageId, result))
                        .catch(err => this._logService.error(err, file.location.toString())));
                }
            }
        }
        else {
            for (const file of this._files.values()) {
                promises.push(file.load()
                    .then(file => insertInto(result, result.length, file.data))
                    .catch(err => this._logService.error(err, file.location.toString())));
            }
        }
        await Promise.all(promises);
        return this._filterAndSortSnippets(result, opts);
    }
    getSnippetsSync(languageId, opts) {
        const result = [];
        if (this._languageService.isRegisteredLanguageId(languageId)) {
            for (const file of this._files.values()) {
                // kick off loading (which is a noop in case it's already loaded)
                // and optimistically collect snippets
                file.load().catch(_err => { });
                file.select(languageId, result);
            }
        }
        return this._filterAndSortSnippets(result, opts);
    }
    _filterAndSortSnippets(snippets, opts) {
        const result = [];
        for (const snippet of snippets) {
            if (!snippet.prefix && !opts?.includeNoPrefixSnippets) {
                // prefix or no-prefix wanted
                continue;
            }
            if (!this.isEnabled(snippet) && !opts?.includeDisabledSnippets) {
                // enabled or disabled wanted
                continue;
            }
            if (typeof opts?.fileTemplateSnippets === 'boolean' && opts.fileTemplateSnippets !== snippet.isFileTemplate) {
                // isTopLevel requested but mismatching
                continue;
            }
            result.push(snippet);
        }
        return result.sort((a, b) => {
            let result = 0;
            if (!opts?.noRecencySort) {
                const val1 = this._usageTimestamps.getUsageTimestamp(a.snippetIdentifier) ?? -1;
                const val2 = this._usageTimestamps.getUsageTimestamp(b.snippetIdentifier) ?? -1;
                result = val2 - val1;
            }
            if (result === 0) {
                result = this._compareSnippet(a, b);
            }
            return result;
        });
    }
    _compareSnippet(a, b) {
        if (a.snippetSource < b.snippetSource) {
            return -1;
        }
        else if (a.snippetSource > b.snippetSource) {
            return 1;
        }
        else if (a.source < b.source) {
            return -1;
        }
        else if (a.source > b.source) {
            return 1;
        }
        else if (a.name > b.name) {
            return 1;
        }
        else if (a.name < b.name) {
            return -1;
        }
        else {
            return 0;
        }
    }
    // --- loading, watching
    _initExtensionSnippets() {
        snippetExt.point.setHandler(extensions => {
            for (const [key, value] of this._files) {
                if (value.source === 3 /* SnippetSource.Extension */) {
                    this._files.delete(key);
                }
            }
            for (const extension of extensions) {
                for (const contribution of extension.value) {
                    const validContribution = snippetExt.toValidSnippet(extension, contribution, this._languageService);
                    if (!validContribution) {
                        continue;
                    }
                    const file = this._files.get(validContribution.location);
                    if (file) {
                        if (file.defaultScopes) {
                            file.defaultScopes.push(validContribution.language);
                        }
                        else {
                            file.defaultScopes = [];
                        }
                    }
                    else {
                        const file = new SnippetFile(3 /* SnippetSource.Extension */, validContribution.location, validContribution.language ? [validContribution.language] : undefined, extension.description, this._fileService, this._extensionResourceLoaderService);
                        this._files.set(file.location, file);
                        if (this._environmentService.isExtensionDevelopment) {
                            file.load().then(file => {
                                // warn about bad tabstop/variable usage
                                if (file.data.some(snippet => snippet.isBogous)) {
                                    extension.collector.warn(localize('badVariableUse', "One or more snippets from the extension '{0}' very likely confuse snippet-variables and snippet-placeholders (see https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax for more details)", extension.description.name));
                                }
                            }, err => {
                                // generic error
                                extension.collector.warn(localize('badFile', "The snippet file \"{0}\" could not be read.", file.location.toString()));
                            });
                        }
                    }
                }
            }
        });
    }
    _initWorkspaceSnippets() {
        // workspace stuff
        const disposables = new DisposableStore();
        const updateWorkspaceSnippets = () => {
            disposables.clear();
            this._pendingWork.push(this._initWorkspaceFolderSnippets(this._contextService.getWorkspace(), disposables));
        };
        this._disposables.add(disposables);
        this._disposables.add(this._contextService.onDidChangeWorkspaceFolders(updateWorkspaceSnippets));
        this._disposables.add(this._contextService.onDidChangeWorkbenchState(updateWorkspaceSnippets));
        updateWorkspaceSnippets();
    }
    async _initWorkspaceFolderSnippets(workspace, bucket) {
        const promises = workspace.folders.map(async (folder) => {
            const snippetFolder = folder.toResource('.vscode');
            const value = await this._fileService.exists(snippetFolder);
            if (value) {
                this._initFolderSnippets(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
            }
            else {
                // watch
                bucket.add(this._fileService.onDidFilesChange(e => {
                    if (e.contains(snippetFolder, 1 /* FileChangeType.ADDED */)) {
                        this._initFolderSnippets(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
                    }
                }));
            }
        });
        await Promise.all(promises);
    }
    async _initUserSnippets() {
        const disposables = new DisposableStore();
        const updateUserSnippets = async () => {
            disposables.clear();
            const userSnippetsFolder = this._userDataProfileService.currentProfile.snippetsHome;
            await this._fileService.createFolder(userSnippetsFolder);
            await this._initFolderSnippets(1 /* SnippetSource.User */, userSnippetsFolder, disposables);
        };
        this._disposables.add(disposables);
        this._disposables.add(this._userDataProfileService.onDidChangeCurrentProfile(e => e.join((async () => {
            if (e.preserveData) {
                await this._fileService.copy(e.previous.snippetsHome, e.profile.snippetsHome);
            }
            this._pendingWork.push(updateUserSnippets());
        })())));
        await updateUserSnippets();
    }
    _initFolderSnippets(source, folder, bucket) {
        const disposables = new DisposableStore();
        const addFolderSnippets = async () => {
            disposables.clear();
            if (!await this._fileService.exists(folder)) {
                return;
            }
            try {
                const stat = await this._fileService.resolve(folder);
                for (const entry of stat.children || []) {
                    disposables.add(this._addSnippetFile(entry.resource, source));
                }
            }
            catch (err) {
                this._logService.error(`Failed snippets from folder '${folder.toString()}'`, err);
            }
        };
        bucket.add(this._textfileService.files.onDidSave(e => {
            if (resources.isEqualOrParent(e.model.resource, folder)) {
                addFolderSnippets();
            }
        }));
        bucket.add(watch(this._fileService, folder, addFolderSnippets));
        bucket.add(disposables);
        return addFolderSnippets();
    }
    _addSnippetFile(uri, source) {
        const ext = resources.extname(uri);
        if (source === 1 /* SnippetSource.User */ && ext === '.json') {
            const langName = resources.basename(uri).replace(/\.json/, '');
            this._files.set(uri, new SnippetFile(source, uri, [langName], undefined, this._fileService, this._extensionResourceLoaderService));
        }
        else if (ext === '.code-snippets') {
            this._files.set(uri, new SnippetFile(source, uri, undefined, undefined, this._fileService, this._extensionResourceLoaderService));
        }
        return {
            dispose: () => this._files.delete(uri)
        };
    }
};
SnippetsService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IUserDataProfileService),
    __param(2, IWorkspaceContextService),
    __param(3, ILanguageService),
    __param(4, ILogService),
    __param(5, IFileService),
    __param(6, ITextFileService),
    __param(7, IExtensionResourceLoaderService),
    __param(8, ILifecycleService),
    __param(9, IInstantiationService),
    __param(10, ILanguageConfigurationService)
], SnippetsService);
export { SnippetsService };
export function getNonWhitespacePrefix(model, position) {
    /**
     * Do not analyze more characters
     */
    const MAX_PREFIX_LENGTH = 100;
    const line = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
    const minChIndex = Math.max(0, line.length - MAX_PREFIX_LENGTH);
    for (let chIndex = line.length - 1; chIndex >= minChIndex; chIndex--) {
        const ch = line.charAt(chIndex);
        if (/\s/.test(ch)) {
            return line.substr(chIndex + 1);
        }
    }
    if (minChIndex === 0) {
        return line;
    }
    return '';
}
