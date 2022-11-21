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
import 'vs/css!./media/extensionsWidgets';
import * as semver from 'vs/base/common/semver/semver';
import { Disposable, toDisposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { append, $, reset, addDisposableListener, EventType, finalHandler } from 'vs/base/browser/dom';
import * as platform from 'vs/base/common/platform';
import { localize } from 'vs/nls';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { ILabelService } from 'vs/platform/label/common/label';
import { extensionButtonProminentBackground } from 'vs/workbench/contrib/extensions/browser/extensionsActions';
import { IThemeService, ThemeIcon, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { EXTENSION_BADGE_REMOTE_BACKGROUND, EXTENSION_BADGE_REMOTE_FOREGROUND } from 'vs/workbench/common/theme';
import { Emitter, Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { activationTimeIcon, errorIcon, infoIcon, installCountIcon, preReleaseIcon, ratingIcon, remoteIcon, sponsorIcon, starEmptyIcon, starFullIcon, starHalfIcon, syncIgnoredIcon, verifiedPublisherIcon, warningIcon } from 'vs/workbench/contrib/extensions/browser/extensionsIcons';
import { registerColor, textLinkForeground } from 'vs/platform/theme/common/colorRegistry';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { URI } from 'vs/base/common/uri';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import Severity from 'vs/base/common/severity';
import { setupCustomHover } from 'vs/base/browser/ui/iconLabel/iconLabelHover';
import { Color } from 'vs/base/common/color';
import { renderMarkdown } from 'vs/base/browser/markdownRenderer';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { onUnexpectedError } from 'vs/base/common/errors';
import { renderIcon } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export class ExtensionWidget extends Disposable {
    _extension = null;
    get extension() { return this._extension; }
    set extension(extension) { this._extension = extension; this.update(); }
    update() { this.render(); }
}
export function onClick(element, callback) {
    const disposables = new DisposableStore();
    disposables.add(addDisposableListener(element, EventType.CLICK, finalHandler(callback)));
    disposables.add(addDisposableListener(element, EventType.KEY_UP, e => {
        const keyboardEvent = new StandardKeyboardEvent(e);
        if (keyboardEvent.equals(10 /* KeyCode.Space */) || keyboardEvent.equals(3 /* KeyCode.Enter */)) {
            e.preventDefault();
            e.stopPropagation();
            callback();
        }
    }));
    return disposables;
}
export class InstallCountWidget extends ExtensionWidget {
    container;
    small;
    constructor(container, small) {
        super();
        this.container = container;
        this.small = small;
        container.classList.add('extension-install-count');
        this.render();
    }
    render() {
        this.container.innerText = '';
        if (!this.extension) {
            return;
        }
        if (this.small && this.extension.state === 1 /* ExtensionState.Installed */) {
            return;
        }
        const installLabel = InstallCountWidget.getInstallLabel(this.extension, this.small);
        if (!installLabel) {
            return;
        }
        append(this.container, $('span' + ThemeIcon.asCSSSelector(installCountIcon)));
        const count = append(this.container, $('span.count'));
        count.textContent = installLabel;
    }
    static getInstallLabel(extension, small) {
        const installCount = extension.installCount;
        if (installCount === undefined) {
            return undefined;
        }
        let installLabel;
        if (small) {
            if (installCount > 1000000) {
                installLabel = `${Math.floor(installCount / 100000) / 10}M`;
            }
            else if (installCount > 1000) {
                installLabel = `${Math.floor(installCount / 1000)}K`;
            }
            else {
                installLabel = String(installCount);
            }
        }
        else {
            installLabel = installCount.toLocaleString(platform.locale);
        }
        return installLabel;
    }
}
export class RatingsWidget extends ExtensionWidget {
    container;
    small;
    constructor(container, small) {
        super();
        this.container = container;
        this.small = small;
        container.classList.add('extension-ratings');
        if (this.small) {
            container.classList.add('small');
        }
        this.render();
    }
    render() {
        this.container.innerText = '';
        this.container.title = '';
        if (!this.extension) {
            return;
        }
        if (this.small && this.extension.state === 1 /* ExtensionState.Installed */) {
            return;
        }
        if (this.extension.rating === undefined) {
            return;
        }
        if (this.small && !this.extension.ratingCount) {
            return;
        }
        const rating = Math.round(this.extension.rating * 2) / 2;
        this.container.title = localize('ratedLabel', "Average rating: {0} out of 5", rating);
        if (this.small) {
            append(this.container, $('span' + ThemeIcon.asCSSSelector(starFullIcon)));
            const count = append(this.container, $('span.count'));
            count.textContent = String(rating);
        }
        else {
            for (let i = 1; i <= 5; i++) {
                if (rating >= i) {
                    append(this.container, $('span' + ThemeIcon.asCSSSelector(starFullIcon)));
                }
                else if (rating >= i - 0.5) {
                    append(this.container, $('span' + ThemeIcon.asCSSSelector(starHalfIcon)));
                }
                else {
                    append(this.container, $('span' + ThemeIcon.asCSSSelector(starEmptyIcon)));
                }
            }
            if (this.extension.ratingCount) {
                const ratingCountElemet = append(this.container, $('span', undefined, ` (${this.extension.ratingCount})`));
                ratingCountElemet.style.paddingLeft = '1px';
            }
        }
    }
}
let SponsorWidget = class SponsorWidget extends ExtensionWidget {
    container;
    openerService;
    telemetryService;
    disposables = this._register(new DisposableStore());
    constructor(container, openerService, telemetryService) {
        super();
        this.container = container;
        this.openerService = openerService;
        this.telemetryService = telemetryService;
        this.render();
    }
    render() {
        reset(this.container);
        this.disposables.clear();
        if (!this.extension?.publisherSponsorLink) {
            return;
        }
        const sponsor = append(this.container, $('span.sponsor.clickable', { tabIndex: 0, title: this.extension?.publisherSponsorLink }));
        sponsor.setAttribute('role', 'link'); // #132645
        const sponsorIconElement = renderIcon(sponsorIcon);
        const label = $('span', undefined, localize('sponsor', "Sponsor"));
        append(sponsor, sponsorIconElement, label);
        this.disposables.add(onClick(sponsor, () => {
            this.telemetryService.publicLog2('extensionsAction.sponsorExtension', { extensionId: this.extension.identifier.id });
            this.openerService.open(this.extension.publisherSponsorLink);
        }));
    }
};
SponsorWidget = __decorate([
    __param(1, IOpenerService),
    __param(2, ITelemetryService)
], SponsorWidget);
export { SponsorWidget };
let RecommendationWidget = class RecommendationWidget extends ExtensionWidget {
    parent;
    extensionRecommendationsService;
    element;
    disposables = this._register(new DisposableStore());
    constructor(parent, extensionRecommendationsService) {
        super();
        this.parent = parent;
        this.extensionRecommendationsService = extensionRecommendationsService;
        this.render();
        this._register(toDisposable(() => this.clear()));
        this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
    }
    clear() {
        if (this.element) {
            this.parent.removeChild(this.element);
        }
        this.element = undefined;
        this.disposables.clear();
    }
    render() {
        this.clear();
        if (!this.extension || this.extension.state === 1 /* ExtensionState.Installed */ || this.extension.deprecationInfo) {
            return;
        }
        const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
        if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
            this.element = append(this.parent, $('div.extension-bookmark'));
            const recommendation = append(this.element, $('.recommendation'));
            append(recommendation, $('span' + ThemeIcon.asCSSSelector(ratingIcon)));
        }
    }
};
RecommendationWidget = __decorate([
    __param(1, IExtensionRecommendationsService)
], RecommendationWidget);
export { RecommendationWidget };
export class PreReleaseBookmarkWidget extends ExtensionWidget {
    parent;
    element;
    disposables = this._register(new DisposableStore());
    constructor(parent) {
        super();
        this.parent = parent;
        this.render();
        this._register(toDisposable(() => this.clear()));
    }
    clear() {
        if (this.element) {
            this.parent.removeChild(this.element);
        }
        this.element = undefined;
        this.disposables.clear();
    }
    render() {
        this.clear();
        if (!this.extension) {
            return;
        }
        if (!this.extension.hasPreReleaseVersion) {
            return;
        }
        if (this.extension.state === 1 /* ExtensionState.Installed */ && !this.extension.local?.isPreReleaseVersion) {
            return;
        }
        this.element = append(this.parent, $('div.extension-bookmark'));
        const preRelease = append(this.element, $('.pre-release'));
        append(preRelease, $('span' + ThemeIcon.asCSSSelector(preReleaseIcon)));
    }
}
let RemoteBadgeWidget = class RemoteBadgeWidget extends ExtensionWidget {
    tooltip;
    extensionManagementServerService;
    instantiationService;
    remoteBadge = this._register(new MutableDisposable());
    element;
    constructor(parent, tooltip, extensionManagementServerService, instantiationService) {
        super();
        this.tooltip = tooltip;
        this.extensionManagementServerService = extensionManagementServerService;
        this.instantiationService = instantiationService;
        this.element = append(parent, $('.extension-remote-badge-container'));
        this.render();
        this._register(toDisposable(() => this.clear()));
    }
    clear() {
        if (this.remoteBadge.value) {
            this.element.removeChild(this.remoteBadge.value.element);
        }
        this.remoteBadge.clear();
    }
    render() {
        this.clear();
        if (!this.extension || !this.extension.local || !this.extension.server || !(this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) || this.extension.server !== this.extensionManagementServerService.remoteExtensionManagementServer) {
            return;
        }
        this.remoteBadge.value = this.instantiationService.createInstance(RemoteBadge, this.tooltip);
        append(this.element, this.remoteBadge.value.element);
    }
};
RemoteBadgeWidget = __decorate([
    __param(2, IExtensionManagementServerService),
    __param(3, IInstantiationService)
], RemoteBadgeWidget);
export { RemoteBadgeWidget };
let RemoteBadge = class RemoteBadge extends Disposable {
    tooltip;
    labelService;
    themeService;
    extensionManagementServerService;
    element;
    constructor(tooltip, labelService, themeService, extensionManagementServerService) {
        super();
        this.tooltip = tooltip;
        this.labelService = labelService;
        this.themeService = themeService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.element = $('div.extension-badge.extension-remote-badge');
        this.render();
    }
    render() {
        append(this.element, $('span' + ThemeIcon.asCSSSelector(remoteIcon)));
        const applyBadgeStyle = () => {
            if (!this.element) {
                return;
            }
            const bgColor = this.themeService.getColorTheme().getColor(EXTENSION_BADGE_REMOTE_BACKGROUND);
            const fgColor = this.themeService.getColorTheme().getColor(EXTENSION_BADGE_REMOTE_FOREGROUND);
            this.element.style.backgroundColor = bgColor ? bgColor.toString() : '';
            this.element.style.color = fgColor ? fgColor.toString() : '';
        };
        applyBadgeStyle();
        this._register(this.themeService.onDidColorThemeChange(() => applyBadgeStyle()));
        if (this.tooltip) {
            const updateTitle = () => {
                if (this.element && this.extensionManagementServerService.remoteExtensionManagementServer) {
                    this.element.title = localize('remote extension title', "Extension in {0}", this.extensionManagementServerService.remoteExtensionManagementServer.label);
                }
            };
            this._register(this.labelService.onDidChangeFormatters(() => updateTitle()));
            updateTitle();
        }
    }
};
RemoteBadge = __decorate([
    __param(1, ILabelService),
    __param(2, IThemeService),
    __param(3, IExtensionManagementServerService)
], RemoteBadge);
export class ExtensionPackCountWidget extends ExtensionWidget {
    parent;
    element;
    constructor(parent) {
        super();
        this.parent = parent;
        this.render();
        this._register(toDisposable(() => this.clear()));
    }
    clear() {
        this.element?.remove();
    }
    render() {
        this.clear();
        if (!this.extension || !(this.extension.categories?.some(category => category.toLowerCase() === 'extension packs')) || !this.extension.extensionPack.length) {
            return;
        }
        this.element = append(this.parent, $('.extension-badge.extension-pack-badge'));
        const countBadge = new CountBadge(this.element);
        countBadge.setCount(this.extension.extensionPack.length);
    }
}
let SyncIgnoredWidget = class SyncIgnoredWidget extends ExtensionWidget {
    container;
    configurationService;
    extensionsWorkbenchService;
    userDataSyncEnablementService;
    constructor(container, configurationService, extensionsWorkbenchService, userDataSyncEnablementService) {
        super();
        this.container = container;
        this.configurationService = configurationService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this._register(Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectedKeys.includes('settingsSync.ignoredExtensions'))(() => this.render()));
        this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
        this.render();
    }
    render() {
        this.container.innerText = '';
        if (this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.userDataSyncEnablementService.isEnabled() && this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension)) {
            const element = append(this.container, $('span.extension-sync-ignored' + ThemeIcon.asCSSSelector(syncIgnoredIcon)));
            element.title = localize('syncingore.label', "This extension is ignored during sync.");
            element.classList.add(...ThemeIcon.asClassNameArray(syncIgnoredIcon));
        }
    }
};
SyncIgnoredWidget = __decorate([
    __param(1, IConfigurationService),
    __param(2, IExtensionsWorkbenchService),
    __param(3, IUserDataSyncEnablementService)
], SyncIgnoredWidget);
export { SyncIgnoredWidget };
let ExtensionActivationStatusWidget = class ExtensionActivationStatusWidget extends ExtensionWidget {
    container;
    small;
    extensionsWorkbenchService;
    constructor(container, small, extensionService, extensionsWorkbenchService) {
        super();
        this.container = container;
        this.small = small;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this._register(extensionService.onDidChangeExtensionsStatus(extensions => {
            if (this.extension && extensions.some(e => areSameExtensions({ id: e.value }, this.extension.identifier))) {
                this.update();
            }
        }));
    }
    render() {
        this.container.innerText = '';
        if (!this.extension) {
            return;
        }
        const extensionStatus = this.extensionsWorkbenchService.getExtensionStatus(this.extension);
        if (!extensionStatus || !extensionStatus.activationTimes) {
            return;
        }
        const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
        if (this.small) {
            append(this.container, $('span' + ThemeIcon.asCSSSelector(activationTimeIcon)));
            const activationTimeElement = append(this.container, $('span.activationTime'));
            activationTimeElement.textContent = `${activationTime}ms`;
        }
        else {
            const activationTimeElement = append(this.container, $('span.activationTime'));
            activationTimeElement.textContent = `${localize('activation', "Activation time")}${extensionStatus.activationTimes.activationReason.startup ? ` (${localize('startup', "Startup")})` : ''} : ${activationTime}ms`;
        }
    }
};
ExtensionActivationStatusWidget = __decorate([
    __param(2, IExtensionService),
    __param(3, IExtensionsWorkbenchService)
], ExtensionActivationStatusWidget);
export { ExtensionActivationStatusWidget };
let ExtensionHoverWidget = class ExtensionHoverWidget extends ExtensionWidget {
    options;
    extensionStatusAction;
    extensionsWorkbenchService;
    hoverService;
    configurationService;
    extensionRecommendationsService;
    themeService;
    hover = this._register(new MutableDisposable());
    constructor(options, extensionStatusAction, extensionsWorkbenchService, hoverService, configurationService, extensionRecommendationsService, themeService) {
        super();
        this.options = options;
        this.extensionStatusAction = extensionStatusAction;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.hoverService = hoverService;
        this.configurationService = configurationService;
        this.extensionRecommendationsService = extensionRecommendationsService;
        this.themeService = themeService;
    }
    render() {
        this.hover.value = undefined;
        if (this.extension) {
            this.hover.value = setupCustomHover({
                delay: this.configurationService.getValue('workbench.hover.delay'),
                showHover: (options) => {
                    return this.hoverService.showHover({
                        ...options,
                        hoverPosition: this.options.position(),
                        forcePosition: true,
                        additionalClasses: ['extension-hover']
                    });
                },
                placement: 'element'
            }, this.options.target, { markdown: () => Promise.resolve(this.getHoverMarkdown()), markdownNotSupportedFallback: undefined });
        }
    }
    getHoverMarkdown() {
        if (!this.extension) {
            return undefined;
        }
        const markdown = new MarkdownString('', { isTrusted: true, supportThemeIcons: true });
        markdown.appendMarkdown(`**${this.extension.displayName}**`);
        if (semver.valid(this.extension.version)) {
            markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.version}_**&nbsp;</span>`);
        }
        if (this.extension.state === 1 /* ExtensionState.Installed */ ? this.extension.local?.isPreReleaseVersion : this.extension.gallery?.properties.isPreReleaseVersion) {
            const extensionPreReleaseIcon = this.themeService.getColorTheme().getColor(extensionPreReleaseIconColor);
            markdown.appendMarkdown(`**&nbsp;**&nbsp;<span style="color:#ffffff;background-color:${extensionPreReleaseIcon ? Color.Format.CSS.formatHex(extensionPreReleaseIcon) : '#ffffff'};">&nbsp;$(${preReleaseIcon.id})&nbsp;${localize('pre-release-label', "Pre-Release")}&nbsp;</span>`);
        }
        markdown.appendText(`\n`);
        if (this.extension.state === 1 /* ExtensionState.Installed */) {
            let addSeparator = false;
            const installLabel = InstallCountWidget.getInstallLabel(this.extension, true);
            if (installLabel) {
                if (addSeparator) {
                    markdown.appendText(`  |  `);
                }
                markdown.appendMarkdown(`$(${installCountIcon.id}) ${installLabel}`);
                addSeparator = true;
            }
            if (this.extension.rating) {
                if (addSeparator) {
                    markdown.appendText(`  |  `);
                }
                const rating = Math.round(this.extension.rating * 2) / 2;
                markdown.appendMarkdown(`$(${starFullIcon.id}) [${rating}](${this.extension.url}&ssr=false#review-details)`);
                addSeparator = true;
            }
            if (this.extension.publisherSponsorLink) {
                if (addSeparator) {
                    markdown.appendText(`  |  `);
                }
                markdown.appendMarkdown(`$(${sponsorIcon.id}) [${localize('sponsor', "Sponsor")}](${this.extension.publisherSponsorLink})`);
                addSeparator = true;
            }
            if (addSeparator) {
                markdown.appendText(`\n`);
            }
        }
        if (this.extension.description) {
            markdown.appendMarkdown(`${this.extension.description}`);
            markdown.appendText(`\n`);
        }
        if (this.extension.publisherDomain?.verified) {
            const bgColor = this.themeService.getColorTheme().getColor(extensionVerifiedPublisherIconColor);
            const publisherVerifiedTooltip = localize('publisher verified tooltip', "This publisher has verified ownership of {0}", `[${URI.parse(this.extension.publisherDomain.link).authority}](${this.extension.publisherDomain.link})`);
            markdown.appendMarkdown(`<span style="color:${bgColor ? Color.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${verifiedPublisherIcon.id})</span>&nbsp;${publisherVerifiedTooltip}`);
            markdown.appendText(`\n`);
        }
        if (this.extension.outdated) {
            markdown.appendMarkdown(localize('updateRequired', "Latest version:"));
            markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.latestVersion}_**&nbsp;</span>`);
            markdown.appendText(`\n`);
        }
        const preReleaseMessage = ExtensionHoverWidget.getPreReleaseMessage(this.extension);
        const extensionRuntimeStatus = this.extensionsWorkbenchService.getExtensionStatus(this.extension);
        const extensionStatus = this.extensionStatusAction.status;
        const reloadRequiredMessage = this.extension.reloadRequiredStatus;
        const recommendationMessage = this.getRecommendationMessage(this.extension);
        if (extensionRuntimeStatus || extensionStatus || reloadRequiredMessage || recommendationMessage || preReleaseMessage) {
            markdown.appendMarkdown(`---`);
            markdown.appendText(`\n`);
            if (extensionRuntimeStatus) {
                if (extensionRuntimeStatus.activationTimes) {
                    const activationTime = extensionRuntimeStatus.activationTimes.codeLoadingTime + extensionRuntimeStatus.activationTimes.activateCallTime;
                    markdown.appendMarkdown(`${localize('activation', "Activation time")}${extensionRuntimeStatus.activationTimes.activationReason.startup ? ` (${localize('startup', "Startup")})` : ''}: \`${activationTime}ms\``);
                    markdown.appendText(`\n`);
                }
                if (extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.length) {
                    const hasErrors = extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.some(message => message.type === Severity.Error);
                    const hasWarnings = extensionRuntimeStatus.messages.some(message => message.type === Severity.Warning);
                    const errorsLink = extensionRuntimeStatus.runtimeErrors.length ? `[${extensionRuntimeStatus.runtimeErrors.length === 1 ? localize('uncaught error', '1 uncaught error') : localize('uncaught errors', '{0} uncaught errors', extensionRuntimeStatus.runtimeErrors.length)}](${URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                    const messageLink = extensionRuntimeStatus.messages.length ? `[${extensionRuntimeStatus.messages.length === 1 ? localize('message', '1 message') : localize('messages', '{0} messages', extensionRuntimeStatus.messages.length)}](${URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                    markdown.appendMarkdown(`$(${hasErrors ? errorIcon.id : hasWarnings ? warningIcon.id : infoIcon.id}) This extension has reported `);
                    if (errorsLink && messageLink) {
                        markdown.appendMarkdown(`${errorsLink} and ${messageLink}`);
                    }
                    else {
                        markdown.appendMarkdown(`${errorsLink || messageLink}`);
                    }
                    markdown.appendText(`\n`);
                }
            }
            if (extensionStatus) {
                if (extensionStatus.icon) {
                    markdown.appendMarkdown(`$(${extensionStatus.icon.id})&nbsp;`);
                }
                markdown.appendMarkdown(extensionStatus.message.value);
                if (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.extension.local) {
                    markdown.appendMarkdown(`&nbsp;[${localize('dependencies', "Show Dependencies")}](${URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "dependencies" /* ExtensionEditorTab.Dependencies */]))}`)})`);
                }
                markdown.appendText(`\n`);
            }
            if (reloadRequiredMessage) {
                markdown.appendMarkdown(`$(${infoIcon.id})&nbsp;`);
                markdown.appendMarkdown(`${reloadRequiredMessage}`);
                markdown.appendText(`\n`);
            }
            if (preReleaseMessage) {
                const extensionPreReleaseIcon = this.themeService.getColorTheme().getColor(extensionPreReleaseIconColor);
                markdown.appendMarkdown(`<span style="color:${extensionPreReleaseIcon ? Color.Format.CSS.formatHex(extensionPreReleaseIcon) : '#ffffff'};">$(${preReleaseIcon.id})</span>&nbsp;${preReleaseMessage}`);
                markdown.appendText(`\n`);
            }
            if (recommendationMessage) {
                markdown.appendMarkdown(recommendationMessage);
                markdown.appendText(`\n`);
            }
        }
        return markdown;
    }
    getRecommendationMessage(extension) {
        if (extension.state === 1 /* ExtensionState.Installed */) {
            return undefined;
        }
        if (extension.deprecationInfo) {
            return undefined;
        }
        const recommendation = this.extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()];
        if (!recommendation?.reasonText) {
            return undefined;
        }
        const bgColor = this.themeService.getColorTheme().getColor(extensionButtonProminentBackground);
        return `<span style="color:${bgColor ? Color.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${starEmptyIcon.id})</span>&nbsp;${recommendation.reasonText}`;
    }
    static getPreReleaseMessage(extension) {
        if (!extension.hasPreReleaseVersion) {
            return undefined;
        }
        if (extension.isBuiltin) {
            return undefined;
        }
        if (extension.local?.isPreReleaseVersion || extension.gallery?.properties.isPreReleaseVersion) {
            return undefined;
        }
        const preReleaseVersionLink = `[${localize('Show prerelease version', "Pre-Release version")}](${URI.parse(`command:workbench.extensions.action.showPreReleaseVersion?${encodeURIComponent(JSON.stringify([extension.identifier.id]))}`)})`;
        return localize('has prerelease', "This extension has a {0} available", preReleaseVersionLink);
    }
};
ExtensionHoverWidget = __decorate([
    __param(2, IExtensionsWorkbenchService),
    __param(3, IHoverService),
    __param(4, IConfigurationService),
    __param(5, IExtensionRecommendationsService),
    __param(6, IThemeService)
], ExtensionHoverWidget);
export { ExtensionHoverWidget };
let ExtensionStatusWidget = class ExtensionStatusWidget extends ExtensionWidget {
    container;
    extensionStatusAction;
    openerService;
    renderDisposables = this._register(new DisposableStore());
    _onDidRender = this._register(new Emitter());
    onDidRender = this._onDidRender.event;
    constructor(container, extensionStatusAction, openerService) {
        super();
        this.container = container;
        this.extensionStatusAction = extensionStatusAction;
        this.openerService = openerService;
        this.render();
        this._register(extensionStatusAction.onDidChangeStatus(() => this.render()));
    }
    render() {
        reset(this.container);
        const extensionStatus = this.extensionStatusAction.status;
        if (extensionStatus) {
            const markdown = new MarkdownString('', { isTrusted: true, supportThemeIcons: true });
            if (extensionStatus.icon) {
                markdown.appendMarkdown(`$(${extensionStatus.icon.id})&nbsp;`);
            }
            markdown.appendMarkdown(extensionStatus.message.value);
            const rendered = this.renderDisposables.add(renderMarkdown(markdown, {
                actionHandler: {
                    callback: (content) => {
                        this.openerService.open(content, { allowCommands: true }).catch(onUnexpectedError);
                    },
                    disposables: this.renderDisposables
                }
            }));
            append(this.container, rendered.element);
        }
        this._onDidRender.fire();
    }
};
ExtensionStatusWidget = __decorate([
    __param(2, IOpenerService)
], ExtensionStatusWidget);
export { ExtensionStatusWidget };
let ExtensionRecommendationWidget = class ExtensionRecommendationWidget extends ExtensionWidget {
    container;
    extensionRecommendationsService;
    extensionIgnoredRecommendationsService;
    _onDidRender = this._register(new Emitter());
    onDidRender = this._onDidRender.event;
    constructor(container, extensionRecommendationsService, extensionIgnoredRecommendationsService) {
        super();
        this.container = container;
        this.extensionRecommendationsService = extensionRecommendationsService;
        this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
        this.render();
        this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
    }
    render() {
        reset(this.container);
        const recommendationStatus = this.getRecommendationStatus();
        if (recommendationStatus) {
            if (recommendationStatus.icon) {
                append(this.container, $(`div${ThemeIcon.asCSSSelector(recommendationStatus.icon)}`));
            }
            append(this.container, $(`div.recommendation-text`, undefined, recommendationStatus.message));
        }
        this._onDidRender.fire();
    }
    getRecommendationStatus() {
        if (!this.extension
            || this.extension.deprecationInfo
            || this.extension.state === 1 /* ExtensionState.Installed */) {
            return undefined;
        }
        const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
        if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
            const reasonText = extRecommendations[this.extension.identifier.id.toLowerCase()].reasonText;
            if (reasonText) {
                return { icon: starEmptyIcon, message: reasonText };
            }
        }
        else if (this.extensionIgnoredRecommendationsService.globalIgnoredRecommendations.indexOf(this.extension.identifier.id.toLowerCase()) !== -1) {
            return { icon: undefined, message: localize('recommendationHasBeenIgnored', "You have chosen not to receive recommendations for this extension.") };
        }
        return undefined;
    }
};
ExtensionRecommendationWidget = __decorate([
    __param(1, IExtensionRecommendationsService),
    __param(2, IExtensionIgnoredRecommendationsService)
], ExtensionRecommendationWidget);
export { ExtensionRecommendationWidget };
export const extensionRatingIconColor = registerColor('extensionIcon.starForeground', { light: '#DF6100', dark: '#FF8E00', hcDark: '#FF8E00', hcLight: textLinkForeground }, localize('extensionIconStarForeground', "The icon color for extension ratings."), true);
export const extensionVerifiedPublisherIconColor = registerColor('extensionIcon.verifiedForeground', { dark: textLinkForeground, light: textLinkForeground, hcDark: textLinkForeground, hcLight: textLinkForeground }, localize('extensionIconVerifiedForeground', "The icon color for extension verified publisher."), true);
export const extensionPreReleaseIconColor = registerColor('extensionIcon.preReleaseForeground', { dark: '#1d9271', light: '#1d9271', hcDark: '#1d9271', hcLight: textLinkForeground }, localize('extensionPreReleaseForeground', "The icon color for pre-release extension."), true);
export const extensionSponsorIconColor = registerColor('extensionIcon.sponsorForeground', { light: '#B51E78', dark: '#D758B3', hcDark: null, hcLight: '#B51E78' }, localize('extensionIcon.sponsorForeground', "The icon color for extension sponsor."), true);
registerThemingParticipant((theme, collector) => {
    const extensionRatingIcon = theme.getColor(extensionRatingIconColor);
    if (extensionRatingIcon) {
        collector.addRule(`.extension-ratings .codicon-extensions-star-full, .extension-ratings .codicon-extensions-star-half { color: ${extensionRatingIcon}; }`);
        collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(starFullIcon)} { color: ${extensionRatingIcon}; }`);
    }
    const extensionVerifiedPublisherIcon = theme.getColor(extensionVerifiedPublisherIconColor);
    if (extensionVerifiedPublisherIcon) {
        collector.addRule(`${ThemeIcon.asCSSSelector(verifiedPublisherIcon)} { color: ${extensionVerifiedPublisherIcon}; }`);
    }
    collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
    collector.addRule(`.extension-editor > .header > .details > .subtitle .sponsor ${ThemeIcon.asCSSSelector(sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
});
