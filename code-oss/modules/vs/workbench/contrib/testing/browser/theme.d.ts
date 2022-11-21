import { TestMessageType, TestResultState } from 'vs/workbench/contrib/testing/common/testTypes';
export declare const testingColorIconFailed: string;
export declare const testingColorIconErrored: string;
export declare const testingColorIconPassed: string;
export declare const testingColorRunAction: string;
export declare const testingColorIconQueued: string;
export declare const testingColorIconUnset: string;
export declare const testingColorIconSkipped: string;
export declare const testingPeekBorder: string;
export declare const testingPeekHeaderBackground: string;
export declare const testMessageSeverityColors: {
    [K in TestMessageType]: {
        decorationForeground: string;
        marginBackground: string;
    };
};
export declare const testStatesToIconColors: {
    [K in TestResultState]?: string;
};
