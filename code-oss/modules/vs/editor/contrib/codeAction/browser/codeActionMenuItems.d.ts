import 'vs/base/browser/ui/codicons/codiconStyles';
import { Codicon } from 'vs/base/common/codicons';
import { CodeActionItem, CodeActionKind } from 'vs/editor/contrib/codeAction/common/types';
import 'vs/editor/contrib/symbolIcons/browser/symbolIcons';
import { IListMenuItem } from 'vs/platform/actionWidget/browser/actionList';
export interface ActionGroup {
    readonly kind: CodeActionKind;
    readonly title: string;
    readonly icon?: {
        readonly codicon: Codicon;
        readonly color?: string;
    };
}
export declare function toMenuItems(inputCodeActions: readonly CodeActionItem[], showHeaders: boolean): IListMenuItem<CodeActionItem>[];
