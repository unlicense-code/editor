import { URI } from 'vs/base/common/uri';
export declare const TEST_DATA_SCHEME = "vscode-test-data";
export declare const enum TestUriType {
    ResultMessage = 0,
    ResultActualOutput = 1,
    ResultExpectedOutput = 2
}
interface IResultTestUri {
    resultId: string;
    taskIndex: number;
    testExtId: string;
}
interface IResultTestMessageReference extends IResultTestUri {
    type: TestUriType.ResultMessage;
    messageIndex: number;
}
interface IResultTestOutputReference extends IResultTestUri {
    type: TestUriType.ResultActualOutput | TestUriType.ResultExpectedOutput;
    messageIndex: number;
}
export declare type ParsedTestUri = IResultTestMessageReference | IResultTestOutputReference;
export declare const parseTestUri: (uri: URI) => ParsedTestUri | undefined;
export declare const buildTestUri: (parsed: ParsedTestUri) => URI;
export {};
