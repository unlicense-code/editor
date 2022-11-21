import 'vs/css!./media/editorquickaccess';
import { IQuickPickSeparator, IQuickPickItemWithResource, IQuickPick } from 'vs/platform/quickinput/common/quickInput';
import { PickerQuickAccessProvider, IPickerQuickAccessItem } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorIdentifier, GroupIdentifier } from 'vs/workbench/common/editor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';
interface IEditorQuickPickItem extends IQuickPickItemWithResource, IPickerQuickAccessItem {
    groupId: GroupIdentifier;
}
export declare abstract class BaseEditorQuickAccessProvider extends PickerQuickAccessProvider<IEditorQuickPickItem> {
    protected readonly editorGroupService: IEditorGroupsService;
    protected readonly editorService: IEditorService;
    private readonly modelService;
    private readonly languageService;
    private readonly pickState;
    constructor(prefix: string, editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    provide(picker: IQuickPick<IEditorQuickPickItem>, token: CancellationToken): IDisposable;
    protected _getPicks(filter: string): Array<IEditorQuickPickItem | IQuickPickSeparator>;
    private doGetEditorPickItems;
    protected abstract doGetEditors(): IEditorIdentifier[];
}
export declare class ActiveGroupEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByAppearanceQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export {};
