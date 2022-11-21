import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { MainThreadStatusBarShape } from '../common/extHost.protocol';
import { ThemeColor } from 'vs/platform/theme/common/themeService';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { Command } from 'vs/editor/common/languages';
import { IAccessibilityInformation } from 'vs/platform/accessibility/common/accessibility';
import { IMarkdownString } from 'vs/base/common/htmlContent';
export declare class MainThreadStatusBar implements MainThreadStatusBarShape {
    private readonly statusbarService;
    private readonly entries;
    constructor(_extHostContext: IExtHostContext, statusbarService: IStatusbarService);
    dispose(): void;
    $setEntry(entryId: number, id: string, name: string, text: string, tooltip: IMarkdownString | string | undefined, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: string | ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation): void;
    $dispose(id: number): void;
}
