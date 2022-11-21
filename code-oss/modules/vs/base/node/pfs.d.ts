/// <reference types="node" />
/// <reference types="node" />
import * as fs from 'fs';
export declare enum RimRafMode {
    /**
     * Slow version that unlinks each file and folder.
     */
    UNLINK = 0,
    /**
     * Fast version that first moves the file/folder
     * into a temp directory and then deletes that
     * without waiting for it.
     */
    MOVE = 1
}
/**
 * Allows to delete the provided path (either file or folder) recursively
 * with the options:
 * - `UNLINK`: direct removal from disk
 * - `MOVE`: faster variant that first moves the target to temp dir and then
 *           deletes it in the background without waiting for that to finish.
 */
declare function rimraf(path: string, mode?: RimRafMode): Promise<void>;
export declare function rimrafSync(path: string): void;
export interface IDirent {
    name: string;
    isFile(): boolean;
    isDirectory(): boolean;
    isSymbolicLink(): boolean;
}
/**
 * Drop-in replacement of `fs.readdir` with support
 * for converting from macOS NFD unicon form to NFC
 * (https://github.com/nodejs/node/issues/2165)
 */
declare function readdir(path: string): Promise<string[]>;
declare function readdir(path: string, options: {
    withFileTypes: true;
}): Promise<IDirent[]>;
/**
 * Drop-in replacement of `fs.readdirSync` with support
 * for converting from macOS NFD unicon form to NFC
 * (https://github.com/nodejs/node/issues/2165)
 */
export declare function readdirSync(path: string): string[];
/**
 * A convenience method to read all children of a path that
 * are directories.
 */
declare function readDirsInDir(dirPath: string): Promise<string[]>;
/**
 * A `Promise` that resolves when the provided `path`
 * is deleted from disk.
 */
export declare function whenDeleted(path: string, intervalMs?: number): Promise<void>;
export declare namespace SymlinkSupport {
    interface IStats {
        stat: fs.Stats;
        symbolicLink?: {
            dangling: boolean;
        };
    }
    /**
     * Resolves the `fs.Stats` of the provided path. If the path is a
     * symbolic link, the `fs.Stats` will be from the target it points
     * to. If the target does not exist, `dangling: true` will be returned
     * as `symbolicLink` value.
     */
    function stat(path: string): Promise<IStats>;
    /**
     * Figures out if the `path` exists and is a file with support
     * for symlinks.
     *
     * Note: this will return `false` for a symlink that exists on
     * disk but is dangling (pointing to a nonexistent path).
     *
     * Use `exists` if you only care about the path existing on disk
     * or not without support for symbolic links.
     */
    function existsFile(path: string): Promise<boolean>;
    /**
     * Figures out if the `path` exists and is a directory with support for
     * symlinks.
     *
     * Note: this will return `false` for a symlink that exists on
     * disk but is dangling (pointing to a nonexistent path).
     *
     * Use `exists` if you only care about the path existing on disk
     * or not without support for symbolic links.
     */
    function existsDirectory(path: string): Promise<boolean>;
}
/**
 * Same as `fs.writeFile` but with an additional call to
 * `fs.fdatasync` after writing to ensure changes are
 * flushed to disk.
 *
 * In addition, multiple writes to the same path are queued.
 */
declare function writeFile(path: string, data: string, options?: IWriteFileOptions): Promise<void>;
declare function writeFile(path: string, data: Buffer, options?: IWriteFileOptions): Promise<void>;
declare function writeFile(path: string, data: Uint8Array, options?: IWriteFileOptions): Promise<void>;
declare function writeFile(path: string, data: string | Buffer | Uint8Array, options?: IWriteFileOptions): Promise<void>;
interface IWriteFileOptions {
    mode?: number;
    flag?: string;
}
export declare function configureFlushOnWrite(enabled: boolean): void;
/**
 * Same as `fs.writeFileSync` but with an additional call to
 * `fs.fdatasyncSync` after writing to ensure changes are
 * flushed to disk.
 */
export declare function writeFileSync(path: string, data: string | Buffer, options?: IWriteFileOptions): void;
/**
 * A drop-in replacement for `fs.rename` that:
 * - allows to move across multiple disks
 */
declare function move(source: string, target: string): Promise<void>;
/**
 * Recursively copies all of `source` to `target`.
 *
 * The options `preserveSymlinks` configures how symbolic
 * links should be handled when encountered. Set to
 * `false` to not preserve them and `true` otherwise.
 */
declare function copy(source: string, target: string, options: {
    preserveSymlinks: boolean;
}): Promise<void>;
/**
 * Prefer this helper class over the `fs.promises` API to
 * enable `graceful-fs` to function properly. Given issue
 * https://github.com/isaacs/node-graceful-fs/issues/160 it
 * is evident that the module only takes care of the non-promise
 * based fs methods.
 *
 * Another reason is `realpath` being entirely different in
 * the promise based implementation compared to the other
 * one (https://github.com/microsoft/vscode/issues/118562)
 *
 * Note: using getters for a reason, since `graceful-fs`
 * patching might kick in later after modules have been
 * loaded we need to defer access to fs methods.
 * (https://github.com/microsoft/vscode/issues/124176)
 */
export declare const Promises: {
    readonly access: typeof fs.access.__promisify__;
    readonly stat: typeof fs.stat.__promisify__;
    readonly lstat: typeof fs.lstat.__promisify__;
    readonly utimes: typeof fs.utimes.__promisify__;
    readonly read: (fd: number, buffer: Uint8Array, offset: number, length: number, position: number | null) => Promise<{
        bytesRead: number;
        buffer: Uint8Array;
    }>;
    readonly readFile: typeof fs.readFile.__promisify__;
    readonly write: (fd: number, buffer: Uint8Array, offset: number | undefined | null, length: number | undefined | null, position: number | undefined | null) => Promise<{
        bytesWritten: number;
        buffer: Uint8Array;
    }>;
    readonly appendFile: typeof fs.appendFile.__promisify__;
    readonly fdatasync: typeof fs.fdatasync.__promisify__;
    readonly truncate: typeof fs.truncate.__promisify__;
    readonly rename: typeof fs.rename.__promisify__;
    readonly copyFile: typeof fs.copyFile.__promisify__;
    readonly open: typeof fs.open.__promisify__;
    readonly close: typeof fs.close.__promisify__;
    readonly symlink: typeof fs.symlink.__promisify__;
    readonly readlink: typeof fs.readlink.__promisify__;
    readonly chmod: typeof fs.chmod.__promisify__;
    readonly mkdir: typeof fs.mkdir.__promisify__;
    readonly unlink: typeof fs.unlink.__promisify__;
    readonly rmdir: typeof fs.rmdir.__promisify__;
    readonly realpath: typeof fs.realpath.__promisify__;
    exists(path: string): Promise<boolean>;
    readonly readdir: typeof readdir;
    readonly readDirsInDir: typeof readDirsInDir;
    readonly writeFile: typeof writeFile;
    readonly rm: typeof rimraf;
    readonly move: typeof move;
    readonly copy: typeof copy;
};
export {};
