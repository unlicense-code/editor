/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Event } from 'vs/base/common/event';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { AbstractLogger, DEFAULT_LOG_LEVEL, LogLevel } from 'vs/platform/log/common/log';
import { TelemetryLogAppender } from 'vs/platform/telemetry/common/telemetryLogAppender';
class TestTelemetryLogger extends AbstractLogger {
    logs = [];
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.setLevel(logLevel);
    }
    trace(message, ...args) {
        if (this.getLevel() <= LogLevel.Trace) {
            this.logs.push(message + JSON.stringify(args));
        }
    }
    debug(message, ...args) {
        if (this.getLevel() <= LogLevel.Debug) {
            this.logs.push(message);
        }
    }
    info(message, ...args) {
        if (this.getLevel() <= LogLevel.Info) {
            this.logs.push(message);
        }
    }
    warn(message, ...args) {
        if (this.getLevel() <= LogLevel.Warning) {
            this.logs.push(message.toString());
        }
    }
    error(message, ...args) {
        if (this.getLevel() <= LogLevel.Error) {
            this.logs.push(message);
        }
    }
    dispose() { }
    flush() { }
}
export class TestTelemetryLoggerService {
    logLevel;
    _serviceBrand;
    logger;
    constructor(logLevel) {
        this.logLevel = logLevel;
    }
    getLogger() {
        return this.logger;
    }
    createLogger() {
        if (!this.logger) {
            this.logger = new TestTelemetryLogger(this.logLevel);
        }
        return this.logger;
    }
    onDidChangeLogLevel = Event.None;
    setLevel() { }
    getLogLevel() { return undefined; }
    getDefaultLogLevel() { return this.logLevel; }
}
suite('TelemetryLogAdapter', () => {
    test('Do not Log Telemetry if log level is not trace', async () => {
        const testLoggerService = new TestTelemetryLoggerService(DEFAULT_LOG_LEVEL);
        const testObject = new TelemetryLogAppender(testLoggerService, new TestInstantiationService().stub(IEnvironmentService, {}));
        testObject.log('testEvent', { hello: 'world', isTrue: true, numberBetween1And3: 2 });
        assert.strictEqual(testLoggerService.createLogger().logs.length, 2);
    });
    test('Log Telemetry if log level is trace', async () => {
        const testLoggerService = new TestTelemetryLoggerService(LogLevel.Trace);
        const testObject = new TelemetryLogAppender(testLoggerService, new TestInstantiationService().stub(IEnvironmentService, {}));
        testObject.log('testEvent', { hello: 'world', isTrue: true, numberBetween1And3: 2 });
        assert.strictEqual(testLoggerService.createLogger().logs[2], 'telemetry/testEvent' + JSON.stringify([{
                properties: {
                    hello: 'world',
                },
                measurements: {
                    isTrue: 1, numberBetween1And3: 2
                }
            }]));
    });
});
