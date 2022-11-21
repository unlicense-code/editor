import { URI } from 'vs/base/common/uri';
export interface IActivity {
    id: string;
    name: string;
    keybindingId?: string;
    cssClass?: string;
    iconUrl?: URI;
}
export declare const GLOBAL_ACTIVITY_ID = "workbench.action.globalActivity";
export declare const ACCOUNTS_ACTIVITY_ID = "workbench.action.accountsActivity";
