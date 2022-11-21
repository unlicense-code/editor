import 'vs/css!./media/editordroptarget';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
import { IEditorGroupsAccessor, IEditorGroupView } from 'vs/workbench/browser/parts/editor/editor';
export interface IEditorDropTargetDelegate {
    /**
     * A helper to figure out if the drop target contains the provided group.
     */
    containsGroup?(groupView: IEditorGroupView): boolean;
}
export declare class EditorDropTarget extends Themable {
    private accessor;
    private container;
    private readonly delegate;
    private readonly configurationService;
    private readonly instantiationService;
    private _overlay?;
    private counter;
    private readonly editorTransfer;
    private readonly groupTransfer;
    constructor(accessor: IEditorGroupsAccessor, container: HTMLElement, delegate: IEditorDropTargetDelegate, themeService: IThemeService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private get overlay();
    private registerListeners;
    private onDragEnter;
    private onDragLeave;
    private onDragEnd;
    private findTargetGroupView;
    private updateContainer;
    dispose(): void;
    private disposeOverlay;
}
