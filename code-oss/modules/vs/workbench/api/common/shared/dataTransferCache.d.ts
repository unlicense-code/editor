import { VSBuffer } from 'vs/base/common/buffer';
import { VSDataTransfer } from 'vs/base/common/dataTransfer';
export declare class DataTransferCache {
    private requestIdPool;
    private readonly dataTransfers;
    add(dataTransfer: VSDataTransfer): {
        id: number;
        dispose: () => void;
    };
    resolveDropFileData(requestId: number, dataItemId: string): Promise<VSBuffer>;
    dispose(): void;
}
