/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var SharedProcessWorkerMessages;
(function (SharedProcessWorkerMessages) {
    // Process
    SharedProcessWorkerMessages["Spawn"] = "vscode:shared-process->shared-process-worker=spawn";
    SharedProcessWorkerMessages["Terminate"] = "vscode:shared-process->shared-process-worker=terminate";
    SharedProcessWorkerMessages["SelfTerminated"] = "vscode:shared-process-worker->shared-process=selfTerminated";
    // Lifecycle
    SharedProcessWorkerMessages["Ready"] = "vscode:shared-process-worker->shared-process=ready";
    SharedProcessWorkerMessages["Ack"] = "vscode:shared-process-worker->shared-process=ack";
    // Diagnostics
    SharedProcessWorkerMessages["Trace"] = "vscode:shared-process-worker->shared-process=trace";
    SharedProcessWorkerMessages["Info"] = "vscode:shared-process-worker->shared-process=info";
    SharedProcessWorkerMessages["Warn"] = "vscode:shared-process-worker->shared-process=warn";
    SharedProcessWorkerMessages["Error"] = "vscode:shared-process-worker->shared-process=error";
})(SharedProcessWorkerMessages || (SharedProcessWorkerMessages = {}));
