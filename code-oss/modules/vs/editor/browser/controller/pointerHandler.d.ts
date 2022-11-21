import { Disposable } from 'vs/base/common/lifecycle';
import { IPointerHandlerHelper, MouseHandler } from 'vs/editor/browser/controller/mouseHandler';
import { IMouseTarget } from 'vs/editor/browser/editorBrowser';
import { EditorMouseEvent } from 'vs/editor/browser/editorDom';
import { ViewController } from 'vs/editor/browser/view/viewController';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
/**
 * Currently only tested on iOS 13/ iPadOS.
 */
export declare class PointerEventHandler extends MouseHandler {
    private _lastPointerType;
    constructor(context: ViewContext, viewController: ViewController, viewHelper: IPointerHandlerHelper);
    private onTap;
    private onChange;
    _onMouseDown(e: EditorMouseEvent, pointerId: number): void;
}
export declare class PointerHandler extends Disposable {
    private readonly handler;
    constructor(context: ViewContext, viewController: ViewController, viewHelper: IPointerHandlerHelper);
    getTargetAtClientPoint(clientX: number, clientY: number): IMouseTarget | null;
}
