/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { LogService, ConsoleLogger, MultiplexLogService } from 'vs/platform/log/common/log';
import { FollowerLogService } from 'vs/platform/log/common/logIpc';
import { DisposableStore } from 'vs/base/common/lifecycle';
export class NativeLogService extends LogService {
    constructor(name, logLevel, loggerService, loggerClient, environmentService) {
        const disposables = new DisposableStore();
        const loggers = [];
        // Always log to file
        loggers.push(disposables.add(loggerService.createLogger(environmentService.logFile, { name })));
        // Extension development test CLI: forward everything to main side
        if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
            loggers.push(loggerService.createConsoleMainLogger());
        }
        // Normal mode: Log to console
        else {
            loggers.push(disposables.add(new ConsoleLogger(logLevel)));
        }
        const multiplexLogger = disposables.add(new MultiplexLogService(loggers));
        const followerLogger = disposables.add(new FollowerLogService(loggerClient, multiplexLogger));
        super(followerLogger);
        this._register(disposables);
    }
}
