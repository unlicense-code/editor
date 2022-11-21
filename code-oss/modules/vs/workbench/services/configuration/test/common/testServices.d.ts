import { URI } from 'vs/base/common/uri';
import { IJSONEditingService, IJSONValue } from 'vs/workbench/services/configuration/common/jsonEditing';
export declare class TestJSONEditingService implements IJSONEditingService {
    _serviceBrand: any;
    write(resource: URI, values: IJSONValue[], save: boolean): Promise<void>;
}
