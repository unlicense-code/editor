import { Disposable } from 'vs/base/common/lifecycle';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { CustomEditorInput } from 'vs/workbench/contrib/customEditor/browser/customEditorInput';
import { ICustomEditorService } from 'vs/workbench/contrib/customEditor/common/customEditor';
import { IWebviewService } from 'vs/workbench/contrib/webview/browser/webview';
import { DeserializedWebview, SerializedWebview, SerializedWebviewOptions, WebviewEditorInputSerializer } from 'vs/workbench/contrib/webviewPanel/browser/webviewEditorInputSerializer';
import { IWebviewWorkbenchService } from 'vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService';
import { IWorkingCopyBackupMeta } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
export interface CustomDocumentBackupData extends IWorkingCopyBackupMeta {
    readonly viewType: string;
    readonly editorResource: UriComponents;
    backupId: string;
    readonly extension: undefined | {
        readonly location: UriComponents;
        readonly id: string;
    };
    readonly webview: {
        readonly id: string;
        readonly origin: string | undefined;
        readonly options: SerializedWebviewOptions;
        readonly state: any;
    };
}
interface SerializedCustomEditor extends SerializedWebview {
    readonly editorResource: UriComponents;
    readonly dirty: boolean;
    readonly backupId?: string;
}
interface DeserializedCustomEditor extends DeserializedWebview {
    readonly editorResource: URI;
    readonly dirty: boolean;
    readonly backupId?: string;
}
export declare class CustomEditorInputSerializer extends WebviewEditorInputSerializer {
    private readonly _instantiationService;
    private readonly _webviewService;
    static readonly ID = "workbench.editors.webviewEditor";
    constructor(webviewWorkbenchService: IWebviewWorkbenchService, _instantiationService: IInstantiationService, _webviewService: IWebviewService);
    serialize(input: CustomEditorInput): string | undefined;
    protected fromJson(data: SerializedCustomEditor): DeserializedCustomEditor;
    deserialize(_instantiationService: IInstantiationService, serializedEditorInput: string): CustomEditorInput;
}
export declare class ComplexCustomWorkingCopyEditorHandler extends Disposable implements IWorkbenchContribution {
    private readonly _instantiationService;
    private readonly _workingCopyEditorService;
    private readonly _workingCopyBackupService;
    private readonly _webviewService;
    constructor(_instantiationService: IInstantiationService, _workingCopyEditorService: IWorkingCopyEditorService, _workingCopyBackupService: IWorkingCopyBackupService, _webviewService: IWebviewService, _customEditorService: ICustomEditorService);
    private _installHandler;
}
export {};
