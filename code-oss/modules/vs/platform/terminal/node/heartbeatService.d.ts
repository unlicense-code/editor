import { Disposable } from 'vs/base/common/lifecycle';
import { IHeartbeatService } from 'vs/platform/terminal/common/terminal';
export declare class HeartbeatService extends Disposable implements IHeartbeatService {
    private readonly _onBeat;
    readonly onBeat: import("vs/base/common/event").Event<void>;
    constructor();
}
