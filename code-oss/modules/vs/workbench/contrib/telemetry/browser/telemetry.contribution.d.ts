import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class TelemetryContribution extends Disposable implements IWorkbenchContribution {
    private readonly telemetryService;
    private readonly contextService;
    private readonly userDataProfileService;
    private static ALLOWLIST_JSON;
    private static ALLOWLIST_WORKSPACE_JSON;
    constructor(telemetryService: ITelemetryService, contextService: IWorkspaceContextService, lifecycleService: ILifecycleService, editorService: IEditorService, keybindingsService: IKeybindingService, themeService: IWorkbenchThemeService, environmentService: IWorkbenchEnvironmentService, userDataProfileService: IUserDataProfileService, configurationService: IConfigurationService, paneCompositeService: IPaneCompositePartService, textFileService: ITextFileService);
    private onTextFileModelResolved;
    private onTextFileModelSaved;
    private getTypeIfSettings;
    private getTelemetryData;
}
