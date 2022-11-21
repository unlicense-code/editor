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
import 'vs/css!./standaloneQuickInput';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { EditorScopedLayoutService } from 'vs/editor/standalone/browser/standaloneLayoutService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { QuickInputService } from 'vs/platform/quickinput/browser/quickInput';
import { once } from 'vs/base/common/functional';
let EditorScopedQuickInputService = class EditorScopedQuickInputService extends QuickInputService {
    host = undefined;
    constructor(editor, instantiationService, contextKeyService, themeService, accessibilityService, codeEditorService) {
        super(instantiationService, contextKeyService, themeService, accessibilityService, new EditorScopedLayoutService(editor.getContainerDomNode(), codeEditorService));
        // Use the passed in code editor as host for the quick input widget
        const contribution = QuickInputEditorContribution.get(editor);
        if (contribution) {
            const widget = contribution.widget;
            this.host = {
                _serviceBrand: undefined,
                get hasContainer() { return true; },
                get container() { return widget.getDomNode(); },
                get dimension() { return editor.getLayoutInfo(); },
                get onDidLayout() { return editor.onDidLayoutChange; },
                focus: () => editor.focus(),
                offset: { top: 0, quickPickTop: 0 }
            };
        }
        else {
            this.host = undefined;
        }
    }
    createController() {
        return super.createController(this.host);
    }
};
EditorScopedQuickInputService = __decorate([
    __param(1, IInstantiationService),
    __param(2, IContextKeyService),
    __param(3, IThemeService),
    __param(4, IAccessibilityService),
    __param(5, ICodeEditorService)
], EditorScopedQuickInputService);
let StandaloneQuickInputService = class StandaloneQuickInputService {
    instantiationService;
    codeEditorService;
    mapEditorToService = new Map();
    get activeService() {
        const editor = this.codeEditorService.getFocusedCodeEditor();
        if (!editor) {
            throw new Error('Quick input service needs a focused editor to work.');
        }
        // Find the quick input implementation for the focused
        // editor or create it lazily if not yet created
        let quickInputService = this.mapEditorToService.get(editor);
        if (!quickInputService) {
            const newQuickInputService = quickInputService = this.instantiationService.createInstance(EditorScopedQuickInputService, editor);
            this.mapEditorToService.set(editor, quickInputService);
            once(editor.onDidDispose)(() => {
                newQuickInputService.dispose();
                this.mapEditorToService.delete(editor);
            });
        }
        return quickInputService;
    }
    get quickAccess() { return this.activeService.quickAccess; }
    get backButton() { return this.activeService.backButton; }
    get onShow() { return this.activeService.onShow; }
    get onHide() { return this.activeService.onHide; }
    constructor(instantiationService, codeEditorService) {
        this.instantiationService = instantiationService;
        this.codeEditorService = codeEditorService;
    }
    pick(picks, options = {}, token = CancellationToken.None) {
        return this.activeService /* TS fail */.pick(picks, options, token);
    }
    input(options, token) {
        return this.activeService.input(options, token);
    }
    createQuickPick() {
        return this.activeService.createQuickPick();
    }
    createInputBox() {
        return this.activeService.createInputBox();
    }
    focus() {
        return this.activeService.focus();
    }
    toggle() {
        return this.activeService.toggle();
    }
    navigate(next, quickNavigate) {
        return this.activeService.navigate(next, quickNavigate);
    }
    accept() {
        return this.activeService.accept();
    }
    back() {
        return this.activeService.back();
    }
    cancel() {
        return this.activeService.cancel();
    }
};
StandaloneQuickInputService = __decorate([
    __param(0, IInstantiationService),
    __param(1, ICodeEditorService)
], StandaloneQuickInputService);
export { StandaloneQuickInputService };
export class QuickInputEditorContribution {
    editor;
    static ID = 'editor.controller.quickInput';
    static get(editor) {
        return editor.getContribution(QuickInputEditorContribution.ID);
    }
    widget = new QuickInputEditorWidget(this.editor);
    constructor(editor) {
        this.editor = editor;
    }
    dispose() {
        this.widget.dispose();
    }
}
export class QuickInputEditorWidget {
    codeEditor;
    static ID = 'editor.contrib.quickInputWidget';
    domNode;
    constructor(codeEditor) {
        this.codeEditor = codeEditor;
        this.domNode = document.createElement('div');
        this.codeEditor.addOverlayWidget(this);
    }
    getId() {
        return QuickInputEditorWidget.ID;
    }
    getDomNode() {
        return this.domNode;
    }
    getPosition() {
        return { preference: 2 /* OverlayWidgetPositionPreference.TOP_CENTER */ };
    }
    dispose() {
        this.codeEditor.removeOverlayWidget(this);
    }
}
registerEditorContribution(QuickInputEditorContribution.ID, QuickInputEditorContribution);
