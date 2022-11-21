import { URI } from 'vs/base/common/uri';
import { IFileStat, IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { SortOrder } from 'vs/workbench/contrib/files/common/files';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class ExplorerModel implements IDisposable {
    private readonly contextService;
    private readonly uriIdentityService;
    private _roots;
    private _listener;
    private readonly _onDidChangeRoots;
    constructor(contextService: IWorkspaceContextService, uriIdentityService: IUriIdentityService, fileService: IFileService, configService: IConfigurationService);
    get roots(): ExplorerItem[];
    get onDidChangeRoots(): Event<void>;
    /**
     * Returns an array of child stat from this stat that matches with the provided path.
     * Starts matching from the first root.
     * Will return empty array in case the FileStat does not exist.
     */
    findAll(resource: URI): ExplorerItem[];
    /**
     * Returns a FileStat that matches the passed resource.
     * In case multiple FileStat are matching the resource (same folder opened multiple times) returns the FileStat that has the closest root.
     * Will return undefined in case the FileStat does not exist.
     */
    findClosest(resource: URI): ExplorerItem | null;
    dispose(): void;
}
export declare class ExplorerItem {
    resource: URI;
    private readonly fileService;
    private readonly configService;
    private _parent;
    private _isDirectory?;
    private _isSymbolicLink?;
    private _readonly?;
    private _name;
    private _mtime?;
    private _unknown;
    _isDirectoryResolved: boolean;
    isError: boolean;
    private _isExcluded;
    nestedParent: ExplorerItem | undefined;
    nestedChildren: ExplorerItem[] | undefined;
    constructor(resource: URI, fileService: IFileService, configService: IConfigurationService, _parent: ExplorerItem | undefined, _isDirectory?: boolean | undefined, _isSymbolicLink?: boolean | undefined, _readonly?: boolean | undefined, _name?: string, _mtime?: number | undefined, _unknown?: boolean);
    get isExcluded(): boolean;
    set isExcluded(value: boolean);
    hasChildren(filter: (stat: ExplorerItem) => boolean): boolean;
    get hasNests(): boolean;
    get isDirectoryResolved(): boolean;
    get isSymbolicLink(): boolean;
    get isDirectory(): boolean;
    get isReadonly(): boolean;
    get mtime(): number | undefined;
    get name(): string;
    get isUnknown(): boolean;
    get parent(): ExplorerItem | undefined;
    get root(): ExplorerItem;
    get children(): Map<string, ExplorerItem>;
    private updateName;
    getId(): string;
    toString(): string;
    get isRoot(): boolean;
    static create(fileService: IFileService, configService: IConfigurationService, raw: IFileStat, parent: ExplorerItem | undefined, resolveTo?: readonly URI[]): ExplorerItem;
    /**
     * Merges the stat which was resolved from the disk with the local stat by copying over properties
     * and children. The merge will only consider resolved stat elements to avoid overwriting data which
     * exists locally.
     */
    static mergeLocalWithDisk(disk: ExplorerItem, local: ExplorerItem): void;
    /**
     * Adds a child element to this folder.
     */
    addChild(child: ExplorerItem): void;
    getChild(name: string): ExplorerItem | undefined;
    fetchChildren(sortOrder: SortOrder): ExplorerItem[] | Promise<ExplorerItem[]>;
    private _fileNester;
    private get fileNester();
    /**
     * Removes a child element from this folder.
     */
    removeChild(child: ExplorerItem): void;
    forgetChildren(): void;
    private getPlatformAwareName;
    /**
     * Moves this element under a new parent element.
     */
    move(newParent: ExplorerItem): void;
    private updateResource;
    /**
     * Tells this stat that it was renamed. This requires changes to all children of this stat (if any)
     * so that the path property can be updated properly.
     */
    rename(renamedStat: {
        name: string;
        mtime?: number;
    }): void;
    /**
     * Returns a child stat from this stat that matches with the provided path.
     * Will return "null" in case the child does not exist.
     */
    find(resource: URI): ExplorerItem | null;
    private findByPath;
}
export declare class NewExplorerItem extends ExplorerItem {
    constructor(fileService: IFileService, configService: IConfigurationService, parent: ExplorerItem, isDirectory: boolean);
}
