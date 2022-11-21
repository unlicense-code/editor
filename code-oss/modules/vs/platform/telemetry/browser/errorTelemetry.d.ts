import BaseErrorTelemetry from 'vs/platform/telemetry/common/errorTelemetry';
export default class ErrorTelemetry extends BaseErrorTelemetry {
    protected installErrorListeners(): void;
    private _onUncaughtError;
}
