import type * as vscode from 'vscode';
import { ExtHostStorage } from 'vs/workbench/api/common/extHostStorage';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class ExtensionMemento implements vscode.Memento {
    protected readonly _id: string;
    private readonly _shared;
    protected readonly _storage: ExtHostStorage;
    private readonly _init;
    private _value?;
    private readonly _storageListener;
    private _deferredPromises;
    private _scheduler;
    constructor(id: string, global: boolean, storage: ExtHostStorage);
    keys(): readonly string[];
    get whenReady(): Promise<ExtensionMemento>;
    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    update(key: string, value: any): Promise<void>;
    dispose(): void;
}
export declare class ExtensionGlobalMemento extends ExtensionMemento {
    private readonly _extension;
    setKeysForSync(keys: string[]): void;
    constructor(extensionDescription: IExtensionDescription, storage: ExtHostStorage);
}
