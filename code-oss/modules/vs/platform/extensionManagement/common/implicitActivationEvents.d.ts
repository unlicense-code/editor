import { IExtensionManifest } from 'vs/platform/extensions/common/extensions';
export interface IActivationEventsGenerator<T> {
    (contribution: T, result: {
        push(item: string): void;
    }): void;
}
export declare class ImplicitActivationEventsImpl {
    private readonly _generators;
    register<T>(extensionPointName: string, generator: IActivationEventsGenerator<T>): void;
    updateManifest(manifest: IExtensionManifest): void;
}
export declare const ImplicitActivationEvents: ImplicitActivationEventsImpl;
