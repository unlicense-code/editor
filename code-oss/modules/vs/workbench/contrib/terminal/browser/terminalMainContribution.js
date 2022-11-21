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
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { localize } from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService, terminalEditorId } from 'vs/workbench/contrib/terminal/browser/terminal';
import { terminalStrings } from 'vs/workbench/contrib/terminal/common/terminalStrings';
import { IEditorResolverService, RegisteredEditorPriority } from 'vs/workbench/services/editor/common/editorResolverService';
import { registerLogChannel } from 'vs/workbench/services/output/common/output';
import { join } from 'vs/base/common/path';
/**
 * The main contribution for the terminal contrib. This contains calls to other components necessary
 * to set up the terminal but don't need to be tracked in the long term (where TerminalService would
 * be more relevant).
 */
let TerminalMainContribution = class TerminalMainContribution extends Disposable {
    _fileService;
    _logService;
    constructor(editorResolverService, environmentService, _fileService, labelService, _logService, terminalService, terminalEditorService, terminalGroupService) {
        super();
        this._fileService = _fileService;
        this._logService = _logService;
        // Register terminal editors
        editorResolverService.registerEditor(`${Schemas.vscodeTerminal}:/**`, {
            id: terminalEditorId,
            label: terminalStrings.terminal,
            priority: RegisteredEditorPriority.exclusive
        }, {
            canSupportResource: uri => uri.scheme === Schemas.vscodeTerminal,
            singlePerResource: true
        }, {
            createEditorInput: ({ resource, options }) => {
                const instance = terminalService.getInstanceFromResource(resource);
                if (instance) {
                    const sourceGroup = terminalGroupService.getGroupForInstance(instance);
                    sourceGroup?.removeInstance(instance);
                }
                const resolvedResource = terminalEditorService.resolveResource(instance || resource);
                const editor = terminalEditorService.getInputFromResource(resolvedResource) || { editor: resolvedResource };
                return {
                    editor,
                    options: {
                        ...options,
                        pinned: true,
                        forceReload: true,
                        override: terminalEditorId
                    }
                };
            }
        });
        // Register a resource formatter for terminal URIs
        labelService.registerFormatter({
            scheme: Schemas.vscodeTerminal,
            formatting: {
                label: '${path}',
                separator: ''
            }
        });
        // Register log channel
        this._registerLogChannel('ptyHostLog', localize('ptyHost', "Pty Host"), URI.file(join(environmentService.logsPath, `${"ptyhost" /* TerminalLogConstants.FileName */}.log`)));
    }
    _registerLogChannel(id, label, file) {
        const promise = registerLogChannel(id, label, file, this._fileService, this._logService);
        this._register(toDisposable(() => promise.cancel()));
    }
};
TerminalMainContribution = __decorate([
    __param(0, IEditorResolverService),
    __param(1, IEnvironmentService),
    __param(2, IFileService),
    __param(3, ILabelService),
    __param(4, ILogService),
    __param(5, ITerminalService),
    __param(6, ITerminalEditorService),
    __param(7, ITerminalGroupService)
], TerminalMainContribution);
export { TerminalMainContribution };
