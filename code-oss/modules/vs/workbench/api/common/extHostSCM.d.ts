import { UriComponents } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { ExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { MainThreadSCMShape, IMainContext, ExtHostSCMShape } from './extHost.protocol';
import type * as vscode from 'vscode';
import { ILogService } from 'vs/platform/log/common/log';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IMarkdownString } from 'vs/base/common/htmlContent';
export interface IValidateInput {
    (value: string, cursorPosition: number): vscode.ProviderResult<vscode.SourceControlInputBoxValidation | undefined | null>;
}
export declare class ExtHostSCMInputBox implements vscode.SourceControlInputBox {
    #private;
    private _extension;
    private _sourceControlHandle;
    private _value;
    get value(): string;
    set value(value: string);
    private readonly _onDidChange;
    get onDidChange(): Event<string>;
    private _placeholder;
    get placeholder(): string;
    set placeholder(placeholder: string);
    private _validateInput;
    get validateInput(): IValidateInput | undefined;
    set validateInput(fn: IValidateInput | undefined);
    private _enabled;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    private _visible;
    get visible(): boolean;
    set visible(visible: boolean);
    constructor(_extension: IExtensionDescription, proxy: MainThreadSCMShape, _sourceControlHandle: number);
    showValidationMessage(message: string | vscode.MarkdownString, type: vscode.SourceControlInputBoxValidationType): void;
    $onInputBoxValueChange(value: string): void;
    private updateValue;
}
export declare class ExtHostSCM implements ExtHostSCMShape {
    private _commands;
    private readonly logService;
    private static _handlePool;
    private _proxy;
    private readonly _telemetry;
    private _sourceControls;
    private _sourceControlsByExtension;
    private readonly _onDidChangeActiveProvider;
    get onDidChangeActiveProvider(): Event<vscode.SourceControl>;
    private _selectedSourceControlHandle;
    constructor(mainContext: IMainContext, _commands: ExtHostCommands, logService: ILogService);
    createSourceControl(extension: IExtensionDescription, id: string, label: string, rootUri: vscode.Uri | undefined): vscode.SourceControl;
    getLastInputBox(extension: IExtensionDescription): ExtHostSCMInputBox | undefined;
    $provideOriginalResource(sourceControlHandle: number, uriComponents: UriComponents, token: CancellationToken): Promise<UriComponents | null>;
    $onInputBoxValueChange(sourceControlHandle: number, value: string): Promise<void>;
    $executeResourceCommand(sourceControlHandle: number, groupHandle: number, handle: number, preserveFocus: boolean): Promise<void>;
    $validateInput(sourceControlHandle: number, value: string, cursorPosition: number): Promise<[string | IMarkdownString, number] | undefined>;
    $setSelectedSourceControl(selectedSourceControlHandle: number | undefined): Promise<void>;
}
