/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as dom from 'vs/base/browser/dom';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { MarkdownRenderer } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { Range } from 'vs/editor/common/core/range';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { HoverForeignElementAnchor } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { GhostTextController, ShowNextInlineSuggestionAction, ShowPreviousInlineSuggestionAction } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextController';
import * as nls from 'vs/nls';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IMenuService, MenuId, MenuItemAction } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { inlineSuggestCommitId } from 'vs/editor/contrib/inlineCompletions/browser/consts';
export class InlineCompletionsHover {
    owner;
    range;
    controller;
    constructor(owner, range, controller) {
        this.owner = owner;
        this.range = range;
        this.controller = controller;
    }
    isValidForHoverAnchor(anchor) {
        return (anchor.type === 1 /* HoverAnchorType.Range */
            && this.range.startColumn <= anchor.range.startColumn
            && this.range.endColumn >= anchor.range.endColumn);
    }
    hasMultipleSuggestions() {
        return this.controller.hasMultipleInlineCompletions();
    }
    get commands() {
        return this.controller.activeModel?.activeInlineCompletionsModel?.completionSession.value?.commands || [];
    }
}
let InlineCompletionsHoverParticipant = class InlineCompletionsHoverParticipant {
    _editor;
    _commandService;
    _menuService;
    _contextKeyService;
    _languageService;
    _openerService;
    accessibilityService;
    hoverOrdinal = 3;
    constructor(_editor, _commandService, _menuService, _contextKeyService, _languageService, _openerService, accessibilityService) {
        this._editor = _editor;
        this._commandService = _commandService;
        this._menuService = _menuService;
        this._contextKeyService = _contextKeyService;
        this._languageService = _languageService;
        this._openerService = _openerService;
        this.accessibilityService = accessibilityService;
    }
    suggestHoverAnchor(mouseEvent) {
        const controller = GhostTextController.get(this._editor);
        if (!controller) {
            return null;
        }
        const target = mouseEvent.target;
        if (target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */) {
            // handle the case where the mouse is over the view zone
            const viewZoneData = target.detail;
            if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
                return new HoverForeignElementAnchor(1000, this, Range.fromPositions(viewZoneData.positionBefore || viewZoneData.position, viewZoneData.positionBefore || viewZoneData.position), mouseEvent.event.posx, mouseEvent.event.posy);
            }
        }
        if (target.type === 7 /* MouseTargetType.CONTENT_EMPTY */) {
            // handle the case where the mouse is over the empty portion of a line following ghost text
            if (controller.shouldShowHoverAt(target.range)) {
                return new HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy);
            }
        }
        if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
            // handle the case where the mouse is directly over ghost text
            const mightBeForeignElement = target.detail.mightBeForeignElement;
            if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
                return new HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy);
            }
        }
        return null;
    }
    computeSync(anchor, lineDecorations) {
        const controller = GhostTextController.get(this._editor);
        if (controller && controller.shouldShowHoverAt(anchor.range)) {
            return [new InlineCompletionsHover(this, anchor.range, controller)];
        }
        return [];
    }
    renderHoverParts(context, hoverParts) {
        const disposableStore = new DisposableStore();
        const part = hoverParts[0];
        if (this.accessibilityService.isScreenReaderOptimized()) {
            this.renderScreenReaderText(context, part, disposableStore);
        }
        // TODO@hediet: deprecate MenuId.InlineCompletionsActions
        const menu = disposableStore.add(this._menuService.createMenu(MenuId.InlineCompletionsActions, this._contextKeyService));
        const previousAction = context.statusBar.addAction({
            label: nls.localize('showNextInlineSuggestion', "Next"),
            commandId: ShowNextInlineSuggestionAction.ID,
            run: () => this._commandService.executeCommand(ShowNextInlineSuggestionAction.ID)
        });
        const nextAction = context.statusBar.addAction({
            label: nls.localize('showPreviousInlineSuggestion', "Previous"),
            commandId: ShowPreviousInlineSuggestionAction.ID,
            run: () => this._commandService.executeCommand(ShowPreviousInlineSuggestionAction.ID)
        });
        context.statusBar.addAction({
            label: nls.localize('acceptInlineSuggestion', "Accept"),
            commandId: inlineSuggestCommitId,
            run: () => this._commandService.executeCommand(inlineSuggestCommitId)
        });
        const actions = [previousAction, nextAction];
        for (const action of actions) {
            action.setEnabled(false);
        }
        part.hasMultipleSuggestions().then(hasMore => {
            for (const action of actions) {
                action.setEnabled(hasMore);
            }
        });
        for (const command of part.commands) {
            context.statusBar.addAction({
                label: command.title,
                commandId: command.id,
                run: () => this._commandService.executeCommand(command.id, ...(command.arguments || []))
            });
        }
        for (const [_, group] of menu.getActions()) {
            for (const action of group) {
                if (action instanceof MenuItemAction) {
                    context.statusBar.addAction({
                        label: action.label,
                        commandId: action.item.id,
                        run: () => this._commandService.executeCommand(action.item.id)
                    });
                }
            }
        }
        return disposableStore;
    }
    renderScreenReaderText(context, part, disposableStore) {
        const $ = dom.$;
        const markdownHoverElement = $('div.hover-row.markdown-hover');
        const hoverContentsElement = dom.append(markdownHoverElement, $('div.hover-contents'));
        const renderer = disposableStore.add(new MarkdownRenderer({ editor: this._editor }, this._languageService, this._openerService));
        const render = (code) => {
            disposableStore.add(renderer.onDidRenderAsync(() => {
                hoverContentsElement.className = 'hover-contents code-hover-contents';
                context.onContentsChanged();
            }));
            const inlineSuggestionAvailable = nls.localize('inlineSuggestionFollows', "Suggestion:");
            const renderedContents = disposableStore.add(renderer.render(new MarkdownString().appendText(inlineSuggestionAvailable).appendCodeblock('text', code)));
            hoverContentsElement.replaceChildren(renderedContents.element);
        };
        const ghostText = part.controller.activeModel?.inlineCompletionsModel?.ghostText;
        if (ghostText) {
            const lineText = this._editor.getModel().getLineContent(ghostText.lineNumber);
            render(ghostText.renderForScreenReader(lineText));
        }
        context.fragment.appendChild(markdownHoverElement);
    }
};
InlineCompletionsHoverParticipant = __decorate([
    __param(1, ICommandService),
    __param(2, IMenuService),
    __param(3, IContextKeyService),
    __param(4, ILanguageService),
    __param(5, IOpenerService),
    __param(6, IAccessibilityService)
], InlineCompletionsHoverParticipant);
export { InlineCompletionsHoverParticipant };
