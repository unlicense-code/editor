import { ILocalizedString } from 'vs/platform/action/common/action';
import { ContextKeyExpression } from 'vs/platform/contextkey/common/contextkey';
export declare function appendEditorTitleContextMenuItem(id: string, title: string, when: ContextKeyExpression | undefined, group: string, order?: number): void;
export declare function appendToCommandPalette(id: string, title: ILocalizedString, category: ILocalizedString, when?: ContextKeyExpression): void;
