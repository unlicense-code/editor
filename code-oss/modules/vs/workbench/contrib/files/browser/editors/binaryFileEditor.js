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
import { BaseBinaryResourceEditor } from 'vs/workbench/browser/parts/editor/binaryEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { FileEditorInput } from 'vs/workbench/contrib/files/browser/editors/fileEditorInput';
import { BINARY_FILE_EDITOR_ID, BINARY_TEXT_FILE_MODE } from 'vs/workbench/contrib/files/common/files';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditorResolution } from 'vs/platform/editor/common/editor';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { isEditorInputWithOptions } from 'vs/workbench/common/editor';
import { DiffEditorInput } from 'vs/workbench/common/editor/diffEditorInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
/**
 * An implementation of editor for binary files that cannot be displayed.
 */
let BinaryFileEditor = class BinaryFileEditor extends BaseBinaryResourceEditor {
    editorResolverService;
    editorGroupService;
    static ID = BINARY_FILE_EDITOR_ID;
    constructor(telemetryService, themeService, editorResolverService, storageService, instantiationService, editorGroupService) {
        super(BinaryFileEditor.ID, {
            openInternal: (input, options) => this.openInternal(input, options)
        }, telemetryService, themeService, storageService, instantiationService);
        this.editorResolverService = editorResolverService;
        this.editorGroupService = editorGroupService;
    }
    async openInternal(input, options) {
        if (input instanceof FileEditorInput && this.group?.activeEditor) {
            // We operate on the active editor here to support re-opening
            // diff editors where `input` may just be one side of the
            // diff editor.
            // Since `openInternal` can only ever be selected from the
            // active editor of the group, this is a safe assumption.
            // (https://github.com/microsoft/vscode/issues/124222)
            const activeEditor = this.group.activeEditor;
            const untypedActiveEditor = activeEditor?.toUntyped();
            if (!untypedActiveEditor) {
                return; // we need untyped editor support
            }
            // Try to let the user pick an editor
            let resolvedEditor = await this.editorResolverService.resolveEditor({
                ...untypedActiveEditor,
                options: {
                    ...options,
                    override: EditorResolution.PICK
                }
            }, this.group);
            if (resolvedEditor === 2 /* ResolvedStatus.NONE */) {
                resolvedEditor = undefined;
            }
            else if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                return;
            }
            // If the result if a file editor, the user indicated to open
            // the binary file as text. As such we adjust the input for that.
            if (isEditorInputWithOptions(resolvedEditor)) {
                for (const editor of resolvedEditor.editor instanceof DiffEditorInput ? [resolvedEditor.editor.original, resolvedEditor.editor.modified] : [resolvedEditor.editor]) {
                    if (editor instanceof FileEditorInput) {
                        editor.setForceOpenAsText();
                        editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE); // https://github.com/microsoft/vscode/issues/131076
                    }
                }
            }
            // Replace the active editor with the picked one
            await (this.group ?? this.editorGroupService.activeGroup).replaceEditors([{
                    editor: activeEditor,
                    replacement: resolvedEditor?.editor ?? input,
                    options: {
                        ...resolvedEditor?.options ?? options
                    }
                }]);
        }
    }
    getTitle() {
        return this.input ? this.input.getName() : localize('binaryFileEditor', "Binary File Viewer");
    }
};
BinaryFileEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IEditorResolverService),
    __param(3, IStorageService),
    __param(4, IInstantiationService),
    __param(5, IEditorGroupsService)
], BinaryFileEditor);
export { BinaryFileEditor };
