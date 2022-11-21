import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ShowAudioCueHelp extends Action2 {
    static readonly ID = "audioCues.help";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
