import { IAnchor } from 'vs/base/browser/ui/contextview/contextview';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class ContextMenuController implements IEditorContribution {
    private readonly _contextMenuService;
    private readonly _contextViewService;
    private readonly _contextKeyService;
    private readonly _keybindingService;
    private readonly _menuService;
    private readonly _configurationService;
    static readonly ID = "editor.contrib.contextmenu";
    static get(editor: ICodeEditor): ContextMenuController | null;
    private readonly _toDispose;
    private _contextMenuIsBeingShownCount;
    private readonly _editor;
    constructor(editor: ICodeEditor, _contextMenuService: IContextMenuService, _contextViewService: IContextViewService, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService, _menuService: IMenuService, _configurationService: IConfigurationService);
    private _onContextMenu;
    showContextMenu(anchor?: IAnchor | null): void;
    private _getMenuActions;
    private _doShowContextMenu;
    private _showScrollbarContextMenu;
    private _keybindingFor;
    dispose(): void;
}
