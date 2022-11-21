import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { TerminalShellType } from 'vs/platform/terminal/common/terminal';
export interface IWindowsShellHelper extends IDisposable {
    readonly onShellNameChanged: Event<string>;
    readonly onShellTypeChanged: Event<TerminalShellType>;
    getShellType(title: string): TerminalShellType;
    getShellName(): Promise<string>;
}
export declare class WindowsShellHelper extends Disposable implements IWindowsShellHelper {
    private _rootProcessId;
    private _isDisposed;
    private _currentRequest;
    private _shellType;
    get shellType(): TerminalShellType | undefined;
    private _shellTitle;
    get shellTitle(): string;
    private readonly _onShellNameChanged;
    get onShellNameChanged(): Event<string>;
    private readonly _onShellTypeChanged;
    get onShellTypeChanged(): Event<TerminalShellType>;
    constructor(_rootProcessId: number);
    private _startMonitoringShell;
    checkShell(): Promise<void>;
    private traverseTree;
    dispose(): void;
    /**
     * Returns the innermost shell executable running in the terminal
     */
    getShellName(): Promise<string>;
    getShellType(executable: string): TerminalShellType;
}
