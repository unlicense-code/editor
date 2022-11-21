import { ITunnel, ITunnelOptions, IWorkbenchConstructionOptions } from 'vs/workbench/browser/web.api';
import { URI } from 'vs/base/common/uri';
import { IDisposable } from 'vs/base/common/lifecycle';
import { PerformanceMark } from 'vs/base/common/performance';
import { IProgress, IProgressCompositeOptions, IProgressDialogOptions, IProgressNotificationOptions, IProgressOptions, IProgressStep, IProgressWindowOptions } from 'vs/platform/progress/common/progress';
import { IObservableValue } from 'vs/base/common/observableValue';
import { TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { LogLevel } from 'vs/platform/log/common/log';
/**
 * Creates the workbench with the provided options in the provided container.
 *
 * @param domElement the container to create the workbench in
 * @param options for setting up the workbench
 */
export declare function create(domElement: HTMLElement, options: IWorkbenchConstructionOptions): IDisposable;
export declare namespace commands {
    /**
     * {@linkcode IWorkbench.commands IWorkbench.commands.executeCommand}
     */
    function executeCommand(command: string, ...args: any[]): Promise<unknown>;
}
export declare namespace logger {
    /**
     * {@linkcode IWorkbench.logger IWorkbench.logger.log}
     */
    function log(level: LogLevel, message: string): void;
}
export declare namespace env {
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.retrievePerformanceMarks}
     */
    function retrievePerformanceMarks(): Promise<[string, readonly PerformanceMark[]][]>;
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.getUriScheme}
     */
    function getUriScheme(): Promise<string>;
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.openUri}
     */
    function openUri(target: URI): Promise<boolean>;
    /**
     * {@linkcode IWorkbench.env IWorkbench.env.telemetryLevel}
     */
    const telemetryLevel: Promise<IObservableValue<TelemetryLevel>>;
}
export declare namespace window {
    /**
     * {@linkcode IWorkbench.window IWorkbench.window.withProgress}
     */
    function withProgress<R>(options: IProgressOptions | IProgressDialogOptions | IProgressNotificationOptions | IProgressWindowOptions | IProgressCompositeOptions, task: (progress: IProgress<IProgressStep>) => Promise<R>): Promise<R>;
}
export declare namespace workspace {
    /**
     * {@linkcode IWorkbench.workspace IWorkbench.workspace.openTunnel}
     */
    function openTunnel(tunnelOptions: ITunnelOptions): Promise<ITunnel>;
}
