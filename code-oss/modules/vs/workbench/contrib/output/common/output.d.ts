import { Event } from 'vs/base/common/event';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IOutputChannelDescriptor } from 'vs/workbench/services/output/common/output';
import { URI } from 'vs/base/common/uri';
/**
 * Mime type used by the output editor.
 */
export declare const OUTPUT_MIME = "text/x-code-output";
/**
 * Output resource scheme.
 */
export declare const OUTPUT_SCHEME = "output";
/**
 * Id used by the output editor.
 */
export declare const OUTPUT_MODE_ID = "Log";
/**
 * Mime type used by the log output editor.
 */
export declare const LOG_MIME = "text/x-code-log-output";
/**
 * Log resource scheme.
 */
export declare const LOG_SCHEME = "log";
/**
 * Id used by the log output editor.
 */
export declare const LOG_MODE_ID = "log";
/**
 * Output view id
 */
export declare const OUTPUT_VIEW_ID = "workbench.panel.output";
export declare const OUTPUT_SERVICE_ID = "outputService";
export declare const MAX_OUTPUT_LENGTH: number;
export declare const CONTEXT_IN_OUTPUT: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_LOG_OUTPUT: RawContextKey<boolean>;
export declare const CONTEXT_OUTPUT_SCROLL_LOCK: RawContextKey<boolean>;
export declare const IOutputService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IOutputService>;
/**
 * The output service to manage output from the various processes running.
 */
export interface IOutputService {
    readonly _serviceBrand: undefined;
    /**
     * Given the channel id returns the output channel instance.
     * Channel should be first registered via OutputChannelRegistry.
     */
    getChannel(id: string): IOutputChannel | undefined;
    /**
     * Given the channel id returns the registered output channel descriptor.
     */
    getChannelDescriptor(id: string): IOutputChannelDescriptor | undefined;
    /**
     * Returns an array of all known output channels descriptors.
     */
    getChannelDescriptors(): IOutputChannelDescriptor[];
    /**
     * Returns the currently active channel.
     * Only one channel can be active at a given moment.
     */
    getActiveChannel(): IOutputChannel | undefined;
    /**
     * Show the channel with the passed id.
     */
    showChannel(id: string, preserveFocus?: boolean): Promise<void>;
    /**
     * Allows to register on active output channel change.
     */
    onActiveOutputChannel: Event<string>;
}
export declare enum OutputChannelUpdateMode {
    Append = 1,
    Replace = 2,
    Clear = 3
}
export interface IOutputChannel {
    /**
     * Identifier of the output channel.
     */
    id: string;
    /**
     * Label of the output channel to be displayed to the user.
     */
    label: string;
    /**
     * URI of the output channel.
     */
    uri: URI;
    /**
     * Appends output to the channel.
     */
    append(output: string): void;
    /**
     * Clears all received output for this channel.
     */
    clear(): void;
    /**
     * Replaces the content of the channel with given output
     */
    replace(output: string): void;
    /**
     * Update the channel.
     */
    update(mode: OutputChannelUpdateMode.Append): void;
    update(mode: OutputChannelUpdateMode, till: number): void;
    /**
     * Disposes the output channel.
     */
    dispose(): void;
}
