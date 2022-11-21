import { URI } from 'vs/base/common/uri';
import { ITextEditorPane } from 'vs/workbench/common/editor';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorOptions as ICodeEditorOptions } from 'vs/editor/common/config/editorOptions';
import { ICodeEditorWidgetOptions } from 'vs/editor/browser/widget/codeEditorWidget';
import { IEditorViewState } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { AbstractTextEditor } from 'vs/workbench/browser/parts/editor/textEditor';
import { Dimension } from 'vs/base/browser/dom';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
/**
 * A text editor using the code editor widget.
 */
export declare abstract class AbstractTextCodeEditor<T extends IEditorViewState> extends AbstractTextEditor<T> implements ITextEditorPane {
    protected editorControl: ICodeEditor | undefined;
    get scopedContextKeyService(): IContextKeyService | undefined;
    getTitle(): string;
    protected createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    protected getCodeEditorWidgetOptions(): ICodeEditorWidgetOptions;
    protected updateEditorControlOptions(options: ICodeEditorOptions): void;
    protected getMainControl(): ICodeEditor | undefined;
    getControl(): ICodeEditor | undefined;
    protected computeEditorViewState(resource: URI): T | undefined;
    setOptions(options: ITextEditorOptions | undefined): void;
    focus(): void;
    hasFocus(): boolean;
    protected setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    layout(dimension: Dimension): void;
}
