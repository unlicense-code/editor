import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILanguageStatusService } from 'vs/workbench/services/languageStatus/common/languageStatusService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export declare class FoldingLimitIndicatorContribution extends Disposable implements IWorkbenchContribution {
    private readonly editorService;
    private readonly languageStatusService;
    constructor(editorService: IEditorService, languageStatusService: ILanguageStatusService);
    private _limitStatusItem;
    private updateLimitInfo;
}
