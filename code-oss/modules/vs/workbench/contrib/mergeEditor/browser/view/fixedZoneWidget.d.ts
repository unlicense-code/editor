import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor, IViewZoneChangeAccessor } from 'vs/editor/browser/editorBrowser';
export declare abstract class FixedZoneWidget extends Disposable {
    private readonly editor;
    private static counter;
    private readonly overlayWidgetId;
    private readonly viewZoneId;
    protected readonly widgetDomNode: HTMLDivElement;
    private readonly overlayWidget;
    constructor(editor: ICodeEditor, viewZoneAccessor: IViewZoneChangeAccessor, afterLineNumber: number, height: number, viewZoneIdsToCleanUp: string[]);
}
