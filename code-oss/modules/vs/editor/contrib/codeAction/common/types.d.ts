import { CancellationToken } from 'vs/base/common/cancellation';
import { Position } from 'vs/editor/common/core/position';
import * as languages from 'vs/editor/common/languages';
import { ActionSet, IActionItem } from 'vs/platform/actionWidget/common/actionWidget';
export declare class CodeActionKind {
    readonly value: string;
    private static readonly sep;
    static readonly None: CodeActionKind;
    static readonly Empty: CodeActionKind;
    static readonly QuickFix: CodeActionKind;
    static readonly Refactor: CodeActionKind;
    static readonly RefactorExtract: CodeActionKind;
    static readonly RefactorInline: CodeActionKind;
    static readonly RefactorMove: CodeActionKind;
    static readonly RefactorRewrite: CodeActionKind;
    static readonly Source: CodeActionKind;
    static readonly SourceOrganizeImports: CodeActionKind;
    static readonly SourceFixAll: CodeActionKind;
    static readonly SurroundWith: CodeActionKind;
    constructor(value: string);
    equals(other: CodeActionKind): boolean;
    contains(other: CodeActionKind): boolean;
    intersects(other: CodeActionKind): boolean;
    append(part: string): CodeActionKind;
}
export declare const enum CodeActionAutoApply {
    IfSingle = "ifSingle",
    First = "first",
    Never = "never"
}
export declare enum CodeActionTriggerSource {
    Refactor = "refactor",
    RefactorPreview = "refactor preview",
    Lightbulb = "lightbulb",
    Default = "other (default)",
    SourceAction = "source action",
    QuickFix = "quick fix action",
    FixAll = "fix all",
    OrganizeImports = "organize imports",
    AutoFix = "auto fix",
    QuickFixHover = "quick fix hover window",
    OnSave = "save participants",
    ProblemsView = "problems view"
}
export interface CodeActionFilter {
    readonly include?: CodeActionKind;
    readonly excludes?: readonly CodeActionKind[];
    readonly includeSourceActions?: boolean;
    readonly onlyIncludePreferredActions?: boolean;
}
export declare function mayIncludeActionsOfKind(filter: CodeActionFilter, providedKind: CodeActionKind): boolean;
export declare function filtersAction(filter: CodeActionFilter, action: languages.CodeAction): boolean;
export interface CodeActionTrigger {
    readonly type: languages.CodeActionTriggerType;
    readonly triggerAction: CodeActionTriggerSource;
    readonly filter?: CodeActionFilter;
    readonly autoApply?: CodeActionAutoApply;
    readonly context?: {
        readonly notAvailableMessage: string;
        readonly position: Position;
    };
    readonly preview?: boolean;
}
export declare class CodeActionCommandArgs {
    readonly kind: CodeActionKind;
    readonly apply: CodeActionAutoApply;
    readonly preferred: boolean;
    static fromUser(arg: any, defaults: {
        kind: CodeActionKind;
        apply: CodeActionAutoApply;
    }): CodeActionCommandArgs;
    private static getApplyFromUser;
    private static getKindFromUser;
    private static getPreferredUser;
    private constructor();
}
export declare class CodeActionItem implements IActionItem {
    readonly action: languages.CodeAction;
    readonly provider: languages.CodeActionProvider | undefined;
    constructor(action: languages.CodeAction, provider: languages.CodeActionProvider | undefined);
    resolve(token: CancellationToken): Promise<this>;
}
export interface CodeActionSet extends ActionSet<CodeActionItem> {
    readonly validActions: readonly CodeActionItem[];
    readonly allActions: readonly CodeActionItem[];
}
