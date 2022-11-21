import { IPartsSplash } from 'vs/platform/theme/common/themeService';
export declare const ISplashStorageService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISplashStorageService>;
export interface ISplashStorageService {
    readonly _serviceBrand: undefined;
    saveWindowSplash(splash: IPartsSplash): Promise<void>;
}
