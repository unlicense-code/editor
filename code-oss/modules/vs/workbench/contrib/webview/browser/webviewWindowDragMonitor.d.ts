import { Disposable } from 'vs/base/common/lifecycle';
import { IWebview } from 'vs/workbench/contrib/webview/browser/webview';
/**
 * Allows webviews to monitor when an element in the VS Code editor is being dragged/dropped.
 *
 * This is required since webview end up eating the drag event. VS Code needs to see this
 * event so it can handle editor element drag drop.
 */
export declare class WebviewWindowDragMonitor extends Disposable {
    constructor(getWebview: () => IWebview | undefined);
}
