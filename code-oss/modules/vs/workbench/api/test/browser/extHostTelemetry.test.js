/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { URI } from 'vs/base/common/uri';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { DEFAULT_LOG_LEVEL, LogLevel } from 'vs/platform/log/common/log';
import { TestTelemetryLoggerService } from 'vs/platform/telemetry/test/common/telemetryLogAppender.test';
import { ExtHostTelemetry } from 'vs/workbench/api/common/extHostTelemetry';
import { mock } from 'vs/workbench/test/common/workbenchTestServices';
suite('ExtHostTelemetry', function () {
    const mockEnvironment = {
        isExtensionDevelopmentDebug: false,
        extensionDevelopmentLocationURI: undefined,
        extensionTestsLocationURI: undefined,
        appRoot: undefined,
        appName: 'test',
        extensionTelemetryLogResource: URI.parse('fake'),
        appHost: 'test',
        appLanguage: 'en',
        globalStorageHome: URI.parse('fake'),
        workspaceStorageHome: URI.parse('fake'),
        appUriScheme: 'test',
    };
    const mockTelemetryInfo = {
        firstSessionDate: '2020-01-01T00:00:00.000Z',
        sessionId: 'test',
        machineId: 'test',
    };
    const mockRemote = {
        authority: 'test',
        isRemote: false,
        connectionData: null
    };
    const mockExtensionIdentifier = {
        identifier: new ExtensionIdentifier('test-extension'),
        targetPlatform: "universal" /* TargetPlatform.UNIVERSAL */,
        isBuiltin: true,
        isUserBuiltin: true,
        isUnderDevelopment: true,
        name: 'test-extension',
        publisher: 'vscode',
        version: '1.0.0',
        engines: { vscode: '*' },
        extensionLocation: URI.parse('fake')
    };
    const createExtHostTelemetry = () => {
        const extensionTelemetry = new ExtHostTelemetry(new class extends mock() {
            environment = mockEnvironment;
            telemetryInfo = mockTelemetryInfo;
            remote = mockRemote;
        }, new TestTelemetryLoggerService(DEFAULT_LOG_LEVEL));
        extensionTelemetry.$initializeTelemetryLevel(3 /* TelemetryLevel.USAGE */, false, { usage: true, error: true });
        return extensionTelemetry;
    };
    const createLogger = (functionSpy, extHostTelemetry) => {
        const extensionTelemetry = extHostTelemetry ?? createExtHostTelemetry();
        // This is the appender which the extension would contribute
        const appender = {
            logEvent: (eventName, data) => {
                functionSpy.dataArr.push({ eventName, data });
            },
            logException: (exception, data) => {
                functionSpy.exceptionArr.push({ exception, data });
            },
            ignoreBuiltInCommonProperties: false,
            flush: () => {
                functionSpy.flushCalled = true;
            }
        };
        const logger = extensionTelemetry.instantiateLogger(mockExtensionIdentifier, appender);
        return logger;
    };
    test('Ensure logger gets proper telemetry level during initialization', function () {
        const extensionTelemetry = createExtHostTelemetry();
        let config = extensionTelemetry.getTelemetryDetails();
        assert.strictEqual(config.isCrashEnabled, true);
        assert.strictEqual(config.isUsageEnabled, true);
        assert.strictEqual(config.isErrorsEnabled, true);
        // Initialize would never be called twice, but this is just for testing
        extensionTelemetry.$initializeTelemetryLevel(2 /* TelemetryLevel.ERROR */, false, { usage: true, error: true });
        config = extensionTelemetry.getTelemetryDetails();
        assert.strictEqual(config.isCrashEnabled, true);
        assert.strictEqual(config.isUsageEnabled, false);
        assert.strictEqual(config.isErrorsEnabled, true);
        extensionTelemetry.$initializeTelemetryLevel(1 /* TelemetryLevel.CRASH */, false, { usage: true, error: true });
        config = extensionTelemetry.getTelemetryDetails();
        assert.strictEqual(config.isCrashEnabled, true);
        assert.strictEqual(config.isUsageEnabled, false);
        assert.strictEqual(config.isErrorsEnabled, false);
        extensionTelemetry.$initializeTelemetryLevel(3 /* TelemetryLevel.USAGE */, false, { usage: false, error: true });
        config = extensionTelemetry.getTelemetryDetails();
        assert.strictEqual(config.isCrashEnabled, true);
        assert.strictEqual(config.isUsageEnabled, false);
        assert.strictEqual(config.isErrorsEnabled, true);
    });
    test('Simple log event to TelemetryLogger', function () {
        const functionSpy = { dataArr: [], exceptionArr: [], flushCalled: false };
        const logger = createLogger(functionSpy);
        logger.logUsage('test-event', { 'test-data': 'test-data' });
        assert.strictEqual(functionSpy.dataArr.length, 1);
        assert.strictEqual(functionSpy.dataArr[0].eventName, `${mockExtensionIdentifier.name}/test-event`);
        assert.strictEqual(functionSpy.dataArr[0].data['test-data'], 'test-data');
        logger.logUsage('test-event', { 'test-data': 'test-data' });
        assert.strictEqual(functionSpy.dataArr.length, 2);
        logger.logError('test-event', { 'test-data': 'test-data' });
        assert.strictEqual(functionSpy.dataArr.length, 3);
        logger.logError(new Error('test-error'), { 'test-data': 'test-data' });
        assert.strictEqual(functionSpy.dataArr.length, 3);
        assert.strictEqual(functionSpy.exceptionArr.length, 1);
        // Assert not flushed
        assert.strictEqual(functionSpy.flushCalled, false);
        // Call flush and assert that flush occurs
        logger.dispose();
        assert.strictEqual(functionSpy.flushCalled, true);
    });
    test('Ensure logger properly cleans PII', function () {
        const functionSpy = { dataArr: [], exceptionArr: [], flushCalled: false };
        const logger = createLogger(functionSpy);
        // Log an event with a bunch of PII, this should all get cleaned out
        logger.logUsage('test-event', {
            'fake-password': 'pwd=123',
            'fake-email': 'no-reply@example.com',
            'fake-token': 'token=123',
            'fake-slack-token': 'xoxp-123',
            'fake-path': '/Users/username/.vscode/extensions',
        });
        assert.strictEqual(functionSpy.dataArr.length, 1);
        assert.strictEqual(functionSpy.dataArr[0].eventName, `${mockExtensionIdentifier.name}/test-event`);
        assert.strictEqual(functionSpy.dataArr[0].data['fake-password'], '<REDACTED: Generic Secret>');
        assert.strictEqual(functionSpy.dataArr[0].data['fake-email'], '<REDACTED: Email>');
        assert.strictEqual(functionSpy.dataArr[0].data['fake-token'], '<REDACTED: Generic Secret>');
        assert.strictEqual(functionSpy.dataArr[0].data['fake-slack-token'], '<REDACTED: Slack Token>');
        assert.strictEqual(functionSpy.dataArr[0].data['fake-path'], '<REDACTED: user-file-path>');
    });
    test('Ensure output channel is logged to', function () {
        // Have to re-duplicate code here because I the logger service isn't exposed in the simple setup functions
        const loggerService = new TestTelemetryLoggerService(LogLevel.Trace);
        const extensionTelemetry = new ExtHostTelemetry(new class extends mock() {
            environment = mockEnvironment;
            telemetryInfo = mockTelemetryInfo;
            remote = mockRemote;
        }, loggerService);
        extensionTelemetry.$initializeTelemetryLevel(3 /* TelemetryLevel.USAGE */, false, { usage: true, error: true });
        const functionSpy = { dataArr: [], exceptionArr: [], flushCalled: false };
        const logger = createLogger(functionSpy, extensionTelemetry);
        // Ensure headers are logged on instantiation
        assert.strictEqual(loggerService.createLogger().logs.length, 2);
        logger.logUsage('test-event', { 'test-data': 'test-data' });
        // Initial header is logged then the event
        const logs = loggerService.createLogger().logs;
        console.log(logs[0]);
        assert.strictEqual(loggerService.createLogger().logs.length, 3);
        assert.ok(loggerService.createLogger().logs[2].startsWith('test-extension/test-event'));
    });
});
