import { BaseActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { IAction } from 'vs/base/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITestExplorerFilterState } from 'vs/workbench/contrib/testing/common/testExplorerFilterState';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
export declare class TestingExplorerFilter extends BaseActionViewItem {
    private readonly state;
    private readonly themeService;
    private readonly instantiationService;
    private readonly testService;
    private input;
    private wrapper;
    private readonly focusEmitter;
    readonly onDidFocus: import("vs/base/common/event").Event<void>;
    private readonly history;
    private readonly filtersAction;
    constructor(action: IAction, state: ITestExplorerFilterState, themeService: IThemeService, instantiationService: IInstantiationService, testService: ITestService);
    /**
     * @override
     */
    render(container: HTMLElement): void;
    layout(width: number): void;
    /**
     * Focuses the filter input.
     */
    focus(): void;
    /**
     * Persists changes to the input history.
     */
    saveState(): void;
    /**
     * @override
     */
    dispose(): void;
    /**
     * Updates the 'checked' state of the filter submenu.
     */
    private updateFilterActiveState;
}
