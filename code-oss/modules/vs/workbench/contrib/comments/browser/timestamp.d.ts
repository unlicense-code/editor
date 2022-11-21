import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class TimestampWidget extends Disposable {
    private configurationService;
    private _date;
    private _timestamp;
    private _useRelativeTime;
    constructor(configurationService: IConfigurationService, container: HTMLElement, timeStamp?: Date);
    private get useRelativeTimeSetting();
    setTimestamp(timestamp: Date | undefined): Promise<void>;
    private updateDate;
    private getRelative;
    private getDateString;
}
