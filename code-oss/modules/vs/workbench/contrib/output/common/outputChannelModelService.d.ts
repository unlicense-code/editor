import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { IOutputChannelModel } from 'vs/workbench/contrib/output/common/outputChannelModel';
import { URI } from 'vs/base/common/uri';
import { ILanguageSelection } from 'vs/editor/common/languages/language';
export declare const IOutputChannelModelService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IOutputChannelModelService>;
export interface IOutputChannelModelService {
    readonly _serviceBrand: undefined;
    createOutputChannelModel(id: string, modelUri: URI, language: ILanguageSelection, file?: URI): IOutputChannelModel;
}
export declare class OutputChannelModelService {
    private readonly fileService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly outputLocation;
    constructor(fileService: IFileService, instantiationService: IInstantiationService, environmentService: IWorkbenchEnvironmentService);
    createOutputChannelModel(id: string, modelUri: URI, language: ILanguageSelection, file?: URI): IOutputChannelModel;
    private _outputDir;
    private get outputDir();
}
