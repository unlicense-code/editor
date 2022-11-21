import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
export declare class DynamicEditorConfigurations extends Disposable implements IWorkbenchContribution {
    private readonly editorResolverService;
    private static readonly AUTO_LOCK_DEFAULT_ENABLED;
    private static readonly AUTO_LOCK_EXTRA_EDITORS;
    private readonly configurationRegistry;
    private autoLockConfigurationNode;
    private defaultBinaryEditorConfigurationNode;
    private editorAssociationsConfigurationNode;
    constructor(editorResolverService: IEditorResolverService, extensionService: IExtensionService);
    private registerListeners;
    private updateDynamicEditorConfigurations;
}
