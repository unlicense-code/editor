import { Disposable } from 'vs/base/common/lifecycle';
import { INotebookRendererMessagingService, IScopedRendererMessaging } from 'vs/workbench/contrib/notebook/common/notebookRendererMessagingService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
declare type MessageToSend = {
    editorId: string;
    rendererId: string;
    message: unknown;
};
export declare class NotebookRendererMessagingService extends Disposable implements INotebookRendererMessagingService {
    private readonly extensionService;
    _serviceBrand: undefined;
    /**
     * Activation promises. Maps renderer IDs to a queue of messages that should
     * be sent once activation finishes, or undefined if activation is complete.
     */
    private readonly activations;
    private readonly scopedMessaging;
    private readonly postMessageEmitter;
    readonly onShouldPostMessage: import("vs/base/common/event").Event<MessageToSend>;
    constructor(extensionService: IExtensionService);
    /** @inheritdoc */
    receiveMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
    /** @inheritdoc */
    prepare(rendererId: string): void;
    /** @inheritdoc */
    getScoped(editorId: string): IScopedRendererMessaging;
    private postMessage;
}
export {};
