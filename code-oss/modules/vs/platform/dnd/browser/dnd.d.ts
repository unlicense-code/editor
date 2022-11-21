import { DragMouseEvent } from 'vs/base/browser/mouseEvent';
import { VSBuffer } from 'vs/base/common/buffer';
import { URI } from 'vs/base/common/uri';
import { IBaseTextResourceEditorInput } from 'vs/platform/editor/common/editor';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export interface FileAdditionalNativeProperties {
    /**
     * The real path to the file on the users filesystem. Only available on electron.
     */
    readonly path?: string;
}
export declare const CodeDataTransfers: {
    EDITORS: string;
    FILES: string;
};
export interface IDraggedResourceEditorInput extends IBaseTextResourceEditorInput {
    resource: URI | undefined;
    /**
     * A hint that the source of the dragged editor input
     * might not be the application but some external tool.
     */
    isExternal?: boolean;
    /**
     * Whether we probe for the dropped editor to be a workspace
     * (i.e. code-workspace file or even a folder), allowing to
     * open it as workspace instead of opening as editor.
     */
    allowWorkspaceOpen?: boolean;
}
export declare function extractEditorsDropData(e: DragEvent): Array<IDraggedResourceEditorInput>;
export declare function extractEditorsAndFilesDropData(accessor: ServicesAccessor, e: DragEvent): Promise<Array<IDraggedResourceEditorInput>>;
export declare function createDraggedEditorInputFromRawResourcesData(rawResourcesData: string | undefined): IDraggedResourceEditorInput[];
interface IFileTransferData {
    resource: URI;
    isDirectory?: boolean;
    contents?: VSBuffer;
}
export declare function extractFileListData(accessor: ServicesAccessor, files: FileList): Promise<IFileTransferData[]>;
export declare function containsDragType(event: DragEvent, ...dragTypesToFind: string[]): boolean;
export interface IResourceStat {
    resource: URI;
    isDirectory?: boolean;
}
export interface IDragAndDropContributionRegistry {
    /**
     * Registers a drag and drop contribution.
     */
    register(contribution: IDragAndDropContribution): void;
    /**
     * Returns all registered drag and drop contributions.
     */
    getAll(): IterableIterator<IDragAndDropContribution>;
}
interface IDragAndDropContribution {
    readonly dataFormatKey: string;
    getEditorInputs(data: string): IDraggedResourceEditorInput[];
    setData(resources: IResourceStat[], event: DragMouseEvent | DragEvent): void;
}
export declare const Extensions: {
    DragAndDropContribution: string;
};
export {};
