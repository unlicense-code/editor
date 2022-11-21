import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
export declare class UrlFinder extends Disposable {
    private static readonly terminalCodesRegex;
    /**
     * Local server url pattern matching following urls:
     * http://localhost:3000/ - commonly used across multiple frameworks
     * https://127.0.0.1:5001/ - ASP.NET
     * http://:8080 - Beego Golang
     * http://0.0.0.0:4000 - Elixir Phoenix
     */
    private static readonly localUrlRegex;
    private static readonly extractPortRegex;
    /**
     * https://github.com/microsoft/vscode-remote-release/issues/3949
     */
    private static readonly localPythonServerRegex;
    private static readonly excludeTerminals;
    private _onDidMatchLocalUrl;
    readonly onDidMatchLocalUrl: import("vs/base/common/event").Event<{
        host: string;
        port: number;
    }>;
    private listeners;
    constructor(terminalService: ITerminalService, debugService: IDebugService);
    private registerTerminalInstance;
    private replPositions;
    private processNewReplElements;
    dispose(): void;
    private processData;
}
