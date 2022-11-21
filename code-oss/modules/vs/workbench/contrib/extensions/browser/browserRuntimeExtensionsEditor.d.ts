import { Action } from 'vs/base/common/actions';
import { IExtensionHostProfile } from 'vs/workbench/services/extensions/common/extensions';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { AbstractRuntimeExtensionsEditor, IRuntimeExtension } from 'vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor';
export declare class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    protected _getProfileInfo(): IExtensionHostProfile | null;
    protected _getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    protected _createSlowExtensionAction(element: IRuntimeExtension): Action | null;
    protected _createReportExtensionIssueAction(element: IRuntimeExtension): Action | null;
    protected _createSaveExtensionHostProfileAction(): Action | null;
    protected _createProfileAction(): Action | null;
}
