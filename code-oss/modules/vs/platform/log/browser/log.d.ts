import { AdapterLogger, ILogger, LogLevel } from 'vs/platform/log/common/log';
export interface IAutomatedWindow {
    codeAutomationLog(type: string, args: any[]): void;
    codeAutomationExit(code: number): void;
}
/**
 * A logger that is used when VSCode is running in the web with
 * an automation such as playwright. We expect a global codeAutomationLog
 * to be defined that we can use to log to.
 */
export declare class ConsoleLogInAutomationLogger extends AdapterLogger implements ILogger {
    codeAutomationLog: any;
    constructor(logLevel?: LogLevel);
    private consoleLog;
}
