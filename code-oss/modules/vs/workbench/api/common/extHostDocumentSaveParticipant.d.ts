import { Event } from 'vs/base/common/event';
import { UriComponents } from 'vs/base/common/uri';
import { ExtHostDocumentSaveParticipantShape, MainThreadBulkEditsShape } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostDocuments } from 'vs/workbench/api/common/extHostDocuments';
import { SaveReason } from 'vs/workbench/common/editor';
import type * as vscode from 'vscode';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class ExtHostDocumentSaveParticipant implements ExtHostDocumentSaveParticipantShape {
    private readonly _logService;
    private readonly _documents;
    private readonly _mainThreadBulkEdits;
    private readonly _thresholds;
    private readonly _callbacks;
    private readonly _badListeners;
    constructor(_logService: ILogService, _documents: ExtHostDocuments, _mainThreadBulkEdits: MainThreadBulkEditsShape, _thresholds?: {
        timeout: number;
        errors: number;
    });
    dispose(): void;
    getOnWillSaveTextDocumentEvent(extension: IExtensionDescription): Event<vscode.TextDocumentWillSaveEvent>;
    $participateInSave(data: UriComponents, reason: SaveReason): Promise<boolean[]>;
    private _deliverEventAsyncAndBlameBadListeners;
    private _deliverEventAsync;
}
