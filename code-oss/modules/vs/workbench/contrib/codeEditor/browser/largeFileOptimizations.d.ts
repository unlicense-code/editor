import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService } from 'vs/platform/notification/common/notification';
/**
 * Shows a message when opening a large file which has been memory optimized (and features disabled).
 */
export declare class LargeFileOptimizationsWarner extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _notificationService;
    private readonly _configurationService;
    static readonly ID = "editor.contrib.largeFileOptimizationsWarner";
    constructor(_editor: ICodeEditor, _notificationService: INotificationService, _configurationService: IConfigurationService);
}
