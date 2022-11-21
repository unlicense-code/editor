/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Codicon } from 'vs/base/common/codicons';
import { ModelDecorationOptions } from 'vs/editor/common/model/textModel';
import { localize } from 'vs/nls';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
export const foldingExpandedIcon = registerIcon('folding-expanded', Codicon.chevronDown, localize('foldingExpandedIcon', 'Icon for expanded ranges in the editor glyph margin.'));
export const foldingCollapsedIcon = registerIcon('folding-collapsed', Codicon.chevronRight, localize('foldingCollapsedIcon', 'Icon for collapsed ranges in the editor glyph margin.'));
export const foldingManualCollapsedIcon = registerIcon('folding-manual-collapsed', foldingCollapsedIcon, localize('foldingManualCollapedIcon', 'Icon for manually collapsed ranges in the editor glyph margin.'));
export const foldingManualExpandedIcon = registerIcon('folding-manual-expanded', foldingExpandedIcon, localize('foldingManualExpandedIcon', 'Icon for manually expanded ranges in the editor glyph margin.'));
export class FoldingDecorationProvider {
    editor;
    static COLLAPSED_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-collapsed-visual-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        afterContentClassName: 'inline-folded',
        isWholeLine: true,
        firstLineDecorationClassName: ThemeIcon.asClassName(foldingCollapsedIcon)
    });
    static COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-collapsed-highlighted-visual-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        afterContentClassName: 'inline-folded',
        className: 'folded-background',
        isWholeLine: true,
        firstLineDecorationClassName: ThemeIcon.asClassName(foldingCollapsedIcon)
    });
    static MANUALLY_COLLAPSED_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-manually-collapsed-visual-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        afterContentClassName: 'inline-folded',
        isWholeLine: true,
        firstLineDecorationClassName: ThemeIcon.asClassName(foldingManualCollapsedIcon)
    });
    static MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-manually-collapsed-highlighted-visual-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        afterContentClassName: 'inline-folded',
        className: 'folded-background',
        isWholeLine: true,
        firstLineDecorationClassName: ThemeIcon.asClassName(foldingManualCollapsedIcon)
    });
    static NO_CONTROLS_COLLAPSED_RANGE_DECORATION = ModelDecorationOptions.register({
        description: 'folding-no-controls-range-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        afterContentClassName: 'inline-folded',
        isWholeLine: true
    });
    static NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION = ModelDecorationOptions.register({
        description: 'folding-no-controls-range-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        afterContentClassName: 'inline-folded',
        className: 'folded-background',
        isWholeLine: true
    });
    static EXPANDED_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-expanded-visual-decoration',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        isWholeLine: true,
        firstLineDecorationClassName: 'alwaysShowFoldIcons ' + ThemeIcon.asClassName(foldingExpandedIcon)
    });
    static EXPANDED_AUTO_HIDE_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-expanded-auto-hide-visual-decoration',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        isWholeLine: true,
        firstLineDecorationClassName: ThemeIcon.asClassName(foldingExpandedIcon)
    });
    static MANUALLY_EXPANDED_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-manually-expanded-visual-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        isWholeLine: true,
        firstLineDecorationClassName: 'alwaysShowFoldIcons ' + ThemeIcon.asClassName(foldingManualExpandedIcon)
    });
    static MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION = ModelDecorationOptions.register({
        description: 'folding-manually-expanded-auto-hide-visual-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        isWholeLine: true,
        firstLineDecorationClassName: ThemeIcon.asClassName(foldingManualExpandedIcon)
    });
    static NO_CONTROLS_EXPANDED_RANGE_DECORATION = ModelDecorationOptions.register({
        description: 'folding-no-controls-range-decoration',
        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
        isWholeLine: true
    });
    static HIDDEN_RANGE_DECORATION = ModelDecorationOptions.register({
        description: 'folding-hidden-range-decoration',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
    });
    showFoldingControls = 'mouseover';
    showFoldingHighlights = true;
    constructor(editor) {
        this.editor = editor;
    }
    getDecorationOption(isCollapsed, isHidden, isManual) {
        if (isHidden) { // is inside another collapsed region
            return FoldingDecorationProvider.HIDDEN_RANGE_DECORATION;
        }
        if (this.showFoldingControls === 'never') {
            if (isCollapsed) {
                return this.showFoldingHighlights ? FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION : FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_RANGE_DECORATION;
            }
            return FoldingDecorationProvider.NO_CONTROLS_EXPANDED_RANGE_DECORATION;
        }
        if (isCollapsed) {
            return isManual ?
                (this.showFoldingHighlights ? FoldingDecorationProvider.MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : FoldingDecorationProvider.MANUALLY_COLLAPSED_VISUAL_DECORATION)
                : (this.showFoldingHighlights ? FoldingDecorationProvider.COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : FoldingDecorationProvider.COLLAPSED_VISUAL_DECORATION);
        }
        else if (this.showFoldingControls === 'mouseover') {
            return isManual ? FoldingDecorationProvider.MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION : FoldingDecorationProvider.EXPANDED_AUTO_HIDE_VISUAL_DECORATION;
        }
        else {
            return isManual ? FoldingDecorationProvider.MANUALLY_EXPANDED_VISUAL_DECORATION : FoldingDecorationProvider.EXPANDED_VISUAL_DECORATION;
        }
    }
    changeDecorations(callback) {
        return this.editor.changeDecorations(callback);
    }
    removeDecorations(decorationIds) {
        this.editor.removeDecorations(decorationIds);
    }
}
