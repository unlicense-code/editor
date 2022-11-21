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
import 'vs/css!./untitledTextEditorHint';
import * as dom from 'vs/base/browser/dom';
import { DisposableStore, dispose } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { ChangeLanguageAction } from 'vs/workbench/browser/parts/editor/editorStatus';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { Schemas } from 'vs/base/common/network';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { renderFormattedText } from 'vs/base/browser/formattedTextRenderer';
import { ApplyFileSnippetAction } from 'vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets';
const $ = dom.$;
const untitledTextEditorHintSetting = 'workbench.editor.untitled.hint';
let UntitledTextEditorHintContribution = class UntitledTextEditorHintContribution {
    editor;
    editorGroupsService;
    commandService;
    configurationService;
    keybindingService;
    static ID = 'editor.contrib.untitledTextEditorHint';
    toDispose;
    untitledTextHintContentWidget;
    constructor(editor, editorGroupsService, commandService, configurationService, keybindingService) {
        this.editor = editor;
        this.editorGroupsService = editorGroupsService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.toDispose = [];
        this.toDispose.push(this.editor.onDidChangeModel(() => this.update()));
        this.toDispose.push(this.editor.onDidChangeModelLanguage(() => this.update()));
        this.toDispose.push(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(untitledTextEditorHintSetting)) {
                this.update();
            }
        }));
    }
    update() {
        this.untitledTextHintContentWidget?.dispose();
        const configValue = this.configurationService.getValue(untitledTextEditorHintSetting);
        const model = this.editor.getModel();
        if (model && model.uri.scheme === Schemas.untitled && model.getLanguageId() === PLAINTEXT_LANGUAGE_ID && configValue === 'text') {
            this.untitledTextHintContentWidget = new UntitledTextEditorHintContentWidget(this.editor, this.editorGroupsService, this.commandService, this.configurationService, this.keybindingService);
        }
    }
    dispose() {
        dispose(this.toDispose);
        this.untitledTextHintContentWidget?.dispose();
    }
};
UntitledTextEditorHintContribution = __decorate([
    __param(1, IEditorGroupsService),
    __param(2, ICommandService),
    __param(3, IConfigurationService),
    __param(4, IKeybindingService)
], UntitledTextEditorHintContribution);
export { UntitledTextEditorHintContribution };
class UntitledTextEditorHintContentWidget {
    editor;
    editorGroupsService;
    commandService;
    configurationService;
    keybindingService;
    static ID = 'editor.widget.untitledHint';
    domNode;
    toDispose;
    constructor(editor, editorGroupsService, commandService, configurationService, keybindingService) {
        this.editor = editor;
        this.editorGroupsService = editorGroupsService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.toDispose = new DisposableStore();
        this.toDispose.add(editor.onDidChangeModelContent(() => this.onDidChangeModelContent()));
        this.toDispose.add(this.editor.onDidChangeConfiguration((e) => {
            if (this.domNode && e.hasChanged(45 /* EditorOption.fontInfo */)) {
                this.editor.applyFontInfo(this.domNode);
            }
        }));
        this.onDidChangeModelContent();
    }
    onDidChangeModelContent() {
        if (this.editor.getValue() === '') {
            this.editor.addContentWidget(this);
        }
        else {
            this.editor.removeContentWidget(this);
        }
    }
    getId() {
        return UntitledTextEditorHintContentWidget.ID;
    }
    // Select a language to get started. Start typing to dismiss, or don't show this again.
    getDomNode() {
        if (!this.domNode) {
            this.domNode = $('.untitled-hint');
            this.domNode.style.width = 'max-content';
            const hintMsg = localize({ key: 'message', comment: ['Presereve double-square brackets and their order'] }, '[[Select a language]], or [[open a different editor]] to get started.\nStart typing to dismiss or [[don\'t show]] this again.');
            const hintHandler = {
                disposables: this.toDispose,
                callback: (index, event) => {
                    switch (index) {
                        case '0':
                            languageOnClickOrTap(event.browserEvent);
                            break;
                        case '1':
                            chooseEditorOnClickOrTap(event.browserEvent);
                            break;
                        case '2':
                            dontShowOnClickOrTap();
                            break;
                    }
                }
            };
            const hintElement = renderFormattedText(hintMsg, {
                actionHandler: hintHandler,
                renderCodeSegments: false,
            });
            this.domNode.append(hintElement);
            // ugly way to associate keybindings...
            const keybindingsLookup = [ChangeLanguageAction.ID, ApplyFileSnippetAction.Id, 'welcome.showNewFileEntries'];
            for (const anchor of hintElement.querySelectorAll('A')) {
                anchor.style.cursor = 'pointer';
                const id = keybindingsLookup.shift();
                const title = id && this.keybindingService.lookupKeybinding(id)?.getLabel();
                anchor.title = title ?? '';
            }
            // the actual command handlers...
            const languageOnClickOrTap = async (e) => {
                e.stopPropagation();
                // Need to focus editor before so current editor becomes active and the command is properly executed
                this.editor.focus();
                await this.commandService.executeCommand(ChangeLanguageAction.ID, { from: 'hint' });
                this.editor.focus();
            };
            const chooseEditorOnClickOrTap = async (e) => {
                e.stopPropagation();
                const activeEditorInput = this.editorGroupsService.activeGroup.activeEditor;
                const newEditorSelected = await this.commandService.executeCommand('welcome.showNewFileEntries', { from: 'hint' });
                // Close the active editor as long as it is untitled (swap the editors out)
                if (newEditorSelected && activeEditorInput !== null && activeEditorInput.resource?.scheme === Schemas.untitled) {
                    this.editorGroupsService.activeGroup.closeEditor(activeEditorInput, { preserveFocus: true });
                }
            };
            const dontShowOnClickOrTap = () => {
                this.configurationService.updateValue(untitledTextEditorHintSetting, 'hidden');
                this.dispose();
                this.editor.focus();
            };
            this.toDispose.add(dom.addDisposableListener(this.domNode, 'click', () => {
                this.editor.focus();
            }));
            this.domNode.style.fontStyle = 'italic';
            this.domNode.style.paddingLeft = '4px';
            this.editor.applyFontInfo(this.domNode);
        }
        return this.domNode;
    }
    getPosition() {
        return {
            position: { lineNumber: 1, column: 1 },
            preference: [0 /* ContentWidgetPositionPreference.EXACT */]
        };
    }
    dispose() {
        this.editor.removeContentWidget(this);
        dispose(this.toDispose);
    }
}
registerEditorContribution(UntitledTextEditorHintContribution.ID, UntitledTextEditorHintContribution);
