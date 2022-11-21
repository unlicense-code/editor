import 'vs/workbench/api/common/extHost.common.services';
import 'vs/workbench/api/worker/extHost.worker.services';
export declare function create(): {
    onmessage: (message: any) => void;
};
