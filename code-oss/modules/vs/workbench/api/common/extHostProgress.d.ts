import { ProgressOptions } from 'vscode';
import { MainThreadProgressShape, ExtHostProgressShape } from './extHost.protocol';
import { Progress, IProgressStep } from 'vs/platform/progress/common/progress';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class ExtHostProgress implements ExtHostProgressShape {
    private _proxy;
    private _handles;
    private _mapHandleToCancellationSource;
    constructor(proxy: MainThreadProgressShape);
    withProgress<R>(extension: IExtensionDescription, options: ProgressOptions, task: (progress: Progress<IProgressStep>, token: CancellationToken) => Thenable<R>): Promise<R>;
    private _withProgress;
    $acceptProgressCanceled(handle: number): void;
}
