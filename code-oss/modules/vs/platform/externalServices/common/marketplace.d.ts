import { IHeaders } from 'vs/base/parts/request/common/request';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare function resolveMarketplaceHeaders(version: string, productService: IProductService, environmentService: IEnvironmentService, configurationService: IConfigurationService, fileService: IFileService, storageService: IStorageService | undefined, telemetryService: ITelemetryService): Promise<IHeaders>;
