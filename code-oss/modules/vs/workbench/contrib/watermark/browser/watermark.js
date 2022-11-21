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
import 'vs/css!./media/watermark';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { isMacintosh, isWeb, OS } from 'vs/base/common/platform';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import * as nls from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { OpenFolderAction, OpenFileFolderAction, OpenFileAction } from 'vs/workbench/browser/actions/workspaceActions';
import { OpenRecentAction } from 'vs/workbench/browser/actions/windowActions';
import { ShowAllCommandsAction } from 'vs/workbench/contrib/quickaccess/browser/commandsQuickAccess';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { FindInFilesActionId } from 'vs/workbench/contrib/search/common/constants';
import * as dom from 'vs/base/browser/dom';
import { KeybindingLabel } from 'vs/base/browser/ui/keybindingLabel/keybindingLabel';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { assertIsDefined } from 'vs/base/common/types';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
import { NEW_UNTITLED_FILE_COMMAND_ID } from 'vs/workbench/contrib/files/browser/fileConstants';
import { DEBUG_START_COMMAND_ID } from 'vs/workbench/contrib/debug/browser/debugCommands';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
import { getKeybindingLabelStyles } from 'vs/platform/theme/browser/defaultStyles';
const $ = dom.$;
const showCommands = { text: nls.localize('watermark.showCommands', "Show All Commands"), id: ShowAllCommandsAction.ID };
const quickAccess = { text: nls.localize('watermark.quickAccess', "Go to File"), id: 'workbench.action.quickOpen' };
const openFileNonMacOnly = { text: nls.localize('watermark.openFile', "Open File"), id: OpenFileAction.ID, mac: false };
const openFolderNonMacOnly = { text: nls.localize('watermark.openFolder', "Open Folder"), id: OpenFolderAction.ID, mac: false };
const openFileOrFolderMacOnly = { text: nls.localize('watermark.openFileFolder', "Open File or Folder"), id: OpenFileFolderAction.ID, mac: true };
const openRecent = { text: nls.localize('watermark.openRecent', "Open Recent"), id: OpenRecentAction.ID };
const newUntitledFile = { text: nls.localize('watermark.newUntitledFile', "New Untitled File"), id: NEW_UNTITLED_FILE_COMMAND_ID };
const newUntitledFileMacOnly = Object.assign({ mac: true }, newUntitledFile);
const findInFiles = { text: nls.localize('watermark.findInFiles', "Find in Files"), id: FindInFilesActionId };
const toggleTerminal = { text: nls.localize({ key: 'watermark.toggleTerminal', comment: ['toggle is a verb here'] }, "Toggle Terminal"), id: "workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */, when: TerminalContextKeys.processSupported };
const startDebugging = { text: nls.localize('watermark.startDebugging', "Start Debugging"), id: DEBUG_START_COMMAND_ID, when: TerminalContextKeys.processSupported };
const toggleFullscreen = { text: nls.localize({ key: 'watermark.toggleFullscreen', comment: ['toggle is a verb here'] }, "Toggle Full Screen"), id: 'workbench.action.toggleFullScreen', when: TerminalContextKeys.processSupported.toNegated() };
const showSettings = { text: nls.localize('watermark.showSettings', "Show Settings"), id: 'workbench.action.openSettings', when: TerminalContextKeys.processSupported.toNegated() };
const noFolderEntries = [
    showCommands,
    openFileNonMacOnly,
    openFolderNonMacOnly,
    openFileOrFolderMacOnly,
    openRecent,
    newUntitledFileMacOnly
];
const folderEntries = [
    showCommands,
    quickAccess,
    findInFiles,
    startDebugging,
    toggleTerminal,
    toggleFullscreen,
    showSettings
];
const WORKBENCH_TIPS_ENABLED_KEY = 'workbench.tips.enabled';
let WatermarkContribution = class WatermarkContribution extends Disposable {
    lifecycleService;
    layoutService;
    keybindingService;
    contextService;
    contextKeyService;
    configurationService;
    editorGroupsService;
    telemetryService;
    watermark;
    watermarkDisposable = this._register(new DisposableStore());
    enabled;
    workbenchState;
    constructor(lifecycleService, layoutService, keybindingService, contextService, contextKeyService, configurationService, editorGroupsService, telemetryService) {
        super();
        this.lifecycleService = lifecycleService;
        this.layoutService = layoutService;
        this.keybindingService = keybindingService;
        this.contextService = contextService;
        this.contextKeyService = contextKeyService;
        this.configurationService = configurationService;
        this.editorGroupsService = editorGroupsService;
        this.telemetryService = telemetryService;
        this.workbenchState = contextService.getWorkbenchState();
        this.enabled = this.configurationService.getValue(WORKBENCH_TIPS_ENABLED_KEY);
        this.registerListeners();
        if (this.enabled) {
            this.create();
        }
    }
    registerListeners() {
        this.lifecycleService.onDidShutdown(() => this.dispose());
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(WORKBENCH_TIPS_ENABLED_KEY)) {
                const enabled = this.configurationService.getValue(WORKBENCH_TIPS_ENABLED_KEY);
                if (enabled !== this.enabled) {
                    this.enabled = enabled;
                    if (this.enabled) {
                        this.create();
                    }
                    else {
                        this.destroy();
                    }
                }
            }
        }));
        this._register(this.contextService.onDidChangeWorkbenchState(e => {
            const previousWorkbenchState = this.workbenchState;
            this.workbenchState = this.contextService.getWorkbenchState();
            if (this.enabled && this.workbenchState !== previousWorkbenchState) {
                this.recreate();
            }
        }));
        const allEntriesWhenClauses = [...noFolderEntries, ...folderEntries].filter(entry => entry.when !== undefined).map(entry => entry.when);
        const allKeys = new Set();
        allEntriesWhenClauses.forEach(when => when.keys().forEach(key => allKeys.add(key)));
        this._register(this.contextKeyService.onDidChangeContext(e => {
            if (e.affectsSome(allKeys)) {
                this.recreate();
            }
        }));
    }
    create() {
        const container = assertIsDefined(this.layoutService.getContainer("workbench.parts.editor" /* Parts.EDITOR_PART */));
        container.classList.add('has-watermark');
        this.watermark = $('.watermark');
        const box = dom.append(this.watermark, $('.watermark-box'));
        const folder = this.workbenchState !== 1 /* WorkbenchState.EMPTY */;
        const selected = (folder ? folderEntries : noFolderEntries)
            .filter(entry => !('when' in entry) || this.contextKeyService.contextMatchesRules(entry.when))
            .filter(entry => !('mac' in entry) || entry.mac === (isMacintosh && !isWeb))
            .filter(entry => !!CommandsRegistry.getCommand(entry.id));
        const update = () => {
            dom.clearNode(box);
            selected.map(entry => {
                const dl = dom.append(box, $('dl'));
                const dt = dom.append(dl, $('dt'));
                dt.textContent = entry.text;
                const dd = dom.append(dl, $('dd'));
                const keybinding = new KeybindingLabel(dd, OS, { renderUnboundKeybindings: true, ...getKeybindingLabelStyles() });
                keybinding.set(this.keybindingService.lookupKeybinding(entry.id));
            });
        };
        update();
        dom.prepend(container.firstElementChild, this.watermark);
        this.watermarkDisposable.add(this.keybindingService.onDidUpdateKeybindings(update));
        this.watermarkDisposable.add(this.editorGroupsService.onDidLayout(dimension => this.handleEditorPartSize(container, dimension)));
        this.handleEditorPartSize(container, this.editorGroupsService.contentDimension);
        /* __GDPR__
        "watermark:open" : {
            "owner": "digitarald"
        }
        */
        this.telemetryService.publicLog('watermark:open');
    }
    handleEditorPartSize(container, dimension) {
        container.classList.toggle('max-height-478px', dimension.height <= 478);
    }
    destroy() {
        if (this.watermark) {
            this.watermark.remove();
            const container = this.layoutService.getContainer("workbench.parts.editor" /* Parts.EDITOR_PART */);
            container?.classList.remove('has-watermark');
            this.watermarkDisposable.clear();
        }
    }
    recreate() {
        this.destroy();
        this.create();
    }
};
WatermarkContribution = __decorate([
    __param(0, ILifecycleService),
    __param(1, IWorkbenchLayoutService),
    __param(2, IKeybindingService),
    __param(3, IWorkspaceContextService),
    __param(4, IContextKeyService),
    __param(5, IConfigurationService),
    __param(6, IEditorGroupsService),
    __param(7, ITelemetryService)
], WatermarkContribution);
export { WatermarkContribution };
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WatermarkContribution, 3 /* LifecyclePhase.Restored */);
Registry.as(ConfigurationExtensions.Configuration)
    .registerConfiguration({
    ...workbenchConfigurationNodeBase,
    'properties': {
        'workbench.tips.enabled': {
            'type': 'boolean',
            'default': true,
            'description': nls.localize('tips.enabled', "When enabled, will show the watermark tips when no editor is open.")
        },
    }
});
