import { LanguageService } from 'vs/editor/common/services/languageService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ILogService } from 'vs/platform/log/common/log';
export interface IRawLanguageExtensionPoint {
    id: string;
    extensions: string[];
    filenames: string[];
    filenamePatterns: string[];
    firstLine: string;
    aliases: string[];
    mimetypes: string[];
    configuration: string;
    icon: {
        light: string;
        dark: string;
    };
}
export declare const languagesExtPoint: IExtensionPoint<IRawLanguageExtensionPoint[]>;
export declare class WorkbenchLanguageService extends LanguageService {
    private readonly logService;
    private _configurationService;
    private _extensionService;
    constructor(extensionService: IExtensionService, configurationService: IConfigurationService, environmentService: IEnvironmentService, logService: ILogService);
    private updateMime;
}
