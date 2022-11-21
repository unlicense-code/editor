import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { ReferencesController } from 'vs/editor/contrib/gotoSymbol/browser/peek/referencesController';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class WorkbenchReferencesController extends ReferencesController {
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, editorService: ICodeEditorService, notificationService: INotificationService, instantiationService: IInstantiationService, storageService: IStorageService, configurationService: IConfigurationService);
}
