import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ICommandHandler } from 'vs/platform/commands/common/commands';
export declare const inQuickPickContextKeyValue = "inQuickOpen";
export declare const InQuickPickContextKey: RawContextKey<boolean>;
export declare const inQuickPickContext: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression;
export declare const defaultQuickAccessContextKeyValue = "inFilesPicker";
export declare const defaultQuickAccessContext: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression | undefined;
export interface IWorkbenchQuickAccessConfiguration {
    workbench: {
        commandPalette: {
            history: number;
            preserveInput: boolean;
        };
        quickOpen: {
            enableExperimentalNewVersion: boolean;
            preserveInput: boolean;
        };
    };
}
export declare function getQuickNavigateHandler(id: string, next?: boolean): ICommandHandler;
