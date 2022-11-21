import { URI } from 'vs/base/common/uri';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfiguration';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class TestTextResourcePropertiesService implements ITextResourcePropertiesService {
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(configurationService: IConfigurationService);
    getEOL(resource: URI, language?: string): string;
}
