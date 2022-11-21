import 'vs/css!./media/extensionsWidgets';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IExtension, IExtensionsWorkbenchService, IExtensionContainer } from 'vs/workbench/contrib/extensions/common/extensions';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { ExtensionStatusAction } from 'vs/workbench/contrib/extensions/browser/extensionsActions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { HoverPosition } from 'vs/base/browser/ui/hover/hoverWidget';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare abstract class ExtensionWidget extends Disposable implements IExtensionContainer {
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    update(): void;
    abstract render(): void;
}
export declare function onClick(element: HTMLElement, callback: () => void): IDisposable;
export declare class InstallCountWidget extends ExtensionWidget {
    private container;
    private small;
    constructor(container: HTMLElement, small: boolean);
    render(): void;
    static getInstallLabel(extension: IExtension, small: boolean): string | undefined;
}
export declare class RatingsWidget extends ExtensionWidget {
    private container;
    private small;
    constructor(container: HTMLElement, small: boolean);
    render(): void;
}
export declare class SponsorWidget extends ExtensionWidget {
    private container;
    private readonly openerService;
    private readonly telemetryService;
    private disposables;
    constructor(container: HTMLElement, openerService: IOpenerService, telemetryService: ITelemetryService);
    render(): void;
}
export declare class RecommendationWidget extends ExtensionWidget {
    private parent;
    private readonly extensionRecommendationsService;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService);
    private clear;
    render(): void;
}
export declare class PreReleaseBookmarkWidget extends ExtensionWidget {
    private parent;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class RemoteBadgeWidget extends ExtensionWidget {
    private readonly tooltip;
    private readonly extensionManagementServerService;
    private readonly instantiationService;
    private readonly remoteBadge;
    private element;
    constructor(parent: HTMLElement, tooltip: boolean, extensionManagementServerService: IExtensionManagementServerService, instantiationService: IInstantiationService);
    private clear;
    render(): void;
}
export declare class ExtensionPackCountWidget extends ExtensionWidget {
    private readonly parent;
    private element;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class SyncIgnoredWidget extends ExtensionWidget {
    private readonly container;
    private readonly configurationService;
    private readonly extensionsWorkbenchService;
    private readonly userDataSyncEnablementService;
    constructor(container: HTMLElement, configurationService: IConfigurationService, extensionsWorkbenchService: IExtensionsWorkbenchService, userDataSyncEnablementService: IUserDataSyncEnablementService);
    render(): void;
}
export declare class ExtensionActivationStatusWidget extends ExtensionWidget {
    private readonly container;
    private readonly small;
    private readonly extensionsWorkbenchService;
    constructor(container: HTMLElement, small: boolean, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    render(): void;
}
export declare type ExtensionHoverOptions = {
    position: () => HoverPosition;
    readonly target: HTMLElement;
};
export declare class ExtensionHoverWidget extends ExtensionWidget {
    private readonly options;
    private readonly extensionStatusAction;
    private readonly extensionsWorkbenchService;
    private readonly hoverService;
    private readonly configurationService;
    private readonly extensionRecommendationsService;
    private readonly themeService;
    private readonly hover;
    constructor(options: ExtensionHoverOptions, extensionStatusAction: ExtensionStatusAction, extensionsWorkbenchService: IExtensionsWorkbenchService, hoverService: IHoverService, configurationService: IConfigurationService, extensionRecommendationsService: IExtensionRecommendationsService, themeService: IThemeService);
    render(): void;
    private getHoverMarkdown;
    private getRecommendationMessage;
    static getPreReleaseMessage(extension: IExtension): string | undefined;
}
export declare class ExtensionStatusWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionStatusAction;
    private readonly openerService;
    private readonly renderDisposables;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionStatusAction: ExtensionStatusAction, openerService: IOpenerService);
    render(): void;
}
export declare class ExtensionRecommendationWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionRecommendationsService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService);
    render(): void;
    private getRecommendationStatus;
}
export declare const extensionRatingIconColor: string;
export declare const extensionVerifiedPublisherIconColor: string;
export declare const extensionPreReleaseIconColor: string;
export declare const extensionSponsorIconColor: string;
