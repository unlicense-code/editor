import { Disposable } from 'vs/base/common/lifecycle';
export declare class WebviewProtocolProvider extends Disposable {
    private static validWebviewFilePaths;
    constructor();
    private handleWebviewRequest;
}
