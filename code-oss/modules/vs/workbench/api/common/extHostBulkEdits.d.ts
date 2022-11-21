import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import type * as vscode from 'vscode';
export declare class ExtHostBulkEdits {
    private readonly _proxy;
    private readonly _versionInformationProvider;
    constructor(extHostRpc: IExtHostRpcService, extHostDocumentsAndEditors: ExtHostDocumentsAndEditors);
    applyWorkspaceEdit(edit: vscode.WorkspaceEdit, extension: IExtensionDescription, metadata: vscode.WorkspaceEditMetadata | undefined): Promise<boolean>;
}
