import { BrowserWindow, MessageBoxOptions, MessageBoxReturnValue, OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import { INativeOpenDialogOptions } from 'vs/platform/dialogs/common/dialogs';
import { ILogService } from 'vs/platform/log/common/log';
export declare const IDialogMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IDialogMainService>;
export interface IDialogMainService {
    readonly _serviceBrand: undefined;
    pickFileFolder(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    pickFolder(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    pickFile(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    pickWorkspace(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    showMessageBox(options: MessageBoxOptions, window?: BrowserWindow): Promise<MessageBoxReturnValue>;
    showSaveDialog(options: SaveDialogOptions, window?: BrowserWindow): Promise<SaveDialogReturnValue>;
    showOpenDialog(options: OpenDialogOptions, window?: BrowserWindow): Promise<OpenDialogReturnValue>;
}
export declare class DialogMainService implements IDialogMainService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly windowFileDialogLocks;
    private readonly windowDialogQueues;
    private readonly noWindowDialogueQueue;
    constructor(logService: ILogService);
    pickFileFolder(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    pickFolder(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    pickFile(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    pickWorkspace(options: INativeOpenDialogOptions, window?: BrowserWindow): Promise<string[] | undefined>;
    private doPick;
    private getWindowDialogQueue;
    showMessageBox(options: MessageBoxOptions, window?: BrowserWindow): Promise<MessageBoxReturnValue>;
    showSaveDialog(options: SaveDialogOptions, window?: BrowserWindow): Promise<SaveDialogReturnValue>;
    private normalizePath;
    private normalizePaths;
    showOpenDialog(options: OpenDialogOptions, window?: BrowserWindow): Promise<OpenDialogReturnValue>;
    private acquireFileDialogLock;
}
