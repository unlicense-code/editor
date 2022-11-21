import { IActiveCodeEditor, ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Location } from 'vs/editor/common/languages';
import { ClickLinkMouseEvent } from 'vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture';
import { RenderedInlayHintLabelPart } from 'vs/editor/contrib/inlayHints/browser/inlayHintsController';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare function showGoToContextMenu(accessor: ServicesAccessor, editor: ICodeEditor, anchor: HTMLElement, part: RenderedInlayHintLabelPart): Promise<void>;
export declare function goToDefinitionWithLocation(accessor: ServicesAccessor, event: ClickLinkMouseEvent, editor: IActiveCodeEditor, location: Location): Promise<void>;
