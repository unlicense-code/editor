import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class InlayHintsAccessibility implements IEditorContribution {
    private readonly _editor;
    private readonly _audioCueService;
    private readonly _instaService;
    static readonly IsReading: RawContextKey<boolean>;
    static readonly ID: string;
    static get(editor: ICodeEditor): InlayHintsAccessibility | undefined;
    private readonly _ariaElement;
    private readonly _ctxIsReading;
    private _sessionDispoosables;
    constructor(_editor: ICodeEditor, contextKeyService: IContextKeyService, _audioCueService: IAudioCueService, _instaService: IInstantiationService);
    dispose(): void;
    private _reset;
    private _read;
    startInlayHintsReading(): void;
    stopInlayHintsReading(): void;
}
