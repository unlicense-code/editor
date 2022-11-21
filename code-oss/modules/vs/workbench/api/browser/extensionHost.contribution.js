/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
// --- other interested parties
import { JSONValidationExtensionPoint } from 'vs/workbench/api/common/jsonValidationExtensionPoint';
import { ColorExtensionPoint } from 'vs/workbench/services/themes/common/colorExtensionPoint';
import { IconExtensionPoint } from 'vs/workbench/services/themes/common/iconExtensionPoint';
import { TokenClassificationExtensionPoints } from 'vs/workbench/services/themes/common/tokenClassificationExtensionPoint';
import { LanguageConfigurationFileHandler } from 'vs/workbench/contrib/codeEditor/browser/languageConfigurationExtensionPoint';
// --- mainThread participants
import './mainThreadLocalization';
import './mainThreadBulkEdits';
import './mainThreadCodeInsets';
import './mainThreadCLICommands';
import './mainThreadClipboard';
import './mainThreadCommands';
import './mainThreadConfiguration';
import './mainThreadConsole';
import './mainThreadDebugService';
import './mainThreadDecorations';
import './mainThreadDiagnostics';
import './mainThreadDialogs';
import './mainThreadDocumentContentProviders';
import './mainThreadDocuments';
import './mainThreadDocumentsAndEditors';
import './mainThreadEditor';
import './mainThreadEditors';
import './mainThreadEditorTabs';
import './mainThreadErrors';
import './mainThreadExtensionService';
import './mainThreadFileSystem';
import './mainThreadFileSystemEventService';
import './mainThreadKeytar';
import './mainThreadLanguageFeatures';
import './mainThreadLanguages';
import './mainThreadLogService';
import './mainThreadMessageService';
import './mainThreadOutputService';
import './mainThreadProgress';
import './mainThreadQuickOpen';
import './mainThreadRemoteConnectionData';
import './mainThreadSaveParticipant';
import './mainThreadSCM';
import './mainThreadSearch';
import './mainThreadStatusBar';
import './mainThreadStorage';
import './mainThreadTelemetry';
import './mainThreadTerminalService';
import './mainThreadTheming';
import './mainThreadTreeViews';
import './mainThreadDownloadService';
import './mainThreadUrls';
import './mainThreadUriOpeners';
import './mainThreadWindow';
import './mainThreadWebviewManager';
import './mainThreadWorkspace';
import './mainThreadComments';
import './mainThreadNotebook';
import './mainThreadNotebookKernels';
import './mainThreadNotebookDocumentsAndEditors';
import './mainThreadNotebookRenderers';
import './mainThreadInteractive';
import './mainThreadTask';
import './mainThreadLabelService';
import './mainThreadTunnelService';
import './mainThreadAuthentication';
import './mainThreadTimeline';
import './mainThreadTesting';
import './mainThreadSecretState';
let ExtensionPoints = class ExtensionPoints {
    instantiationService;
    constructor(instantiationService) {
        this.instantiationService = instantiationService;
        // Classes that handle extension points...
        this.instantiationService.createInstance(JSONValidationExtensionPoint);
        this.instantiationService.createInstance(ColorExtensionPoint);
        this.instantiationService.createInstance(IconExtensionPoint);
        this.instantiationService.createInstance(TokenClassificationExtensionPoints);
        this.instantiationService.createInstance(LanguageConfigurationFileHandler);
    }
};
ExtensionPoints = __decorate([
    __param(0, IInstantiationService)
], ExtensionPoints);
export { ExtensionPoints };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ExtensionPoints, 1 /* LifecyclePhase.Starting */);
