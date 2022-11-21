interface INativeWindowDriverHelper {
    exitApplication(): Promise<void>;
}
export declare function registerWindowDriver(helper: INativeWindowDriverHelper): void;
export {};
