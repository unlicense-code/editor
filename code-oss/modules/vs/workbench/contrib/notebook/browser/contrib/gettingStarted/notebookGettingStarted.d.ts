import { Disposable } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
/**
 * Sets a context key when a notebook has ever been opened by the user
 */
export declare class NotebookGettingStarted extends Disposable implements IWorkbenchContribution {
    constructor(_editorService: IEditorService, _storageService: IStorageService, _contextKeyService: IContextKeyService, _commandService: ICommandService, _configurationService: IConfigurationService);
}
