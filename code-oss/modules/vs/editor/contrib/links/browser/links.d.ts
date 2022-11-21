import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./links';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IModelDecorationsChangeAccessor, IModelDeltaDecoration } from 'vs/editor/common/model';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { Link } from 'vs/editor/contrib/links/browser/getLinks';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
export declare class LinkDetector extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly openerService;
    private readonly notificationService;
    private readonly languageFeaturesService;
    static readonly ID: string;
    static get(editor: ICodeEditor): LinkDetector | null;
    private readonly providers;
    private readonly debounceInformation;
    private readonly computeLinks;
    private computePromise;
    private activeLinksList;
    private activeLinkDecorationId;
    private currentOccurrences;
    constructor(editor: ICodeEditor, openerService: IOpenerService, notificationService: INotificationService, languageFeaturesService: ILanguageFeaturesService, languageFeatureDebounceService: ILanguageFeatureDebounceService);
    private computeLinksNow;
    private updateDecorations;
    private _onEditorMouseMove;
    private cleanUpActiveLinkDecoration;
    private onEditorMouseUp;
    openLinkOccurrence(occurrence: LinkOccurrence, openToSide: boolean, fromUserGesture?: boolean): void;
    getLinkOccurrence(position: Position | null): LinkOccurrence | null;
    private isEnabled;
    private stop;
    dispose(): void;
}
declare class LinkOccurrence {
    static decoration(link: Link, useMetaKey: boolean): IModelDeltaDecoration;
    private static _getOptions;
    decorationId: string;
    link: Link;
    constructor(link: Link, decorationId: string);
    activate(changeAccessor: IModelDecorationsChangeAccessor, useMetaKey: boolean): void;
    deactivate(changeAccessor: IModelDecorationsChangeAccessor, useMetaKey: boolean): void;
}
export {};
