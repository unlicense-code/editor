import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { MainThreadUriOpenersShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExternalOpenerProvider, IExternalUriOpener, IExternalUriOpenerService } from 'vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers';
export declare class MainThreadUriOpeners extends Disposable implements MainThreadUriOpenersShape, IExternalOpenerProvider {
    private readonly extensionService;
    private readonly openerService;
    private readonly notificationService;
    private readonly proxy;
    private readonly _registeredOpeners;
    private readonly _contributedExternalUriOpenersStore;
    constructor(context: IExtHostContext, storageService: IStorageService, externalUriOpenerService: IExternalUriOpenerService, extensionService: IExtensionService, openerService: IOpenerService, notificationService: INotificationService);
    getOpeners(targetUri: URI): AsyncIterable<IExternalUriOpener>;
    private createOpener;
    $registerUriOpener(id: string, schemes: readonly string[], extensionId: ExtensionIdentifier, label: string): Promise<void>;
    $unregisterUriOpener(id: string): Promise<void>;
    dispose(): void;
}
