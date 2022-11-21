import { Disposable } from 'vs/base/common/lifecycle';
export declare class TextModelPart extends Disposable {
    private _isDisposed;
    dispose(): void;
    protected assertNotDisposed(): void;
}
