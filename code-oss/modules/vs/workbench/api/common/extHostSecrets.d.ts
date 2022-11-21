import type * as vscode from 'vscode';
import { ExtHostSecretState } from 'vs/workbench/api/common/extHostSecretState';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { Event } from 'vs/base/common/event';
export declare class ExtensionSecrets implements vscode.SecretStorage {
    #private;
    protected readonly _id: string;
    private _onDidChange;
    readonly onDidChange: Event<vscode.SecretStorageChangeEvent>;
    constructor(extensionDescription: IExtensionDescription, secretState: ExtHostSecretState);
    get(key: string): Promise<string | undefined>;
    store(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
