import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./ghostText';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { GhostTextWidgetModel } from 'vs/editor/contrib/inlineCompletions/browser/ghostText';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class GhostTextWidget extends Disposable {
    private readonly editor;
    private readonly model;
    private readonly instantiationService;
    private readonly languageService;
    private disposed;
    private readonly partsWidget;
    private readonly additionalLinesWidget;
    private viewMoreContentWidget;
    constructor(editor: ICodeEditor, model: GhostTextWidgetModel, instantiationService: IInstantiationService, languageService: ILanguageService);
    shouldShowHoverAtViewZone(viewZoneId: string): boolean;
    private readonly replacementDecoration;
    private update;
    private renderViewMoreLines;
}
