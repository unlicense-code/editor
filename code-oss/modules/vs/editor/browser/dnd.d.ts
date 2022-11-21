import { VSDataTransfer } from 'vs/base/common/dataTransfer';
export declare function toVSDataTransfer(dataTransfer: DataTransfer): VSDataTransfer;
export declare function addExternalEditorsDropData(dataTransfer: VSDataTransfer, dragEvent: DragEvent, overwriteUriList?: boolean): void;
