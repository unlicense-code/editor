import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationNode } from 'vs/platform/configuration/common/configurationRegistry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { CodeActionsExtensionPoint } from 'vs/workbench/contrib/codeActions/common/codeActionsExtensionPoint';
import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
export declare const editorConfiguration: Readonly<IConfigurationNode>;
export declare class CodeActionsContribution extends Disposable implements IWorkbenchContribution {
    private _contributedCodeActions;
    private readonly _onDidChangeContributions;
    constructor(codeActionsExtensionPoint: IExtensionPoint<CodeActionsExtensionPoint[]>, keybindingService: IKeybindingService);
    private updateConfigurationSchema;
    private getSourceActions;
    private getSchemaAdditions;
}
