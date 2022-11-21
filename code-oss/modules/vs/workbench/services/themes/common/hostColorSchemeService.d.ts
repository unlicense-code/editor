import { Event } from 'vs/base/common/event';
export declare const IHostColorSchemeService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IHostColorSchemeService>;
export interface IHostColorSchemeService {
    readonly _serviceBrand: undefined;
    readonly dark: boolean;
    readonly highContrast: boolean;
    readonly onDidChangeColorScheme: Event<void>;
}
