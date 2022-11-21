import { IMarkerDecorationsService } from 'vs/editor/common/services/markerDecorations';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
export declare class MarkerDecorationsContribution implements IEditorContribution {
    static readonly ID: string;
    constructor(_editor: ICodeEditor, _markerDecorationsService: IMarkerDecorationsService);
    dispose(): void;
}
