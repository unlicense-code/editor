import { VSDataTransfer } from 'vs/base/common/dataTransfer';
import { ITreeItem } from 'vs/workbench/common/views';
import { ITreeViewsService as ITreeViewsServiceCommon } from 'vs/workbench/services/views/common/treeViewsService';
export interface ITreeViewsService extends ITreeViewsServiceCommon<VSDataTransfer, ITreeItem, HTMLElement> {
}
export declare const ITreeViewsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITreeViewsService>;
