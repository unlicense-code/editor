import * as dom from 'vs/base/browser/dom';
import 'vs/css!./media/breadcrumbscontrol';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ColorIdentifier, ColorTransform } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IBreadcrumbsService } from 'vs/workbench/browser/parts/editor/breadcrumbs';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupView } from 'vs/workbench/browser/parts/editor/editor';
import { ILabelService } from 'vs/platform/label/common/label';
export interface IBreadcrumbsControlOptions {
    showFileIcons: boolean;
    showSymbolIcons: boolean;
    showDecorationColors: boolean;
    breadcrumbsBackground: ColorIdentifier | ColorTransform;
    showPlaceholder: boolean;
}
export declare class BreadcrumbsControl {
    private readonly _options;
    private readonly _editorGroup;
    private readonly _contextKeyService;
    private readonly _contextViewService;
    private readonly _instantiationService;
    private readonly _themeService;
    private readonly _quickInputService;
    private readonly _fileService;
    private readonly _editorService;
    private readonly _labelService;
    static readonly HEIGHT = 22;
    private static readonly SCROLLBAR_SIZES;
    static readonly Payload_Reveal: {};
    static readonly Payload_RevealAside: {};
    static readonly Payload_Pick: {};
    static readonly CK_BreadcrumbsPossible: RawContextKey<false>;
    static readonly CK_BreadcrumbsVisible: RawContextKey<false>;
    static readonly CK_BreadcrumbsActive: RawContextKey<false>;
    private readonly _ckBreadcrumbsPossible;
    private readonly _ckBreadcrumbsVisible;
    private readonly _ckBreadcrumbsActive;
    private readonly _cfUseQuickPick;
    private readonly _cfShowIcons;
    private readonly _cfTitleScrollbarSizing;
    readonly domNode: HTMLDivElement;
    private readonly _widget;
    private readonly _disposables;
    private readonly _breadcrumbsDisposables;
    private readonly _labels;
    private _breadcrumbsPickerShowing;
    private _breadcrumbsPickerIgnoreOnceItem;
    constructor(container: HTMLElement, _options: IBreadcrumbsControlOptions, _editorGroup: IEditorGroupView, _contextKeyService: IContextKeyService, _contextViewService: IContextViewService, _instantiationService: IInstantiationService, _themeService: IThemeService, _quickInputService: IQuickInputService, _fileService: IFileService, _editorService: IEditorService, _labelService: ILabelService, configurationService: IConfigurationService, breadcrumbsService: IBreadcrumbsService);
    dispose(): void;
    layout(dim: dom.Dimension | undefined): void;
    isHidden(): boolean;
    hide(): void;
    update(): boolean;
    private _onFocusEvent;
    private _onSelectEvent;
    private _updateCkBreadcrumbsActive;
    private _revealInEditor;
    private _getEditorGroup;
}
