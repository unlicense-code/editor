import { IndentAction } from 'vs/editor/common/languages/languageConfiguration';
export declare const javascriptOnEnterRules: ({
    beforeText: RegExp;
    afterText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    afterText?: undefined;
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    previousLineText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    afterText?: undefined;
} | {
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
        removeText: number;
        appendText?: undefined;
    };
    afterText?: undefined;
    previousLineText?: undefined;
})[];
