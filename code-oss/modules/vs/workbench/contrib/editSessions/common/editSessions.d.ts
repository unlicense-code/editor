import { VSBuffer } from 'vs/base/common/buffer';
import { ILocalizedString } from 'vs/platform/action/common/action';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ILogService } from 'vs/platform/log/common/log';
import { IResourceRefHandle } from 'vs/platform/userDataSync/common/userDataSync';
import { Event } from 'vs/base/common/event';
export declare const EDIT_SESSION_SYNC_CATEGORY: ILocalizedString;
export declare const IEditSessionsStorageService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEditSessionsStorageService>;
export interface IEditSessionsStorageService {
    _serviceBrand: undefined;
    readonly isSignedIn: boolean;
    readonly onDidSignIn: Event<void>;
    readonly onDidSignOut: Event<void>;
    initialize(fromContinueOn: boolean, silent?: boolean): Promise<boolean>;
    read(ref: string | undefined): Promise<{
        ref: string;
        editSession: EditSession;
    } | undefined>;
    write(editSession: EditSession): Promise<string>;
    delete(ref: string | null): Promise<void>;
    list(): Promise<IResourceRefHandle[]>;
    getMachineById(machineId: string): Promise<string | undefined>;
}
export declare const IEditSessionsLogService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEditSessionsLogService>;
export interface IEditSessionsLogService extends ILogService {
}
export declare enum ChangeType {
    Addition = 1,
    Deletion = 2
}
export declare enum FileType {
    File = 1
}
interface Addition {
    relativeFilePath: string;
    fileType: FileType.File;
    contents: string;
    type: ChangeType.Addition;
}
interface Deletion {
    relativeFilePath: string;
    fileType: FileType.File;
    contents: undefined;
    type: ChangeType.Deletion;
}
export declare type Change = Addition | Deletion;
export interface Folder {
    name: string;
    canonicalIdentity: string | undefined;
    workingChanges: Change[];
}
export declare const EditSessionSchemaVersion = 2;
export interface EditSession {
    version: number;
    machine?: string;
    folders: Folder[];
}
export declare const EDIT_SESSIONS_SIGNED_IN_KEY = "editSessionsSignedIn";
export declare const EDIT_SESSIONS_SIGNED_IN: RawContextKey<boolean>;
export declare const EDIT_SESSIONS_CONTAINER_ID = "workbench.view.editSessions";
export declare const EDIT_SESSIONS_DATA_VIEW_ID = "workbench.views.editSessions.data";
export declare const EDIT_SESSIONS_TITLE: string;
export declare const EDIT_SESSIONS_VIEW_ICON: import("../../../../platform/theme/common/themeService").ThemeIcon;
export declare const EDIT_SESSIONS_SHOW_VIEW: RawContextKey<boolean>;
export declare const EDIT_SESSIONS_SCHEME = "vscode-edit-sessions";
export declare function decodeEditSessionFileContent(version: number, content: string): VSBuffer;
export {};
