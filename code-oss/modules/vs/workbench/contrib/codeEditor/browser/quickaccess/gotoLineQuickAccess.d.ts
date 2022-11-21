import { IKeyMods } from 'vs/platform/quickinput/common/quickInput';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IRange } from 'vs/editor/common/core/range';
import { AbstractGotoLineQuickAccessProvider } from 'vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IQuickAccessTextEditorContext } from 'vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
export declare class GotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    protected readonly onDidActiveTextEditorControlChange: import("../../../../workbench.web.main").Event<void>;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService);
    private get configuration();
    protected get activeTextEditorControl(): import("../../../../../editor/common/editorCommon").IEditor | import("../../../../../editor/common/editorCommon").IDiffEditor | undefined;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
}
