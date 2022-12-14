import { Disposable } from 'vs/base/common/lifecycle';
/**
 * A helper that will execute a provided function when the provided HTMLElement receives
 *  dragover event for 800ms. If the drag is aborted before, the callback will not be triggered.
 */
export declare class DelayedDragHandler extends Disposable {
    private timeout;
    constructor(container: HTMLElement, callback: () => void);
    private clearDragTimeout;
    dispose(): void;
}
export declare const DataTransfers: {
    /**
     * Application specific resource transfer type
     */
    RESOURCES: string;
    /**
     * Browser specific transfer type to download
     */
    DOWNLOAD_URL: string;
    /**
     * Browser specific transfer type for files
     */
    FILES: string;
    /**
     * Typically transfer type for copy/paste transfers.
     */
    TEXT: string;
};
export declare function applyDragImage(event: DragEvent, label: string | null, clazz: string): void;
export interface IDragAndDropData {
    update(dataTransfer: DataTransfer): void;
    getData(): unknown;
}
