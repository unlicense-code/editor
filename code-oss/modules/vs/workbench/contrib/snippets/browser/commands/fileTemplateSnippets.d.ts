import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { SnippetsAction } from 'vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions';
export declare class ApplyFileSnippetAction extends SnippetsAction {
    static readonly Id = "workbench.action.populateFileFromSnippet";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    private _pick;
}
