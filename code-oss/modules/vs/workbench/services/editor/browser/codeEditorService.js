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
import { isCodeEditor, isDiffEditor, isCompositeEditor, getCodeEditor } from 'vs/editor/browser/editorBrowser';
import { AbstractCodeEditorService } from 'vs/editor/browser/services/abstractCodeEditorService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { isEqual } from 'vs/base/common/resources';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { applyTextEditorOptions } from 'vs/workbench/common/editor/editorOptions';
let CodeEditorService = class CodeEditorService extends AbstractCodeEditorService {
    editorService;
    configurationService;
    constructor(editorService, themeService, configurationService) {
        super(themeService);
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.registerCodeEditorOpenHandler(this.doOpenCodeEditor.bind(this));
        this.registerCodeEditorOpenHandler(this.doOpenCodeEditorFromDiff.bind(this));
    }
    getActiveCodeEditor() {
        const activeTextEditorControl = this.editorService.activeTextEditorControl;
        if (isCodeEditor(activeTextEditorControl)) {
            return activeTextEditorControl;
        }
        if (isDiffEditor(activeTextEditorControl)) {
            return activeTextEditorControl.getModifiedEditor();
        }
        const activeControl = this.editorService.activeEditorPane?.getControl();
        if (isCompositeEditor(activeControl) && isCodeEditor(activeControl.activeCodeEditor)) {
            return activeControl.activeCodeEditor;
        }
        return null;
    }
    async doOpenCodeEditorFromDiff(input, source, sideBySide) {
        // Special case: If the active editor is a diff editor and the request to open originates and
        // targets the modified side of it, we just apply the request there to prevent opening the modified
        // side as separate editor.
        const activeTextEditorControl = this.editorService.activeTextEditorControl;
        if (!sideBySide && // we need the current active group to be the target
            isDiffEditor(activeTextEditorControl) && // we only support this for active text diff editors
            input.options && // we need options to apply
            input.resource && // we need a request resource to compare with
            source === activeTextEditorControl.getModifiedEditor() && // we need the source of this request to be the modified side of the diff editor
            activeTextEditorControl.getModel() && // we need a target model to compare with
            isEqual(input.resource, activeTextEditorControl.getModel()?.modified.uri) // we need the input resources to match with modified side
        ) {
            const targetEditor = activeTextEditorControl.getModifiedEditor();
            applyTextEditorOptions(input.options, targetEditor, 0 /* ScrollType.Smooth */);
            return targetEditor;
        }
        return null;
    }
    // Open using our normal editor service
    async doOpenCodeEditor(input, source, sideBySide) {
        // Special case: we want to detect the request to open an editor that
        // is different from the current one to decide whether the current editor
        // should be pinned or not. This ensures that the source of a navigation
        // is not being replaced by the target. An example is "Goto definition"
        // that otherwise would replace the editor everytime the user navigates.
        const enablePreviewFromCodeNavigation = this.configurationService.getValue().workbench?.editor?.enablePreviewFromCodeNavigation;
        if (!enablePreviewFromCodeNavigation && // we only need to do this if the configuration requires it
            source && // we need to know the origin of the navigation
            !input.options?.pinned && // we only need to look at preview editors that open
            !sideBySide && // we only need to care if editor opens in same group
            !isEqual(source.getModel()?.uri, input.resource) // we only need to do this if the editor is about to change
        ) {
            for (const visiblePane of this.editorService.visibleEditorPanes) {
                if (getCodeEditor(visiblePane.getControl()) === source) {
                    visiblePane.group.pinEditor();
                    break;
                }
            }
        }
        // Open as editor
        const control = await this.editorService.openEditor(input, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
        if (control) {
            const widget = control.getControl();
            if (isCodeEditor(widget)) {
                return widget;
            }
            if (isCompositeEditor(widget) && isCodeEditor(widget.activeCodeEditor)) {
                return widget.activeCodeEditor;
            }
        }
        return null;
    }
};
CodeEditorService = __decorate([
    __param(0, IEditorService),
    __param(1, IThemeService),
    __param(2, IConfigurationService)
], CodeEditorService);
export { CodeEditorService };
registerSingleton(ICodeEditorService, CodeEditorService, 1 /* InstantiationType.Delayed */);
