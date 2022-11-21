import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
export declare const IProtocolMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IProtocolMainService>;
export interface IIPCObjectUrl<T> extends IDisposable {
    /**
     * A `URI` that a renderer can use to retrieve the
     * object via `ipcRenderer.invoke(resource.toString())`
     */
    resource: URI;
    /**
     * Allows to update the value of the object after it
     * has been created.
     *
     * @param obj the object to make accessible to the
     * renderer.
     */
    update(obj: T): void;
}
export interface IProtocolMainService {
    readonly _serviceBrand: undefined;
    /**
     * Allows to make an object accessible to a renderer
     * via `ipcRenderer.invoke(resource.toString())`.
     */
    createIPCObjectUrl<T>(): IIPCObjectUrl<T>;
    /**
     * Adds a path as root to the list of allowed
     * resources for file access.
     *
     * @param root the path to allow for file access
     */
    addValidFileRoot(root: string): IDisposable;
}
