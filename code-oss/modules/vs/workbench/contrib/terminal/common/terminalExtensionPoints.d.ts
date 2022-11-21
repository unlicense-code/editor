import * as extensionsRegistry from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { IExtensionTerminalProfile, IExtensionTerminalQuickFix, ITerminalContributions } from 'vs/platform/terminal/common/terminal';
export declare const terminalsExtPoint: extensionsRegistry.IExtensionPoint<ITerminalContributions>;
export interface ITerminalContributionService {
    readonly _serviceBrand: undefined;
    readonly terminalProfiles: ReadonlyArray<IExtensionTerminalProfile>;
    readonly quickFixes: Array<IExtensionTerminalQuickFix>;
}
export declare const ITerminalContributionService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITerminalContributionService>;
export declare class TerminalContributionService implements ITerminalContributionService {
    _serviceBrand: undefined;
    private _terminalProfiles;
    get terminalProfiles(): readonly IExtensionTerminalProfile[];
    private _quickFixes;
    get quickFixes(): IExtensionTerminalQuickFix[];
    constructor();
}
