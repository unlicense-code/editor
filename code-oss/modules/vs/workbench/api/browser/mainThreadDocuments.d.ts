import { IReference, Disposable } from 'vs/base/common/lifecycle';
import { URI, UriComponents } from 'vs/base/common/uri';
import { ITextModel } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IFileService } from 'vs/platform/files/common/files';
import { MainThreadDocumentsShape } from 'vs/workbench/api/common/extHost.protocol';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtUri } from 'vs/base/common/resources';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
export declare class BoundModelReferenceCollection {
    private readonly _extUri;
    private readonly _maxAge;
    private readonly _maxLength;
    private readonly _maxSize;
    private _data;
    private _length;
    constructor(_extUri: IExtUri, _maxAge?: number, // auto-dispse by age
    _maxLength?: number, // auto-dispose by total length
    _maxSize?: number);
    dispose(): void;
    remove(uri: URI): void;
    add(uri: URI, ref: IReference<any>, length?: number): void;
    private _cleanup;
}
export declare class MainThreadDocuments extends Disposable implements MainThreadDocumentsShape {
    private readonly _modelService;
    private readonly _textFileService;
    private readonly _fileService;
    private readonly _textModelResolverService;
    private readonly _environmentService;
    private readonly _uriIdentityService;
    private readonly _pathService;
    private _onIsCaughtUpWithContentChanges;
    readonly onIsCaughtUpWithContentChanges: import("vs/base/common/event").Event<URI>;
    private readonly _proxy;
    private readonly _modelTrackers;
    private readonly _modelReferenceCollection;
    constructor(extHostContext: IExtHostContext, _modelService: IModelService, _textFileService: ITextFileService, _fileService: IFileService, _textModelResolverService: ITextModelService, _environmentService: IWorkbenchEnvironmentService, _uriIdentityService: IUriIdentityService, workingCopyFileService: IWorkingCopyFileService, _pathService: IPathService);
    dispose(): void;
    isCaughtUpWithContentChanges(resource: URI): boolean;
    private _shouldHandleFileEvent;
    handleModelAdded(model: ITextModel): void;
    private _onModelModeChanged;
    handleModelRemoved(modelUrl: URI): void;
    $trySaveDocument(uri: UriComponents): Promise<boolean>;
    $tryOpenDocument(uriData: UriComponents): Promise<URI>;
    $tryCreateDocument(options?: {
        language?: string;
        content?: string;
    }): Promise<URI>;
    private _handleAsResourceInput;
    private _handleUntitledScheme;
    private _doCreateUntitled;
}
