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
import { URI } from 'vs/base/common/uri';
import { deepClone, equals } from 'vs/base/common/objects';
import { Emitter } from 'vs/base/common/event';
import { relativePath } from 'vs/base/common/resources';
import { Disposable } from 'vs/base/common/lifecycle';
import { parse } from 'vs/base/common/glob';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
let ResourceGlobMatcher = class ResourceGlobMatcher extends Disposable {
    globFn;
    shouldUpdate;
    contextService;
    configurationService;
    static NO_ROOT = null;
    _onExpressionChange = this._register(new Emitter());
    onExpressionChange = this._onExpressionChange.event;
    mapRootToParsedExpression = new Map();
    mapRootToExpressionConfig = new Map();
    constructor(globFn, shouldUpdate, contextService, configurationService) {
        super();
        this.globFn = globFn;
        this.shouldUpdate = shouldUpdate;
        this.contextService = contextService;
        this.configurationService = configurationService;
        this.updateExcludes(false);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (this.shouldUpdate(e)) {
                this.updateExcludes(true);
            }
        }));
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.updateExcludes(true)));
    }
    updateExcludes(fromEvent) {
        let changed = false;
        // Add excludes per workspaces that got added
        this.contextService.getWorkspace().folders.forEach(folder => {
            const rootExcludes = this.globFn(folder.uri);
            if (!this.mapRootToExpressionConfig.has(folder.uri.toString()) || !equals(this.mapRootToExpressionConfig.get(folder.uri.toString()), rootExcludes)) {
                changed = true;
                this.mapRootToParsedExpression.set(folder.uri.toString(), parse(rootExcludes));
                this.mapRootToExpressionConfig.set(folder.uri.toString(), deepClone(rootExcludes));
            }
        });
        // Remove excludes per workspace no longer present
        this.mapRootToExpressionConfig.forEach((value, root) => {
            if (root === ResourceGlobMatcher.NO_ROOT) {
                return; // always keep this one
            }
            if (root && !this.contextService.getWorkspaceFolder(URI.parse(root))) {
                this.mapRootToParsedExpression.delete(root);
                this.mapRootToExpressionConfig.delete(root);
                changed = true;
            }
        });
        // Always set for resources outside root as well
        const globalExcludes = this.globFn();
        if (!this.mapRootToExpressionConfig.has(ResourceGlobMatcher.NO_ROOT) || !equals(this.mapRootToExpressionConfig.get(ResourceGlobMatcher.NO_ROOT), globalExcludes)) {
            changed = true;
            this.mapRootToParsedExpression.set(ResourceGlobMatcher.NO_ROOT, parse(globalExcludes));
            this.mapRootToExpressionConfig.set(ResourceGlobMatcher.NO_ROOT, deepClone(globalExcludes));
        }
        if (fromEvent && changed) {
            this._onExpressionChange.fire();
        }
    }
    matches(resource, hasSibling) {
        const folder = this.contextService.getWorkspaceFolder(resource);
        let expressionForRoot;
        if (folder && this.mapRootToParsedExpression.has(folder.uri.toString())) {
            expressionForRoot = this.mapRootToParsedExpression.get(folder.uri.toString());
        }
        else {
            expressionForRoot = this.mapRootToParsedExpression.get(ResourceGlobMatcher.NO_ROOT);
        }
        // If the resource if from a workspace, convert its absolute path to a relative
        // path so that glob patterns have a higher probability to match. For example
        // a glob pattern of "src/**" will not match on an absolute path "/folder/src/file.txt"
        // but can match on "src/file.txt"
        let resourcePathToMatch;
        if (folder) {
            resourcePathToMatch = relativePath(folder.uri, resource); // always uses forward slashes
        }
        else {
            resourcePathToMatch = resource.fsPath; // TODO@isidor: support non-file URIs
        }
        return !!expressionForRoot && typeof resourcePathToMatch === 'string' && !!expressionForRoot(resourcePathToMatch, undefined, hasSibling);
    }
};
ResourceGlobMatcher = __decorate([
    __param(2, IWorkspaceContextService),
    __param(3, IConfigurationService)
], ResourceGlobMatcher);
export { ResourceGlobMatcher };
