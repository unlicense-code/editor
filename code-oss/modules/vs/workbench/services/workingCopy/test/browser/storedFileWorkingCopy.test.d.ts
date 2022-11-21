import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelContentChangedEvent, IStoredFileWorkingCopyModelFactory } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopy';
import { VSBufferReadableStream } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class TestStoredFileWorkingCopyModel extends Disposable implements IStoredFileWorkingCopyModel {
    readonly resource: URI;
    contents: string;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<IStoredFileWorkingCopyModelContentChangedEvent>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    constructor(resource: URI, contents: string);
    fireContentChangeEvent(event: IStoredFileWorkingCopyModelContentChangedEvent): void;
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
export declare class TestStoredFileWorkingCopyModelFactory implements IStoredFileWorkingCopyModelFactory<TestStoredFileWorkingCopyModel> {
    createModel(resource: URI, contents: VSBufferReadableStream, token: CancellationToken): Promise<TestStoredFileWorkingCopyModel>;
}
