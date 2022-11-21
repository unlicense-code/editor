import { Disposable } from 'vs/base/common/lifecycle';
import { INotificationService, NotificationMessage } from 'vs/platform/notification/common/notification';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export interface NotificationMetrics {
    id: string;
    silent: boolean;
    source?: string;
}
export declare type NotificationMetricsClassification = {
    id: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The identifier of the source of the notification.';
    };
    silent: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Whether the notification is silent or not.';
    };
    source?: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The source of the notification.';
    };
    owner: 'bpasero';
    comment: 'Helps us gain insights to what notifications are being shown, how many, and if they are silent or not.';
};
export declare function notificationToMetrics(message: NotificationMessage, source: string | undefined, silent: boolean): NotificationMetrics;
export declare class NotificationsTelemetry extends Disposable implements IWorkbenchContribution {
    private readonly telemetryService;
    private readonly notificationService;
    constructor(telemetryService: ITelemetryService, notificationService: INotificationService);
    private registerListeners;
}
