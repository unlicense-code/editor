/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function reportSample(data, telemetryService, logService) {
    const { sample, perfBaseline, source } = data;
    // log a fake error with a clearer stack
    const fakeError = new Error(`[PerfSampleError]|${sample.selfTime}ms`);
    fakeError.name = 'PerfSampleError';
    fakeError.stack = `${fakeError.message} by ${data.source} in ${sample.location}\n` + sample.caller.map(c => `\t at ${c.location} (${c.percentage}%)`).join('\n');
    logService.error(fakeError);
    // send telemetry event
    telemetryService.publicLog2(`unresponsive.sample`, {
        perfBaseline,
        selfTime: sample.selfTime,
        totalTime: sample.totalTime,
        percentage: sample.percentage,
        functionName: sample.location,
        callers: sample.caller.map(c => c.location).join('<'),
        callersAnnotated: sample.caller.map(c => `${c.percentage}|${c.location}`).join('<'),
        source
    });
}
