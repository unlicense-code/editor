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
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { isEqual } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CustomEditorInput } from 'vs/workbench/contrib/customEditor/browser/customEditorInput';
import { ICustomEditorService } from 'vs/workbench/contrib/customEditor/common/customEditor';
import { NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { IWebviewService } from 'vs/workbench/contrib/webview/browser/webview';
import { restoreWebviewContentOptions, restoreWebviewOptions, reviveWebviewExtensionDescription, WebviewEditorInputSerializer } from 'vs/workbench/contrib/webviewPanel/browser/webviewEditorInputSerializer';
import { IWebviewWorkbenchService } from 'vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
let CustomEditorInputSerializer = class CustomEditorInputSerializer extends WebviewEditorInputSerializer {
    _instantiationService;
    _webviewService;
    static ID = CustomEditorInput.typeId;
    constructor(webviewWorkbenchService, _instantiationService, _webviewService) {
        super(webviewWorkbenchService);
        this._instantiationService = _instantiationService;
        this._webviewService = _webviewService;
    }
    serialize(input) {
        const dirty = input.isDirty();
        const data = {
            ...this.toJson(input),
            editorResource: input.resource.toJSON(),
            dirty,
            backupId: dirty ? input.backupId : undefined,
        };
        try {
            return JSON.stringify(data);
        }
        catch {
            return undefined;
        }
    }
    fromJson(data) {
        return {
            ...super.fromJson(data),
            editorResource: URI.from(data.editorResource),
            dirty: data.dirty,
        };
    }
    deserialize(_instantiationService, serializedEditorInput) {
        const data = this.fromJson(JSON.parse(serializedEditorInput));
        const webview = reviveWebview(this._webviewService, data);
        const customInput = this._instantiationService.createInstance(CustomEditorInput, { resource: data.editorResource, viewType: data.viewType, id: data.id }, webview, { startsDirty: data.dirty, backupId: data.backupId });
        if (typeof data.group === 'number') {
            customInput.updateGroup(data.group);
        }
        return customInput;
    }
};
CustomEditorInputSerializer = __decorate([
    __param(0, IWebviewWorkbenchService),
    __param(1, IInstantiationService),
    __param(2, IWebviewService)
], CustomEditorInputSerializer);
export { CustomEditorInputSerializer };
function reviveWebview(webviewService, data) {
    const webview = webviewService.createWebviewOverlay({
        id: data.id,
        providedViewType: data.viewType,
        origin: data.origin,
        options: {
            purpose: "customEditor" /* WebviewContentPurpose.CustomEditor */,
            enableFindWidget: data.webviewOptions.enableFindWidget,
            retainContextWhenHidden: data.webviewOptions.retainContextWhenHidden,
        },
        contentOptions: data.contentOptions,
        extension: data.extension,
    });
    webview.state = data.state;
    return webview;
}
let ComplexCustomWorkingCopyEditorHandler = class ComplexCustomWorkingCopyEditorHandler extends Disposable {
    _instantiationService;
    _workingCopyEditorService;
    _workingCopyBackupService;
    _webviewService;
    constructor(_instantiationService, _workingCopyEditorService, _workingCopyBackupService, _webviewService, _customEditorService // DO NOT REMOVE (needed on startup to register overrides properly)
    ) {
        super();
        this._instantiationService = _instantiationService;
        this._workingCopyEditorService = _workingCopyEditorService;
        this._workingCopyBackupService = _workingCopyBackupService;
        this._webviewService = _webviewService;
        this._installHandler();
    }
    _installHandler() {
        this._register(this._workingCopyEditorService.registerHandler({
            handles: workingCopy => workingCopy.resource.scheme === Schemas.vscodeCustomEditor,
            isOpen: (workingCopy, editor) => {
                if (workingCopy.resource.authority === 'jupyter-notebook-ipynb' && editor instanceof NotebookEditorInput) {
                    try {
                        const data = JSON.parse(workingCopy.resource.query);
                        const workingCopyResource = URI.from(data);
                        return isEqual(workingCopyResource, editor.resource);
                    }
                    catch {
                        return false;
                    }
                }
                if (!(editor instanceof CustomEditorInput)) {
                    return false;
                }
                if (workingCopy.resource.authority !== editor.viewType.replace(/[^a-z0-9\-_]/gi, '-').toLowerCase()) {
                    return false;
                }
                // The working copy stores the uri of the original resource as its query param
                try {
                    const data = JSON.parse(workingCopy.resource.query);
                    const workingCopyResource = URI.from(data);
                    return isEqual(workingCopyResource, editor.resource);
                }
                catch {
                    return false;
                }
            },
            createEditor: async (workingCopy) => {
                const backup = await this._workingCopyBackupService.resolve(workingCopy);
                if (!backup?.meta) {
                    throw new Error(`No backup found for custom editor: ${workingCopy.resource}`);
                }
                const backupData = backup.meta;
                const id = backupData.webview.id;
                const extension = reviveWebviewExtensionDescription(backupData.extension?.id, backupData.extension?.location);
                const webview = reviveWebview(this._webviewService, {
                    id,
                    viewType: backupData.viewType,
                    origin: backupData.webview.origin,
                    webviewOptions: restoreWebviewOptions(backupData.webview.options),
                    contentOptions: restoreWebviewContentOptions(backupData.webview.options),
                    state: backupData.webview.state,
                    extension,
                });
                const editor = this._instantiationService.createInstance(CustomEditorInput, { resource: URI.revive(backupData.editorResource), viewType: backupData.viewType, id }, webview, { backupId: backupData.backupId });
                editor.updateGroup(0);
                return editor;
            }
        }));
    }
};
ComplexCustomWorkingCopyEditorHandler = __decorate([
    __param(0, IInstantiationService),
    __param(1, IWorkingCopyEditorService),
    __param(2, IWorkingCopyBackupService),
    __param(3, IWebviewService),
    __param(4, ICustomEditorService)
], ComplexCustomWorkingCopyEditorHandler);
export { ComplexCustomWorkingCopyEditorHandler };
