import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ViewsWelcomeExtensionPoint } from './viewsWelcomeExtensionPoint';
export declare class ViewsWelcomeContribution extends Disposable implements IWorkbenchContribution {
    private viewWelcomeContents;
    constructor(extensionPoint: IExtensionPoint<ViewsWelcomeExtensionPoint>);
}
