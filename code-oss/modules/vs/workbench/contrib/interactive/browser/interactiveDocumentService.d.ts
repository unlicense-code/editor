import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
export declare const IInteractiveDocumentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IInteractiveDocumentService>;
export interface IInteractiveDocumentService {
    readonly _serviceBrand: undefined;
    onWillAddInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
        languageId: string;
    }>;
    onWillRemoveInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
    }>;
    willCreateInteractiveDocument(notebookUri: URI, inputUri: URI, languageId: string): void;
    willRemoveInteractiveDocument(notebookUri: URI, inputUri: URI): void;
}
export declare class InteractiveDocumentService extends Disposable implements IInteractiveDocumentService {
    readonly _serviceBrand: undefined;
    private readonly _onWillAddInteractiveDocument;
    onWillAddInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
        languageId: string;
    }>;
    private readonly _onWillRemoveInteractiveDocument;
    onWillRemoveInteractiveDocument: Event<{
        notebookUri: URI;
        inputUri: URI;
    }>;
    constructor();
    willCreateInteractiveDocument(notebookUri: URI, inputUri: URI, languageId: string): void;
    willRemoveInteractiveDocument(notebookUri: URI, inputUri: URI): void;
}
