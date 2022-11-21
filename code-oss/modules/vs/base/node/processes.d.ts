/// <reference types="node" />
import * as cp from 'child_process';
import * as Platform from 'vs/base/common/platform';
import { CommandOptions, ForkOptions, Source, SuccessData, TerminateResponse, TerminateResponseCode } from 'vs/base/common/processes';
export { CommandOptions, ForkOptions, SuccessData, Source, TerminateResponse, TerminateResponseCode };
export declare type ValueCallback<T> = (value: T | Promise<T>) => void;
export declare type ErrorCallback = (error?: any) => void;
export declare type ProgressCallback<T> = (progress: T) => void;
export declare function getWindowsShell(env?: Platform.IProcessEnvironment): string;
export interface IQueuedSender {
    send: (msg: any) => void;
}
export declare function createQueuedSender(childProcess: cp.ChildProcess): IQueuedSender;
export declare namespace win32 {
    function findExecutable(command: string, cwd?: string, paths?: string[]): Promise<string>;
}
