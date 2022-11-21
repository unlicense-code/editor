import { VSBufferReadableStream } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelContentChangedEvent, IUntitledFileWorkingCopyModelFactory } from 'vs/workbench/services/workingCopy/common/untitledFileWorkingCopy';
export declare class TestUntitledFileWorkingCopyModel extends Disposable implements IUntitledFileWorkingCopyModel {
    readonly resource: URI;
    contents: string;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: import("vs/base/common/event").Event<IUntitledFileWorkingCopyModelContentChangedEvent>;
    private readonly _onWillDispose;
    readonly onWillDispose: import("vs/base/common/event").Event<void>;
    constructor(resource: URI, contents: string);
    fireContentChangeEvent(event: IUntitledFileWorkingCopyModelContentChangedEvent): void;
    updateContents(newContents: string): void;
    private throwOnSnapshot;
    setThrowOnSnapshot(): void;
    snapshot(token: CancellationToken): Promise<VSBufferReadableStream>;
    update(contents: VSBufferReadableStream, token: CancellationToken): Promise<void>;
    private doUpdate;
    versionId: number;
    pushedStackElement: boolean;
    pushStackElement(): void;
    dispose(): void;
}
export declare class TestUntitledFileWorkingCopyModelFactory implements IUntitledFileWorkingCopyModelFactory<TestUntitledFileWorkingCopyModel> {
    createModel(resource: URI, contents: VSBufferReadableStream, token: CancellationToken): Promise<TestUntitledFileWorkingCopyModel>;
}
