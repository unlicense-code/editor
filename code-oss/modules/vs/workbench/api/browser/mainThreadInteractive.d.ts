import { MainThreadInteractiveShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IInteractiveDocumentService } from 'vs/workbench/contrib/interactive/browser/interactiveDocumentService';
export declare class MainThreadInteractive implements MainThreadInteractiveShape {
    private readonly _proxy;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, interactiveDocumentService: IInteractiveDocumentService);
    dispose(): void;
}
