import { URI } from 'vs/base/common/uri';
import { NativeEnvironmentService } from 'vs/platform/environment/node/environmentService';
export declare class SharedProcessEnvironmentService extends NativeEnvironmentService {
    get userRoamingDataHome(): URI;
}
