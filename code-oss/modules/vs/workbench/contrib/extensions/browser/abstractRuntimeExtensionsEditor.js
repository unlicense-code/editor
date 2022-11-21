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
import 'vs/css!./media/runtimeExtensionsEditor';
import * as nls from 'vs/nls';
import { Action, Separator } from 'vs/base/common/actions';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IExtensionService, LocalWebWorkerRunningLocation } from 'vs/workbench/services/extensions/common/extensions';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { append, $, clearNode, addDisposableListener } from 'vs/base/browser/dom';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { dispose } from 'vs/base/common/lifecycle';
import { RunOnceScheduler } from 'vs/base/common/async';
import { DefaultIconPath } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { memoize } from 'vs/base/common/decorators';
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILabelService } from 'vs/platform/label/common/label';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { Schemas } from 'vs/base/common/network';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { editorBackground } from 'vs/platform/theme/common/colorRegistry';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { RuntimeExtensionsInput } from 'vs/workbench/contrib/extensions/common/runtimeExtensionsInput';
import { Action2, MenuId } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
let AbstractRuntimeExtensionsEditor = class AbstractRuntimeExtensionsEditor extends EditorPane {
    _extensionsWorkbenchService;
    _extensionService;
    _notificationService;
    _contextMenuService;
    _instantiationService;
    _labelService;
    _environmentService;
    _clipboardService;
    static ID = 'workbench.editor.runtimeExtensions';
    _list;
    _elements;
    _updateSoon;
    constructor(telemetryService, themeService, contextKeyService, _extensionsWorkbenchService, _extensionService, _notificationService, _contextMenuService, _instantiationService, storageService, _labelService, _environmentService, _clipboardService) {
        super(AbstractRuntimeExtensionsEditor.ID, telemetryService, themeService, storageService);
        this._extensionsWorkbenchService = _extensionsWorkbenchService;
        this._extensionService = _extensionService;
        this._notificationService = _notificationService;
        this._contextMenuService = _contextMenuService;
        this._instantiationService = _instantiationService;
        this._labelService = _labelService;
        this._environmentService = _environmentService;
        this._clipboardService = _clipboardService;
        this._list = null;
        this._elements = null;
        this._updateSoon = this._register(new RunOnceScheduler(() => this._updateExtensions(), 200));
        this._register(this._extensionService.onDidChangeExtensionsStatus(() => this._updateSoon.schedule()));
        this._updateExtensions();
    }
    async _updateExtensions() {
        this._elements = await this._resolveExtensions();
        this._list?.splice(0, this._list.length, this._elements);
    }
    async _resolveExtensions() {
        // We only deal with extensions with source code!
        await this._extensionService.whenInstalledExtensionsRegistered();
        const extensionsDescriptions = this._extensionService.extensions.filter((extension) => {
            return Boolean(extension.main) || Boolean(extension.browser);
        });
        const marketplaceMap = Object.create(null);
        const marketPlaceExtensions = await this._extensionsWorkbenchService.queryLocal();
        for (const extension of marketPlaceExtensions) {
            marketplaceMap[ExtensionIdentifier.toKey(extension.identifier.id)] = extension;
        }
        const statusMap = this._extensionService.getExtensionsStatus();
        // group profile segments by extension
        const segments = Object.create(null);
        const profileInfo = this._getProfileInfo();
        if (profileInfo) {
            let currentStartTime = profileInfo.startTime;
            for (let i = 0, len = profileInfo.deltas.length; i < len; i++) {
                const id = profileInfo.ids[i];
                const delta = profileInfo.deltas[i];
                let extensionSegments = segments[ExtensionIdentifier.toKey(id)];
                if (!extensionSegments) {
                    extensionSegments = [];
                    segments[ExtensionIdentifier.toKey(id)] = extensionSegments;
                }
                extensionSegments.push(currentStartTime);
                currentStartTime = currentStartTime + delta;
                extensionSegments.push(currentStartTime);
            }
        }
        let result = [];
        for (let i = 0, len = extensionsDescriptions.length; i < len; i++) {
            const extensionDescription = extensionsDescriptions[i];
            let extProfileInfo = null;
            if (profileInfo) {
                const extensionSegments = segments[ExtensionIdentifier.toKey(extensionDescription.identifier)] || [];
                let extensionTotalTime = 0;
                for (let j = 0, lenJ = extensionSegments.length / 2; j < lenJ; j++) {
                    const startTime = extensionSegments[2 * j];
                    const endTime = extensionSegments[2 * j + 1];
                    extensionTotalTime += (endTime - startTime);
                }
                extProfileInfo = {
                    segments: extensionSegments,
                    totalTime: extensionTotalTime
                };
            }
            result[i] = {
                originalIndex: i,
                description: extensionDescription,
                marketplaceInfo: marketplaceMap[ExtensionIdentifier.toKey(extensionDescription.identifier)],
                status: statusMap[extensionDescription.identifier.value],
                profileInfo: extProfileInfo || undefined,
                unresponsiveProfile: this._getUnresponsiveProfile(extensionDescription.identifier)
            };
        }
        result = result.filter(element => element.status.activationTimes);
        // bubble up extensions that have caused slowness
        const isUnresponsive = (extension) => extension.unresponsiveProfile === profileInfo;
        const profileTime = (extension) => extension.profileInfo?.totalTime ?? 0;
        const activationTime = (extension) => (extension.status.activationTimes?.codeLoadingTime ?? 0) +
            (extension.status.activationTimes?.activateCallTime ?? 0);
        result = result.sort((a, b) => {
            if (isUnresponsive(a) || isUnresponsive(b)) {
                return +isUnresponsive(b) - +isUnresponsive(a);
            }
            else if (profileTime(a) || profileTime(b)) {
                return profileTime(b) - profileTime(a);
            }
            else if (activationTime(a) || activationTime(b)) {
                return activationTime(b) - activationTime(a);
            }
            return a.originalIndex - b.originalIndex;
        });
        return result;
    }
    createEditor(parent) {
        parent.classList.add('runtime-extensions-editor');
        const TEMPLATE_ID = 'runtimeExtensionElementTemplate';
        const delegate = new class {
            getHeight(element) {
                return 62;
            }
            getTemplateId(element) {
                return TEMPLATE_ID;
            }
        };
        const renderer = {
            templateId: TEMPLATE_ID,
            renderTemplate: (root) => {
                const element = append(root, $('.extension'));
                const iconContainer = append(element, $('.icon-container'));
                const icon = append(iconContainer, $('img.icon'));
                const desc = append(element, $('div.desc'));
                const headerContainer = append(desc, $('.header-container'));
                const header = append(headerContainer, $('.header'));
                const name = append(header, $('div.name'));
                const version = append(header, $('span.version'));
                const msgContainer = append(desc, $('div.msg'));
                const actionbar = new ActionBar(desc, { animated: false });
                actionbar.onDidRun(({ error }) => error && this._notificationService.error(error));
                const timeContainer = append(element, $('.time'));
                const activationTime = append(timeContainer, $('div.activation-time'));
                const profileTime = append(timeContainer, $('div.profile-time'));
                const disposables = [actionbar];
                return {
                    root,
                    element,
                    icon,
                    name,
                    version,
                    actionbar,
                    activationTime,
                    profileTime,
                    msgContainer,
                    disposables,
                    elementDisposables: [],
                };
            },
            renderElement: (element, index, data) => {
                data.elementDisposables = dispose(data.elementDisposables);
                data.root.classList.toggle('odd', index % 2 === 1);
                data.elementDisposables.push(addDisposableListener(data.icon, 'error', () => data.icon.src = element.marketplaceInfo?.iconUrlFallback || DefaultIconPath, { once: true }));
                data.icon.src = element.marketplaceInfo?.iconUrl || DefaultIconPath;
                if (!data.icon.complete) {
                    data.icon.style.visibility = 'hidden';
                    data.icon.onload = () => data.icon.style.visibility = 'inherit';
                }
                else {
                    data.icon.style.visibility = 'inherit';
                }
                data.name.textContent = (element.marketplaceInfo?.displayName || element.description.identifier.value).substr(0, 50);
                data.version.textContent = element.description.version;
                const activationTimes = element.status.activationTimes;
                const syncTime = activationTimes.codeLoadingTime + activationTimes.activateCallTime;
                data.activationTime.textContent = activationTimes.activationReason.startup ? `Startup Activation: ${syncTime}ms` : `Activation: ${syncTime}ms`;
                data.actionbar.clear();
                const slowExtensionAction = this._createSlowExtensionAction(element);
                if (slowExtensionAction) {
                    data.actionbar.push(slowExtensionAction, { icon: true, label: true });
                }
                if (isNonEmptyArray(element.status.runtimeErrors)) {
                    const reportExtensionIssueAction = this._createReportExtensionIssueAction(element);
                    if (reportExtensionIssueAction) {
                        data.actionbar.push(reportExtensionIssueAction, { icon: true, label: true });
                    }
                }
                let title;
                const activationId = activationTimes.activationReason.extensionId.value;
                const activationEvent = activationTimes.activationReason.activationEvent;
                if (activationEvent === '*') {
                    title = nls.localize({
                        key: 'starActivation',
                        comment: [
                            '{0} will be an extension identifier'
                        ]
                    }, "Activated by {0} on start-up", activationId);
                }
                else if (/^workspaceContains:/.test(activationEvent)) {
                    const fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
                    if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0) {
                        title = nls.localize({
                            key: 'workspaceContainsGlobActivation',
                            comment: [
                                '{0} will be a glob pattern',
                                '{1} will be an extension identifier'
                            ]
                        }, "Activated by {1} because a file matching {0} exists in your workspace", fileNameOrGlob, activationId);
                    }
                    else {
                        title = nls.localize({
                            key: 'workspaceContainsFileActivation',
                            comment: [
                                '{0} will be a file name',
                                '{1} will be an extension identifier'
                            ]
                        }, "Activated by {1} because file {0} exists in your workspace", fileNameOrGlob, activationId);
                    }
                }
                else if (/^workspaceContainsTimeout:/.test(activationEvent)) {
                    const glob = activationEvent.substr('workspaceContainsTimeout:'.length);
                    title = nls.localize({
                        key: 'workspaceContainsTimeout',
                        comment: [
                            '{0} will be a glob pattern',
                            '{1} will be an extension identifier'
                        ]
                    }, "Activated by {1} because searching for {0} took too long", glob, activationId);
                }
                else if (activationEvent === 'onStartupFinished') {
                    title = nls.localize({
                        key: 'startupFinishedActivation',
                        comment: [
                            'This refers to an extension. {0} will be an activation event.'
                        ]
                    }, "Activated by {0} after start-up finished", activationId);
                }
                else if (/^onLanguage:/.test(activationEvent)) {
                    const language = activationEvent.substr('onLanguage:'.length);
                    title = nls.localize('languageActivation', "Activated by {1} because you opened a {0} file", language, activationId);
                }
                else {
                    title = nls.localize({
                        key: 'workspaceGenericActivation',
                        comment: [
                            '{0} will be an activation event, like e.g. \'language:typescript\', \'debug\', etc.',
                            '{1} will be an extension identifier'
                        ]
                    }, "Activated by {1} on {0}", activationEvent, activationId);
                }
                data.activationTime.title = title;
                clearNode(data.msgContainer);
                if (this._getUnresponsiveProfile(element.description.identifier)) {
                    const el = $('span', undefined, ...renderLabelWithIcons(` $(alert) Unresponsive`));
                    el.title = nls.localize('unresponsive.title', "Extension has caused the extension host to freeze.");
                    data.msgContainer.appendChild(el);
                }
                if (isNonEmptyArray(element.status.runtimeErrors)) {
                    const el = $('span', undefined, ...renderLabelWithIcons(`$(bug) ${nls.localize('errors', "{0} uncaught errors", element.status.runtimeErrors.length)}`));
                    data.msgContainer.appendChild(el);
                }
                if (element.status.messages && element.status.messages.length > 0) {
                    const el = $('span', undefined, ...renderLabelWithIcons(`$(alert) ${element.status.messages[0].message}`));
                    data.msgContainer.appendChild(el);
                }
                let extraLabel = null;
                if (element.status.runningLocation && element.status.runningLocation.equals(new LocalWebWorkerRunningLocation(0))) {
                    extraLabel = `$(globe) web worker`;
                }
                else if (element.description.extensionLocation.scheme === Schemas.vscodeRemote) {
                    const hostLabel = this._labelService.getHostLabel(Schemas.vscodeRemote, this._environmentService.remoteAuthority);
                    if (hostLabel) {
                        extraLabel = `$(remote) ${hostLabel}`;
                    }
                    else {
                        extraLabel = `$(remote) ${element.description.extensionLocation.authority}`;
                    }
                }
                else if (element.status.runningLocation && element.status.runningLocation.affinity > 0) {
                    extraLabel = element.status.runningLocation instanceof LocalWebWorkerRunningLocation
                        ? `$(globe) web worker ${element.status.runningLocation.affinity + 1}`
                        : `$(server-process) local process ${element.status.runningLocation.affinity + 1}`;
                }
                if (extraLabel) {
                    const el = $('span', undefined, ...renderLabelWithIcons(extraLabel));
                    data.msgContainer.appendChild(el);
                }
                if (element.profileInfo) {
                    data.profileTime.textContent = `Profile: ${(element.profileInfo.totalTime / 1000).toFixed(2)}ms`;
                }
                else {
                    data.profileTime.textContent = '';
                }
            },
            disposeTemplate: (data) => {
                data.disposables = dispose(data.disposables);
            }
        };
        this._list = this._instantiationService.createInstance(WorkbenchList, 'RuntimeExtensions', parent, delegate, [renderer], {
            multipleSelectionSupport: false,
            setRowLineHeight: false,
            horizontalScrolling: false,
            overrideStyles: {
                listBackground: editorBackground
            },
            accessibilityProvider: new class {
                getWidgetAriaLabel() {
                    return nls.localize('runtimeExtensions', "Runtime Extensions");
                }
                getAriaLabel(element) {
                    return element.description.name;
                }
            }
        });
        this._list.splice(0, this._list.length, this._elements || undefined);
        this._list.onContextMenu((e) => {
            if (!e.element) {
                return;
            }
            const actions = [];
            actions.push(new Action('runtimeExtensionsEditor.action.copyId', nls.localize('copy id', "Copy id ({0})", e.element.description.identifier.value), undefined, true, () => {
                this._clipboardService.writeText(e.element.description.identifier.value);
            }));
            const reportExtensionIssueAction = this._createReportExtensionIssueAction(e.element);
            if (reportExtensionIssueAction) {
                actions.push(reportExtensionIssueAction);
            }
            actions.push(new Separator());
            if (e.element.marketplaceInfo) {
                actions.push(new Action('runtimeExtensionsEditor.action.disableWorkspace', nls.localize('disable workspace', "Disable (Workspace)"), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 7 /* EnablementState.DisabledWorkspace */)));
                actions.push(new Action('runtimeExtensionsEditor.action.disable', nls.localize('disable', "Disable"), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 6 /* EnablementState.DisabledGlobally */)));
            }
            actions.push(new Separator());
            const profileAction = this._createProfileAction();
            if (profileAction) {
                actions.push(profileAction);
            }
            const saveExtensionHostProfileAction = this.saveExtensionHostProfileAction;
            if (saveExtensionHostProfileAction) {
                actions.push(saveExtensionHostProfileAction);
            }
            this._contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions
            });
        });
    }
    get saveExtensionHostProfileAction() {
        return this._createSaveExtensionHostProfileAction();
    }
    layout(dimension) {
        this._list?.layout(dimension.height);
    }
};
__decorate([
    memoize
], AbstractRuntimeExtensionsEditor.prototype, "saveExtensionHostProfileAction", null);
AbstractRuntimeExtensionsEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IContextKeyService),
    __param(3, IExtensionsWorkbenchService),
    __param(4, IExtensionService),
    __param(5, INotificationService),
    __param(6, IContextMenuService),
    __param(7, IInstantiationService),
    __param(8, IStorageService),
    __param(9, ILabelService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IClipboardService)
], AbstractRuntimeExtensionsEditor);
export { AbstractRuntimeExtensionsEditor };
export class ShowRuntimeExtensionsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.showRuntimeExtensions',
            title: { value: nls.localize('showRuntimeExtensions', "Show Running Extensions"), original: 'Show Running Extensions' },
            category: Categories.Developer,
            f1: true,
            menu: {
                id: MenuId.ViewContainerTitle,
                when: ContextKeyExpr.equals('viewContainer', 'workbench.view.extensions'),
                group: '2_enablement',
                order: 3
            }
        });
    }
    async run(accessor) {
        await accessor.get(IEditorService).openEditor(RuntimeExtensionsInput.instance, { pinned: true });
    }
}
