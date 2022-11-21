import { IAction, IActionRunner } from 'vs/base/common/actions';
import { Component } from 'vs/workbench/common/component';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IComposite, ICompositeControl } from 'vs/workbench/common/composite';
import { Event } from 'vs/base/common/event';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConstructorSignature, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Dimension, IDomPosition } from 'vs/base/browser/dom';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { Disposable } from 'vs/base/common/lifecycle';
import { IActionViewItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { MenuId } from 'vs/platform/actions/common/actions';
/**
 * Composites are layed out in the sidebar and panel part of the workbench. At a time only one composite
 * can be open in the sidebar, and only one composite can be open in the panel.
 *
 * Each composite has a minimized representation that is good enough to provide some
 * information about the state of the composite data.
 *
 * The workbench will keep a composite alive after it has been created and show/hide it based on
 * user interaction. The lifecycle of a composite goes in the order create(), setVisible(true|false),
 * layout(), focus(), dispose(). During use of the workbench, a composite will often receive a setVisible,
 * layout and focus call, but only one create and dispose call.
 */
export declare abstract class Composite extends Component implements IComposite {
    private readonly _onTitleAreaUpdate;
    readonly onTitleAreaUpdate: Event<void>;
    private _onDidFocus;
    get onDidFocus(): Event<void>;
    protected fireOnDidFocus(): void;
    private _onDidBlur;
    get onDidBlur(): Event<void>;
    private _hasFocus;
    hasFocus(): boolean;
    private registerFocusTrackEvents;
    protected actionRunner: IActionRunner | undefined;
    private _telemetryService;
    protected get telemetryService(): ITelemetryService;
    private visible;
    private parent;
    constructor(id: string, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    getTitle(): string | undefined;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Called to create this composite on the provided parent. This method is only
     * called once during the lifetime of the workbench.
     * Note that DOM-dependent calculations should be performed from the setVisible()
     * call. Only then the composite will be part of the DOM.
     */
    create(parent: HTMLElement): void;
    /**
     * Returns the container this composite is being build in.
     */
    getContainer(): HTMLElement | undefined;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Called to indicate that the composite has become visible or hidden. This method
     * is called more than once during workbench lifecycle depending on the user interaction.
     * The composite will be on-DOM if visible is set to true and off-DOM otherwise.
     *
     * Typically this operation should be fast though because setVisible might be called many times during a session.
     * If there is a long running operation it is fine to have it running in the background asyncly and return before.
     */
    setVisible(visible: boolean): void;
    /**
     * Called when this composite should receive keyboard focus.
     */
    focus(): void;
    /**
     * Layout the contents of this composite using the provided dimensions.
     */
    abstract layout(dimension: Dimension, position?: IDomPosition): void;
    /**
     * Update the styles of the contents of this composite.
     */
    updateStyles(): void;
    /**
     *
     * @returns the action runner for this composite
     */
    getMenuIds(): readonly MenuId[];
    /**
     * Returns an array of actions to show in the action bar of the composite.
     */
    getActions(): readonly IAction[];
    /**
     * Returns an array of actions to show in the action bar of the composite
     * in a less prominent way then action from getActions.
     */
    getSecondaryActions(): readonly IAction[];
    /**
     * Returns an array of actions to show in the context menu of the composite
     */
    getContextMenuActions(): readonly IAction[];
    /**
     * For any of the actions returned by this composite, provide an IActionViewItem in
     * cases where the implementor of the composite wants to override the presentation
     * of an action. Returns undefined to indicate that the action is not rendered through
     * an action item.
     */
    getActionViewItem(action: IAction): IActionViewItem | undefined;
    /**
     * Provide a context to be passed to the toolbar.
     */
    getActionsContext(): unknown;
    /**
     * Returns the instance of IActionRunner to use with this composite for the
     * composite tool bar.
     */
    getActionRunner(): IActionRunner;
    /**
     * Method for composite implementors to indicate to the composite container that the title or the actions
     * of the composite have changed. Calling this method will cause the container to ask for title (getTitle())
     * and actions (getActions(), getSecondaryActions()) if the composite is visible or the next time the composite
     * gets visible.
     */
    protected updateTitleArea(): void;
    /**
     * Returns true if this composite is currently visible and false otherwise.
     */
    isVisible(): boolean;
    /**
     * Returns the underlying composite control or `undefined` if it is not accessible.
     */
    getControl(): ICompositeControl | undefined;
}
/**
 * A composite descriptor is a lightweight descriptor of a composite in the workbench.
 */
export declare abstract class CompositeDescriptor<T extends Composite> {
    private readonly ctor;
    readonly id: string;
    readonly name: string;
    readonly cssClass?: string | undefined;
    readonly order?: number | undefined;
    readonly requestedIndex?: number | undefined;
    constructor(ctor: IConstructorSignature<T>, id: string, name: string, cssClass?: string | undefined, order?: number | undefined, requestedIndex?: number | undefined);
    instantiate(instantiationService: IInstantiationService): T;
}
export declare abstract class CompositeRegistry<T extends Composite> extends Disposable {
    private readonly _onDidRegister;
    readonly onDidRegister: Event<CompositeDescriptor<T>>;
    private readonly _onDidDeregister;
    readonly onDidDeregister: Event<CompositeDescriptor<T>>;
    private readonly composites;
    protected registerComposite(descriptor: CompositeDescriptor<T>): void;
    protected deregisterComposite(id: string): void;
    getComposite(id: string): CompositeDescriptor<T> | undefined;
    protected getComposites(): CompositeDescriptor<T>[];
    private compositeById;
}
