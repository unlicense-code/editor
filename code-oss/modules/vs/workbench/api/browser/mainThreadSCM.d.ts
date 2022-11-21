import { UriComponents } from 'vs/base/common/uri';
import { ISCMService, ISCMViewService, InputValidationType } from 'vs/workbench/contrib/scm/common/scm';
import { MainThreadSCMShape, SCMProviderFeatures, SCMRawResourceSplices, SCMGroupFeatures } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IMarkdownString } from 'vs/base/common/htmlContent';
export declare class MainThreadSCM implements MainThreadSCMShape {
    private readonly scmService;
    private readonly scmViewService;
    private readonly _proxy;
    private _repositories;
    private _repositoryDisposables;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, scmService: ISCMService, scmViewService: ISCMViewService);
    dispose(): void;
    $registerSourceControl(handle: number, id: string, label: string, rootUri: UriComponents | undefined): void;
    $updateSourceControl(handle: number, features: SCMProviderFeatures): void;
    $unregisterSourceControl(handle: number): void;
    $registerGroups(sourceControlHandle: number, groups: [number, string, string, SCMGroupFeatures][], splices: SCMRawResourceSplices[]): void;
    $updateGroup(sourceControlHandle: number, groupHandle: number, features: SCMGroupFeatures): void;
    $updateGroupLabel(sourceControlHandle: number, groupHandle: number, label: string): void;
    $spliceResourceStates(sourceControlHandle: number, splices: SCMRawResourceSplices[]): void;
    $unregisterGroup(sourceControlHandle: number, handle: number): void;
    $setInputBoxValue(sourceControlHandle: number, value: string): void;
    $setInputBoxPlaceholder(sourceControlHandle: number, placeholder: string): void;
    $setInputBoxEnablement(sourceControlHandle: number, enabled: boolean): void;
    $setInputBoxVisibility(sourceControlHandle: number, visible: boolean): void;
    $showValidationMessage(sourceControlHandle: number, message: string | IMarkdownString, type: InputValidationType): void;
    $setValidationProviderIsEnabled(sourceControlHandle: number, enabled: boolean): void;
}
