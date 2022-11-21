interface ILocalHistoryDateFormatter {
    format: (timestamp: number) => string;
}
export declare function getLocalHistoryDateFormatter(): ILocalHistoryDateFormatter;
export declare const LOCAL_HISTORY_MENU_CONTEXT_VALUE = "localHistory:item";
export declare const LOCAL_HISTORY_MENU_CONTEXT_KEY: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression;
export declare const LOCAL_HISTORY_ICON_ENTRY: import("../../../../platform/theme/common/themeService").ThemeIcon;
export declare const LOCAL_HISTORY_ICON_RESTORE: import("../../../../platform/theme/common/themeService").ThemeIcon;
export {};
