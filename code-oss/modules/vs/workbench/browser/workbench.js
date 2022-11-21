/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/workbench/browser/style';
import { localize } from 'vs/nls';
import { Event, Emitter, setGlobalLeakWarningThreshold } from 'vs/base/common/event';
import { RunOnceScheduler, runWhenIdle, timeout } from 'vs/base/common/async';
import { isFirefox, isSafari, isChrome, PixelRatio } from 'vs/base/browser/browser';
import { mark } from 'vs/base/common/performance';
import { onUnexpectedError, setUnexpectedErrorHandler } from 'vs/base/common/errors';
import { Registry } from 'vs/platform/registry/common/platform';
import { isWindows, isLinux, isWeb, isNative, isMacintosh } from 'vs/base/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { getSingletonServiceDescriptors } from 'vs/platform/instantiation/common/extensions';
import { IWorkbenchLayoutService, positionToString } from 'vs/workbench/services/layout/browser/layoutService';
import { IStorageService, WillSaveStateReason } from 'vs/platform/storage/common/storage';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { NotificationsCenter } from 'vs/workbench/browser/parts/notifications/notificationsCenter';
import { NotificationsAlerts } from 'vs/workbench/browser/parts/notifications/notificationsAlerts';
import { NotificationsStatus } from 'vs/workbench/browser/parts/notifications/notificationsStatus';
import { NotificationsTelemetry } from 'vs/workbench/browser/parts/notifications/notificationsTelemetry';
import { registerNotificationCommands } from 'vs/workbench/browser/parts/notifications/notificationsCommands';
import { NotificationsToasts } from 'vs/workbench/browser/parts/notifications/notificationsToasts';
import { setARIAContainer } from 'vs/base/browser/ui/aria/aria';
import { FontMeasurements } from 'vs/editor/browser/config/fontMeasurements';
import { BareFontInfo } from 'vs/editor/common/config/fontInfo';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { WorkbenchContextKeysHandler } from 'vs/workbench/browser/contextkeys';
import { coalesce } from 'vs/base/common/arrays';
import { InstantiationService } from 'vs/platform/instantiation/common/instantiationService';
import { Layout } from 'vs/workbench/browser/layout';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
export class Workbench extends Layout {
    options;
    serviceCollection;
    _onWillShutdown = this._register(new Emitter());
    onWillShutdown = this._onWillShutdown.event;
    _onDidShutdown = this._register(new Emitter());
    onDidShutdown = this._onDidShutdown.event;
    constructor(parent, options, serviceCollection, logService) {
        super(parent);
        this.options = options;
        this.serviceCollection = serviceCollection;
        // Perf: measure workbench startup time
        mark('code/willStartWorkbench');
        this.registerErrorHandler(logService);
    }
    registerErrorHandler(logService) {
        // Listen on unhandled rejection events
        window.addEventListener('unhandledrejection', (event) => {
            // See https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
            onUnexpectedError(event.reason);
            // Prevent the printing of this event to the console
            event.preventDefault();
        });
        // Install handler for unexpected errors
        setUnexpectedErrorHandler(error => this.handleUnexpectedError(error, logService));
        if (typeof window.require.config === 'function') {
            window.require.config({
                onError: (err) => {
                    if (err.phase === 'loading') {
                        onUnexpectedError(new Error(localize('loaderErrorNative', "Failed to load a required file. Please restart the application to try again. Details: {0}", JSON.stringify(err))));
                    }
                    console.error(err);
                }
            });
        }
    }
    previousUnexpectedError = { message: undefined, time: 0 };
    handleUnexpectedError(error, logService) {
        const message = toErrorMessage(error, true);
        if (!message) {
            return;
        }
        const now = Date.now();
        if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1000) {
            return; // Return if error message identical to previous and shorter than 1 second
        }
        this.previousUnexpectedError.time = now;
        this.previousUnexpectedError.message = message;
        // Log it
        logService.error(message);
    }
    startup() {
        try {
            // Configure emitter leak warning threshold
            setGlobalLeakWarningThreshold(175);
            // Services
            const instantiationService = this.initServices(this.serviceCollection);
            instantiationService.invokeFunction(accessor => {
                const lifecycleService = accessor.get(ILifecycleService);
                const storageService = accessor.get(IStorageService);
                const configurationService = accessor.get(IConfigurationService);
                const hostService = accessor.get(IHostService);
                const dialogService = accessor.get(IDialogService);
                // Layout
                this.initLayout(accessor);
                // Registries
                Registry.as(WorkbenchExtensions.Workbench).start(accessor);
                Registry.as(EditorExtensions.EditorFactory).start(accessor);
                // Context Keys
                this._register(instantiationService.createInstance(WorkbenchContextKeysHandler));
                // Register Listeners
                this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);
                // Render Workbench
                this.renderWorkbench(instantiationService, accessor.get(INotificationService), storageService, configurationService);
                // Workbench Layout
                this.createWorkbenchLayout();
                // Layout
                this.layout();
                // Restore
                this.restore(lifecycleService);
            });
            return instantiationService;
        }
        catch (error) {
            onUnexpectedError(error);
            throw error; // rethrow because this is a critical issue we cannot handle properly here
        }
    }
    initServices(serviceCollection) {
        // Layout Service
        serviceCollection.set(IWorkbenchLayoutService, this);
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //
        // NOTE: Please do NOT register services here. Use `registerSingleton()`
        //       from `workbench.common.main.ts` if the service is shared between
        //       desktop and web or `workbench.desktop.main.ts` if the service
        //       is desktop only.
        //
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // All Contributed Services
        const contributedServices = getSingletonServiceDescriptors();
        for (const [id, descriptor] of contributedServices) {
            serviceCollection.set(id, descriptor);
        }
        const instantiationService = new InstantiationService(serviceCollection, true);
        // Wrap up
        instantiationService.invokeFunction(accessor => {
            const lifecycleService = accessor.get(ILifecycleService);
            // TODO@Sandeep debt around cyclic dependencies
            const configurationService = accessor.get(IConfigurationService);
            if (typeof configurationService.acquireInstantiationService === 'function') {
                configurationService.acquireInstantiationService(instantiationService);
            }
            // Signal to lifecycle that services are set
            lifecycleService.phase = 2 /* LifecyclePhase.Ready */;
        });
        return instantiationService;
    }
    registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
        // Configuration changes
        this._register(configurationService.onDidChangeConfiguration(() => this.setFontAliasing(configurationService)));
        // Font Info
        if (isNative) {
            this._register(storageService.onWillSaveState(e => {
                if (e.reason === WillSaveStateReason.SHUTDOWN) {
                    this.storeFontInfo(storageService);
                }
            }));
        }
        else {
            this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
        }
        // Lifecycle
        this._register(lifecycleService.onWillShutdown(event => this._onWillShutdown.fire(event)));
        this._register(lifecycleService.onDidShutdown(() => {
            this._onDidShutdown.fire();
            this.dispose();
        }));
        // In some environments we do not get enough time to persist state on shutdown.
        // In other cases, VSCode might crash, so we periodically save state to reduce
        // the chance of loosing any state.
        // The window loosing focus is a good indication that the user has stopped working
        // in that window so we pick that at a time to collect state.
        this._register(hostService.onDidChangeFocus(focus => {
            if (!focus) {
                storageService.flush();
            }
        }));
        // Dialogs showing/hiding
        this._register(dialogService.onWillShowDialog(() => this.container.classList.add('modal-dialog-visible')));
        this._register(dialogService.onDidShowDialog(() => this.container.classList.remove('modal-dialog-visible')));
    }
    fontAliasing;
    setFontAliasing(configurationService) {
        if (!isMacintosh) {
            return; // macOS only
        }
        const aliasing = configurationService.getValue('workbench.fontAliasing');
        if (this.fontAliasing === aliasing) {
            return;
        }
        this.fontAliasing = aliasing;
        // Remove all
        const fontAliasingValues = ['antialiased', 'none', 'auto'];
        this.container.classList.remove(...fontAliasingValues.map(value => `monaco-font-aliasing-${value}`));
        // Add specific
        if (fontAliasingValues.some(option => option === aliasing)) {
            this.container.classList.add(`monaco-font-aliasing-${aliasing}`);
        }
    }
    restoreFontInfo(storageService, configurationService) {
        const storedFontInfoRaw = storageService.get('editorFontInfo', -1 /* StorageScope.APPLICATION */);
        if (storedFontInfoRaw) {
            try {
                const storedFontInfo = JSON.parse(storedFontInfoRaw);
                if (Array.isArray(storedFontInfo)) {
                    FontMeasurements.restoreFontInfo(storedFontInfo);
                }
            }
            catch (err) {
                /* ignore */
            }
        }
        FontMeasurements.readFontInfo(BareFontInfo.createFromRawSettings(configurationService.getValue('editor'), PixelRatio.value));
    }
    storeFontInfo(storageService) {
        const serializedFontInfo = FontMeasurements.serializeFontInfo();
        if (serializedFontInfo) {
            storageService.store('editorFontInfo', JSON.stringify(serializedFontInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
    }
    renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
        // ARIA
        setARIAContainer(this.container);
        // State specific classes
        const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac';
        const workbenchClasses = coalesce([
            'monaco-workbench',
            platformClass,
            isWeb ? 'web' : undefined,
            isChrome ? 'chromium' : isFirefox ? 'firefox' : isSafari ? 'safari' : undefined,
            ...this.getLayoutClasses(),
            ...(this.options?.extraClasses ? this.options.extraClasses : [])
        ]);
        this.container.classList.add(...workbenchClasses);
        document.body.classList.add(platformClass); // used by our fonts
        if (isWeb) {
            document.body.classList.add('web');
        }
        // Apply font aliasing
        this.setFontAliasing(configurationService);
        // Warm up font cache information before building up too many dom elements
        this.restoreFontInfo(storageService, configurationService);
        // Create Parts
        for (const { id, role, classes, options } of [
            { id: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, role: 'contentinfo', classes: ['titlebar'] },
            { id: "workbench.parts.banner" /* Parts.BANNER_PART */, role: 'banner', classes: ['banner'] },
            { id: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, role: 'none', classes: ['activitybar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] },
            { id: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, role: 'none', classes: ['sidebar', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'left' : 'right'] },
            { id: "workbench.parts.editor" /* Parts.EDITOR_PART */, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
            { id: "workbench.parts.panel" /* Parts.PANEL_PART */, role: 'none', classes: ['panel', 'basepanel', positionToString(this.getPanelPosition())] },
            { id: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, role: 'none', classes: ['auxiliarybar', 'basepanel', this.getSideBarPosition() === 0 /* Position.LEFT */ ? 'right' : 'left'] },
            { id: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, role: 'status', classes: ['statusbar'] }
        ]) {
            const partContainer = this.createPart(id, role, classes);
            this.getPart(id).create(partContainer, options);
        }
        // Notification Handlers
        this.createNotificationsHandlers(instantiationService, notificationService);
        // Add Workbench to DOM
        this.parent.appendChild(this.container);
    }
    createPart(id, role, classes) {
        const part = document.createElement(role === 'status' ? 'footer' /* Use footer element for status bar #98376 */ : 'div');
        part.classList.add('part', ...classes);
        part.id = id;
        part.setAttribute('role', role);
        if (role === 'status') {
            part.setAttribute('aria-live', 'off');
        }
        return part;
    }
    createNotificationsHandlers(instantiationService, notificationService) {
        // Instantiate Notification components
        const notificationsCenter = this._register(instantiationService.createInstance(NotificationsCenter, this.container, notificationService.model));
        const notificationsToasts = this._register(instantiationService.createInstance(NotificationsToasts, this.container, notificationService.model));
        this._register(instantiationService.createInstance(NotificationsAlerts, notificationService.model));
        const notificationsStatus = instantiationService.createInstance(NotificationsStatus, notificationService.model);
        this._register(instantiationService.createInstance(NotificationsTelemetry));
        // Visibility
        this._register(notificationsCenter.onDidChangeVisibility(() => {
            notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
            notificationsToasts.update(notificationsCenter.isVisible);
        }));
        this._register(notificationsToasts.onDidChangeVisibility(() => {
            notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
        }));
        // Register Commands
        registerNotificationCommands(notificationsCenter, notificationsToasts, notificationService.model);
        // Register with Layout
        this.registerNotifications({
            onDidChangeNotificationsVisibility: Event.map(Event.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
        });
    }
    restore(lifecycleService) {
        // Ask each part to restore
        try {
            this.restoreParts();
        }
        catch (error) {
            onUnexpectedError(error);
        }
        // Transition into restored phase after layout has restored
        // but do not wait indefinitely on this to account for slow
        // editors restoring. Since the workbench is fully functional
        // even when the visible editors have not resolved, we still
        // want contributions on the `Restored` phase to work before
        // slow editors have resolved. But we also do not want fast
        // editors to resolve slow when too many contributions get
        // instantiated, so we find a middle ground solution via
        // `Promise.race`
        this.whenReady.finally(() => Promise.race([
            this.whenRestored,
            timeout(2000)
        ]).finally(() => {
            // Set lifecycle phase to `Restored`
            lifecycleService.phase = 3 /* LifecyclePhase.Restored */;
            // Set lifecycle phase to `Eventually` after a short delay and when idle (min 2.5sec, max 5sec)
            const eventuallyPhaseScheduler = this._register(new RunOnceScheduler(() => {
                this._register(runWhenIdle(() => lifecycleService.phase = 4 /* LifecyclePhase.Eventually */, 2500));
            }, 2500));
            eventuallyPhaseScheduler.schedule();
            // Update perf marks only when the layout is fully
            // restored. We want the time it takes to restore
            // editors to be included in these numbers
            function markDidStartWorkbench() {
                mark('code/didStartWorkbench');
                performance.measure('perf: workbench create & restore', 'code/didLoadWorkbenchMain', 'code/didStartWorkbench');
            }
            if (this.isRestored()) {
                markDidStartWorkbench();
            }
            else {
                this.whenRestored.finally(() => markDidStartWorkbench());
            }
        }));
    }
}
