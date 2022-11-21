import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { OperatingSystem } from 'vs/base/common/platform';
import { IExtensionTerminalProfile, ITerminalProfile } from 'vs/platform/terminal/common/terminal';
export declare const terminalColorSchema: IJSONSchema;
export declare const terminalIconSchema: IJSONSchema;
/**
 * Registers terminal configurations required by shared process and remote server.
 */
export declare function registerTerminalPlatformConfiguration(): void;
export declare function registerTerminalDefaultProfileConfiguration(detectedProfiles?: {
    os: OperatingSystem;
    profiles: ITerminalProfile[];
}, extensionContributedProfiles?: readonly IExtensionTerminalProfile[]): void;
