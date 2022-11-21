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
import 'vs/css!./notebookKernelActionViewItem';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { NOTEBOOK_ACTIONS_CATEGORY, SELECT_KERNEL_ID } from 'vs/workbench/contrib/notebook/browser/controller/coreActions';
import { selectKernelIcon } from 'vs/workbench/contrib/notebook/browser/notebookIcons';
import { NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_KERNEL_COUNT } from 'vs/workbench/contrib/notebook/common/notebookContextKeys';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { KernelPickerFlatStrategy, KernelPickerMRUStrategy } from 'vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: SELECT_KERNEL_ID,
            category: NOTEBOOK_ACTIONS_CATEGORY,
            title: { value: localize('notebookActions.selectKernel', "Select Notebook Kernel"), original: 'Select Notebook Kernel' },
            icon: selectKernelIcon,
            f1: true,
            menu: [{
                    id: MenuId.EditorTitle,
                    when: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                    group: 'navigation',
                    order: -10
                }, {
                    id: MenuId.NotebookToolbar,
                    when: ContextKeyExpr.equals('config.notebook.globalToolbar', true),
                    group: 'status',
                    order: -10
                }, {
                    id: MenuId.InteractiveToolbar,
                    when: NOTEBOOK_KERNEL_COUNT.notEqualsTo(0),
                    group: 'status',
                    order: -10
                }],
            description: {
                description: localize('notebookActions.selectKernel.args', "Notebook Kernel Args"),
                args: [
                    {
                        name: 'kernelInfo',
                        description: 'The kernel info',
                        schema: {
                            'type': 'object',
                            'required': ['id', 'extension'],
                            'properties': {
                                'id': {
                                    'type': 'string'
                                },
                                'extension': {
                                    'type': 'string'
                                },
                                'notebookEditorId': {
                                    'type': 'string'
                                }
                            }
                        }
                    }
                ]
            },
        });
    }
    async run(accessor, context) {
        const instantiationService = accessor.get(IInstantiationService);
        const configurationService = accessor.get(IConfigurationService);
        const kernelPickerType = configurationService.getValue('notebook.kernelPicker.type');
        if (kernelPickerType === 'mru') {
            const strategy = instantiationService.createInstance(KernelPickerMRUStrategy);
            return await strategy.showQuickPick(context);
        }
        else {
            const strategy = instantiationService.createInstance(KernelPickerFlatStrategy);
            return await strategy.showQuickPick(context);
        }
    }
});
let NotebooKernelActionViewItem = class NotebooKernelActionViewItem extends ActionViewItem {
    _editor;
    _notebookKernelService;
    _configurationService;
    _kernelLabel;
    constructor(actualAction, _editor, _notebookKernelService, _configurationService) {
        super(undefined, new Action('fakeAction', undefined, ThemeIcon.asClassName(selectKernelIcon), true, (event) => actualAction.run(event)), { label: false, icon: true });
        this._editor = _editor;
        this._notebookKernelService = _notebookKernelService;
        this._configurationService = _configurationService;
        this._register(_editor.onDidChangeModel(this._update, this));
        this._register(_notebookKernelService.onDidChangeNotebookAffinity(this._update, this));
        this._register(_notebookKernelService.onDidChangeSelectedNotebooks(this._update, this));
        this._register(_notebookKernelService.onDidChangeSourceActions(this._update, this));
        this._register(_notebookKernelService.onDidChangeKernelDetectionTasks(this._update, this));
    }
    render(container) {
        this._update();
        super.render(container);
        container.classList.add('kernel-action-view-item');
        this._kernelLabel = document.createElement('a');
        container.appendChild(this._kernelLabel);
        this.updateLabel();
    }
    updateLabel() {
        if (this._kernelLabel) {
            this._kernelLabel.classList.add('kernel-label');
            this._kernelLabel.innerText = this._action.label;
            this._kernelLabel.title = this._action.tooltip;
        }
    }
    _update() {
        const notebook = this._editor.textModel;
        if (!notebook) {
            this._resetAction();
            return;
        }
        const kernelPickerType = this._configurationService.getValue('notebook.kernelPicker.type');
        if (kernelPickerType === 'mru') {
            KernelPickerMRUStrategy.updateKernelStatusAction(notebook, this._action, this._notebookKernelService);
        }
        else {
            KernelPickerFlatStrategy.updateKernelStatusAction(notebook, this._action, this._notebookKernelService, this._editor.scopedContextKeyService);
        }
        this.updateClass();
    }
    _resetAction() {
        this._action.enabled = false;
        this._action.label = '';
        this._action.class = '';
    }
};
NotebooKernelActionViewItem = __decorate([
    __param(2, INotebookKernelService),
    __param(3, IConfigurationService)
], NotebooKernelActionViewItem);
export { NotebooKernelActionViewItem };
