import { Disposable } from 'vs/base/common/lifecycle';
import { IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
export declare class AudioCueLineDebuggerContribution extends Disposable implements IWorkbenchContribution {
    private readonly audioCueService;
    constructor(debugService: IDebugService, audioCueService: IAudioCueService);
    private handleSession;
}
