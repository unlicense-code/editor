import { ISharedProcessToWorkerMessage } from 'vs/platform/sharedProcess/electron-browser/sharedProcessWorker';
/**
 * The `create` function needs to be there by convention because
 * we are loaded via the `vs/base/worker/workerMain` utility.
 */
export declare function create(): {
    onmessage: (message: ISharedProcessToWorkerMessage, transfer?: Transferable[]) => void;
};
