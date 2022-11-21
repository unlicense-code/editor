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
import * as nls from 'vs/nls';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { parseKeyboardLayoutDescription, areKeyboardLayoutsEqual, getKeyboardLayoutId, IKeyboardLayoutService } from 'vs/platform/keyboardLayout/common/keyboardLayout';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { KEYBOARD_LAYOUT_OPEN_PICKER } from 'vs/workbench/contrib/preferences/common/preferences';
import { isMacintosh, isWindows } from 'vs/base/common/platform';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { VSBuffer } from 'vs/base/common/buffer';
let KeyboardLayoutPickerContribution = class KeyboardLayoutPickerContribution extends Disposable {
    keyboardLayoutService;
    statusbarService;
    pickerElement = this._register(new MutableDisposable());
    constructor(keyboardLayoutService, statusbarService) {
        super();
        this.keyboardLayoutService = keyboardLayoutService;
        this.statusbarService = statusbarService;
        const name = nls.localize('status.workbench.keyboardLayout', "Keyboard Layout");
        const layout = this.keyboardLayoutService.getCurrentKeyboardLayout();
        if (layout) {
            const layoutInfo = parseKeyboardLayoutDescription(layout);
            const text = nls.localize('keyboardLayout', "Layout: {0}", layoutInfo.label);
            this.pickerElement.value = this.statusbarService.addEntry({
                name,
                text,
                ariaLabel: text,
                command: KEYBOARD_LAYOUT_OPEN_PICKER
            }, 'status.workbench.keyboardLayout', 1 /* StatusbarAlignment.RIGHT */);
        }
        this._register(this.keyboardLayoutService.onDidChangeKeyboardLayout(() => {
            const layout = this.keyboardLayoutService.getCurrentKeyboardLayout();
            const layoutInfo = parseKeyboardLayoutDescription(layout);
            if (this.pickerElement.value) {
                const text = nls.localize('keyboardLayout', "Layout: {0}", layoutInfo.label);
                this.pickerElement.value.update({
                    name,
                    text,
                    ariaLabel: text,
                    command: KEYBOARD_LAYOUT_OPEN_PICKER
                });
            }
            else {
                const text = nls.localize('keyboardLayout', "Layout: {0}", layoutInfo.label);
                this.pickerElement.value = this.statusbarService.addEntry({
                    name,
                    text,
                    ariaLabel: text,
                    command: KEYBOARD_LAYOUT_OPEN_PICKER
                }, 'status.workbench.keyboardLayout', 1 /* StatusbarAlignment.RIGHT */);
            }
        }));
    }
};
KeyboardLayoutPickerContribution = __decorate([
    __param(0, IKeyboardLayoutService),
    __param(1, IStatusbarService)
], KeyboardLayoutPickerContribution);
export { KeyboardLayoutPickerContribution };
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(KeyboardLayoutPickerContribution, 1 /* LifecyclePhase.Starting */);
const DEFAULT_CONTENT = [
    `// ${nls.localize('displayLanguage', 'Defines the keyboard layout used in VS Code in the browser environment.')}`,
    `// ${nls.localize('doc', 'Open VS Code and run "Developer: Inspect Key Mappings (JSON)" from Command Palette.')}`,
    ``,
    `// Once you have the keyboard layout info, please paste it below.`,
    '\n'
].join('\n');
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: KEYBOARD_LAYOUT_OPEN_PICKER,
            title: { value: nls.localize('keyboard.chooseLayout', "Change Keyboard Layout"), original: 'Change Keyboard Layout' },
            f1: true
        });
    }
    async run(accessor) {
        const keyboardLayoutService = accessor.get(IKeyboardLayoutService);
        const quickInputService = accessor.get(IQuickInputService);
        const configurationService = accessor.get(IConfigurationService);
        const environmentService = accessor.get(IEnvironmentService);
        const editorService = accessor.get(IEditorService);
        const fileService = accessor.get(IFileService);
        const layouts = keyboardLayoutService.getAllKeyboardLayouts();
        const currentLayout = keyboardLayoutService.getCurrentKeyboardLayout();
        const layoutConfig = configurationService.getValue('keyboard.layout');
        const isAutoDetect = layoutConfig === 'autodetect';
        const picks = layouts.map(layout => {
            const picked = !isAutoDetect && areKeyboardLayoutsEqual(currentLayout, layout);
            const layoutInfo = parseKeyboardLayoutDescription(layout);
            return {
                layout: layout,
                label: [layoutInfo.label, (layout && layout.isUserKeyboardLayout) ? '(User configured layout)' : ''].join(' '),
                id: layout.text || layout.lang || layout.layout,
                description: layoutInfo.description + (picked ? ' (Current layout)' : ''),
                picked: !isAutoDetect && areKeyboardLayoutsEqual(currentLayout, layout)
            };
        }).sort((a, b) => {
            return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0);
        });
        if (picks.length > 0) {
            const platform = isMacintosh ? 'Mac' : isWindows ? 'Win' : 'Linux';
            picks.unshift({ type: 'separator', label: nls.localize('layoutPicks', "Keyboard Layouts ({0})", platform) });
        }
        const configureKeyboardLayout = { label: nls.localize('configureKeyboardLayout', "Configure Keyboard Layout") };
        picks.unshift(configureKeyboardLayout);
        // Offer to "Auto Detect"
        const autoDetectMode = {
            label: nls.localize('autoDetect', "Auto Detect"),
            description: isAutoDetect ? `Current: ${parseKeyboardLayoutDescription(currentLayout).label}` : undefined,
            picked: isAutoDetect ? true : undefined
        };
        picks.unshift(autoDetectMode);
        const pick = await quickInputService.pick(picks, { placeHolder: nls.localize('pickKeyboardLayout', "Select Keyboard Layout"), matchOnDescription: true });
        if (!pick) {
            return;
        }
        if (pick === autoDetectMode) {
            // set keymap service to auto mode
            configurationService.updateValue('keyboard.layout', 'autodetect');
            return;
        }
        if (pick === configureKeyboardLayout) {
            const file = environmentService.keyboardLayoutResource;
            await fileService.stat(file).then(undefined, () => {
                return fileService.createFile(file, VSBuffer.fromString(DEFAULT_CONTENT));
            }).then((stat) => {
                if (!stat) {
                    return undefined;
                }
                return editorService.openEditor({
                    resource: stat.resource,
                    languageId: 'jsonc',
                    options: { pinned: true }
                });
            }, (error) => {
                throw new Error(nls.localize('fail.createSettings', "Unable to create '{0}' ({1}).", file.toString(), error));
            });
            return Promise.resolve();
        }
        configurationService.updateValue('keyboard.layout', getKeyboardLayoutId(pick.layout));
    }
});
