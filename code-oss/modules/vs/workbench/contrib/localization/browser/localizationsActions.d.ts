import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ConfigureDisplayLanguageAction extends Action2 {
    static readonly ID = "workbench.action.configureLocale";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ClearDisplayLanguageAction extends Action2 {
    static readonly ID = "workbench.action.clearLocalePreference";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
