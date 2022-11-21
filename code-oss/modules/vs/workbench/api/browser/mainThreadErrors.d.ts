import { SerializedError } from 'vs/base/common/errors';
import { MainThreadErrorsShape } from 'vs/workbench/api/common/extHost.protocol';
export declare class MainThreadErrors implements MainThreadErrorsShape {
    dispose(): void;
    $onUnexpectedError(err: any | SerializedError): void;
}
