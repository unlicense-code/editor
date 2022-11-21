import { URI } from 'vs/base/common/uri';
import { ITextModel } from 'vs/editor/common/model';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { SearchConfiguration } from './searchEditorInput';
import { ResourceMap } from 'vs/base/common/map';
export declare type SearchEditorData = {
    resultsModel: ITextModel;
    configurationModel: SearchConfigurationModel;
};
export declare class SearchConfigurationModel {
    config: Readonly<SearchConfiguration>;
    private _onConfigDidUpdate;
    readonly onConfigDidUpdate: import("vs/base/common/event").Event<SearchConfiguration>;
    constructor(config: Readonly<SearchConfiguration>);
    updateConfig(config: SearchConfiguration): void;
}
export declare class SearchEditorModel {
    private resource;
    readonly workingCopyBackupService: IWorkingCopyBackupService;
    constructor(resource: URI, workingCopyBackupService: IWorkingCopyBackupService);
    resolve(): Promise<SearchEditorData>;
}
declare class SearchEditorModelFactory {
    models: ResourceMap<{
        resolve: () => Promise<SearchEditorData>;
    }>;
    constructor();
    initializeModelFromExistingModel(accessor: ServicesAccessor, resource: URI, config: SearchConfiguration): void;
    initializeModelFromRawData(accessor: ServicesAccessor, resource: URI, config: SearchConfiguration, contents: string | undefined): void;
    initializeModelFromExistingFile(accessor: ServicesAccessor, resource: URI, existingFile: URI): void;
    private tryFetchModelFromBackupService;
}
export declare const searchEditorModelFactory: SearchEditorModelFactory;
export {};
