import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./lightBulbWidget';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { IPosition } from 'vs/editor/common/core/position';
import type { CodeActionSet, CodeActionTrigger } from 'vs/editor/contrib/codeAction/common/types';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export declare class LightBulbWidget extends Disposable implements IContentWidget {
    private readonly _editor;
    private static readonly _posPref;
    private readonly _domNode;
    private readonly _onClick;
    readonly onClick: Event<{
        x: number;
        y: number;
        actions: CodeActionSet;
        trigger: CodeActionTrigger;
    }>;
    private _state;
    private _preferredKbLabel?;
    private _quickFixKbLabel?;
    constructor(_editor: ICodeEditor, quickFixActionId: string, preferredFixActionId: string, keybindingService: IKeybindingService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    update(actions: CodeActionSet, trigger: CodeActionTrigger, atPosition: IPosition): void;
    hide(): void;
    private get state();
    private set state(value);
    private _updateLightBulbTitleAndIcon;
    private set title(value);
}
