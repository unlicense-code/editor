import { IDisposable } from 'vs/base/common/lifecycle';
import { ITerminalWidget } from 'vs/workbench/contrib/terminal/browser/widgets/widgets';
export declare class TerminalWidgetManager implements IDisposable {
    private _container;
    private _attached;
    attachToElement(terminalWrapper: HTMLElement): void;
    dispose(): void;
    attachWidget(widget: ITerminalWidget): IDisposable | undefined;
}
