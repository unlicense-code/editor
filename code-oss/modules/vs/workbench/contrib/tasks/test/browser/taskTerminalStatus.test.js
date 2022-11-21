/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ok } from 'assert';
import { Emitter } from 'vs/base/common/event';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { ACTIVE_TASK_STATUS, FAILED_TASK_STATUS, SUCCEEDED_TASK_STATUS, TaskTerminalStatus } from 'vs/workbench/contrib/tasks/browser/taskTerminalStatus';
import { CommonTask } from 'vs/workbench/contrib/tasks/common/tasks';
import { TerminalStatusList } from 'vs/workbench/contrib/terminal/browser/terminalStatusList';
class TestTaskService {
    _onDidStateChange = new Emitter();
    get onDidStateChange() {
        return this._onDidStateChange.event;
    }
    triggerStateChange(event) {
        this._onDidStateChange.fire(event);
    }
}
class TestAudioCueService {
    async playAudioCue(cue) {
        return;
    }
}
class TestTerminal {
    statusList = new TerminalStatusList(new TestConfigurationService());
}
class TestTask extends CommonTask {
    constructor() {
        super('test', undefined, undefined, {}, {}, { kind: '', label: '' });
    }
    getFolderId() {
        throw new Error('Method not implemented.');
    }
    fromObject(object) {
        throw new Error('Method not implemented.');
    }
}
class TestProblemCollector {
    _onDidFindFirstMatch = new Emitter();
    onDidFindFirstMatch = this._onDidFindFirstMatch.event;
    _onDidFindErrors = new Emitter();
    onDidFindErrors = this._onDidFindErrors.event;
    _onDidRequestInvalidateLastMarker = new Emitter();
    onDidRequestInvalidateLastMarker = this._onDidRequestInvalidateLastMarker.event;
}
suite('Task Terminal Status', () => {
    let instantiationService;
    let taskService;
    let taskTerminalStatus;
    let testTerminal;
    let testTask;
    let problemCollector;
    let audioCueService;
    setup(() => {
        instantiationService = new TestInstantiationService();
        taskService = new TestTaskService();
        audioCueService = new TestAudioCueService();
        taskTerminalStatus = new TaskTerminalStatus(taskService, audioCueService);
        testTerminal = instantiationService.createInstance(TestTerminal);
        testTask = instantiationService.createInstance(TestTask);
        problemCollector = instantiationService.createInstance(TestProblemCollector);
    });
    test('Should add failed status when there is an exit code on task end', async () => {
        taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
        taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */ });
        assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
        taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
        assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
        taskService.triggerStateChange({ kind: "end" /* TaskEventKind.End */, exitCode: 2 });
        await poll(async () => Promise.resolve(), () => testTerminal?.statusList.primary?.id === FAILED_TASK_STATUS.id, 'terminal status should be updated');
    });
    test('Should add active status when a non-background task is run for a second time in the same terminal', () => {
        taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
        taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */ });
        assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
        taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
        assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
        taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "singleRun" /* TaskRunType.SingleRun */ });
        assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
        taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
        assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
    });
    test('Should drop status when a background task exits', async () => {
        taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
        taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "background" /* TaskRunType.Background */ });
        assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
        taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
        assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
        taskService.triggerStateChange({ kind: "processEnded" /* TaskEventKind.ProcessEnded */, exitCode: 0 });
        await poll(async () => Promise.resolve(), () => testTerminal?.statusList.statuses?.includes(SUCCEEDED_TASK_STATUS) === false, 'terminal should have dropped status');
    });
    test('Should add succeeded status when a non-background task exits', () => {
        taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
        taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "singleRun" /* TaskRunType.SingleRun */ });
        assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
        taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
        assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
        taskService.triggerStateChange({ kind: "processEnded" /* TaskEventKind.ProcessEnded */, exitCode: 0 });
        assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
    });
});
function assertStatus(actual, expected) {
    ok(actual.statuses.length === 1, '# of statuses');
    ok(actual.primary?.id === expected.id, 'ID');
    ok(actual.primary?.severity === expected.severity, 'Severity');
}
async function poll(fn, acceptFn, timeoutMessage, retryCount = 200, retryInterval = 10 // millis
) {
    let trial = 1;
    let lastError = '';
    while (true) {
        if (trial > retryCount) {
            throw new Error(`Timeout: ${timeoutMessage} after ${(retryCount * retryInterval) / 1000} seconds.\r${lastError}`);
        }
        let result;
        try {
            result = await fn();
            if (acceptFn(result)) {
                return result;
            }
            else {
                lastError = 'Did not pass accept function';
            }
        }
        catch (e) {
            lastError = Array.isArray(e.stack) ? e.stack.join('\n') : e.stack;
        }
        await new Promise(resolve => setTimeout(resolve, retryInterval));
        trial++;
    }
}
