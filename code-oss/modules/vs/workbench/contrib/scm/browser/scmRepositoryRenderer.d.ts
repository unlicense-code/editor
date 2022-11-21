import 'vs/css!./media/scm';
import { IDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ISCMRepository, ISCMViewService } from 'vs/workbench/contrib/scm/common/scm';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITreeNode } from 'vs/base/browser/ui/tree/tree';
import { ICompressibleTreeRenderer } from 'vs/base/browser/ui/tree/objectTree';
import { FuzzyScore } from 'vs/base/common/filters';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { IListRenderer } from 'vs/base/browser/ui/list/list';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IActionViewItemProvider } from 'vs/base/browser/ui/actionbar/actionbar';
interface RepositoryTemplate {
    readonly label: HTMLElement;
    readonly name: HTMLElement;
    readonly description: HTMLElement;
    readonly countContainer: HTMLElement;
    readonly count: CountBadge;
    readonly toolBar: ToolBar;
    readonly elementDisposables: DisposableStore;
    readonly templateDisposable: IDisposable;
}
export declare class RepositoryRenderer implements ICompressibleTreeRenderer<ISCMRepository, FuzzyScore, RepositoryTemplate>, IListRenderer<ISCMRepository, RepositoryTemplate> {
    private actionViewItemProvider;
    private scmViewService;
    private commandService;
    private contextMenuService;
    private themeService;
    private workspaceContextService;
    static readonly TEMPLATE_ID = "repository";
    get templateId(): string;
    constructor(actionViewItemProvider: IActionViewItemProvider, scmViewService: ISCMViewService, commandService: ICommandService, contextMenuService: IContextMenuService, themeService: IThemeService, workspaceContextService: IWorkspaceContextService);
    renderTemplate(container: HTMLElement): RepositoryTemplate;
    renderElement(arg: ISCMRepository | ITreeNode<ISCMRepository, FuzzyScore>, index: number, templateData: RepositoryTemplate, height: number | undefined): void;
    renderCompressedElements(): void;
    disposeElement(group: ISCMRepository | ITreeNode<ISCMRepository, FuzzyScore>, index: number, template: RepositoryTemplate): void;
    disposeTemplate(templateData: RepositoryTemplate): void;
}
export {};
