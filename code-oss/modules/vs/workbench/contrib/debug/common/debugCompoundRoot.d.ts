export declare class DebugCompoundRoot {
    private stopped;
    private stopEmitter;
    onDidSessionStop: import("vs/base/common/event").Event<void>;
    sessionStopped(): void;
}
