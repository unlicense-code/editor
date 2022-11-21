/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AdapterLogger, DEFAULT_LOG_LEVEL, LogLevel } from 'vs/platform/log/common/log';
function logLevelToString(level) {
    switch (level) {
        case LogLevel.Trace: return 'trace';
        case LogLevel.Debug: return 'debug';
        case LogLevel.Info: return 'info';
        case LogLevel.Warning: return 'warn';
        case LogLevel.Error: return 'error';
    }
    return 'info';
}
/**
 * A logger that is used when VSCode is running in the web with
 * an automation such as playwright. We expect a global codeAutomationLog
 * to be defined that we can use to log to.
 */
export class ConsoleLogInAutomationLogger extends AdapterLogger {
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super({ log: (level, args) => this.consoleLog(logLevelToString(level), args) }, logLevel);
    }
    consoleLog(type, args) {
        const automatedWindow = window;
        if (typeof automatedWindow.codeAutomationLog === 'function') {
            automatedWindow.codeAutomationLog(type, args);
        }
    }
}
