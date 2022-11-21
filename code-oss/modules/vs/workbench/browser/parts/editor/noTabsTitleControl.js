/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./media/notabstitlecontrol';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { TitleControl } from 'vs/workbench/browser/parts/editor/titleControl';
import { ResourceLabel } from 'vs/workbench/browser/labels';
import { TAB_ACTIVE_FOREGROUND, TAB_UNFOCUSED_ACTIVE_FOREGROUND } from 'vs/workbench/common/theme';
import { EventType as TouchEventType, Gesture } from 'vs/base/browser/touch';
import { addDisposableListener, EventType, EventHelper, Dimension, isAncestor } from 'vs/base/browser/dom';
import { CLOSE_EDITOR_COMMAND_ID, UNLOCK_GROUP_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { Color } from 'vs/base/common/color';
import { withNullAsUndefined, assertIsDefined, assertAllDefined } from 'vs/base/common/types';
import { equals } from 'vs/base/common/objects';
import { toDisposable } from 'vs/base/common/lifecycle';
export class NoTabsTitleControl extends TitleControl {
    static HEIGHT = 35;
    titleContainer;
    editorLabel;
    activeLabel = Object.create(null);
    create(parent) {
        const titleContainer = this.titleContainer = parent;
        titleContainer.draggable = true;
        //Container listeners
        this.registerContainerListeners(titleContainer);
        // Gesture Support
        this._register(Gesture.addTarget(titleContainer));
        const labelContainer = document.createElement('div');
        labelContainer.classList.add('label-container');
        titleContainer.appendChild(labelContainer);
        // Editor Label
        this.editorLabel = this._register(this.instantiationService.createInstance(ResourceLabel, labelContainer, undefined)).element;
        this._register(addDisposableListener(this.editorLabel.element, EventType.CLICK, e => this.onTitleLabelClick(e)));
        // Breadcrumbs
        this.createBreadcrumbsControl(labelContainer, { showFileIcons: false, showSymbolIcons: true, showDecorationColors: false, breadcrumbsBackground: Color.transparent.toString(), showPlaceholder: false });
        titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
        this._register(toDisposable(() => titleContainer.classList.remove('breadcrumbs'))); // important to remove because the container is a shared dom node
        // Right Actions Container
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('title-actions');
        titleContainer.appendChild(actionsContainer);
        // Editor actions toolbar
        this.createEditorActionsToolBar(actionsContainer);
    }
    registerContainerListeners(titleContainer) {
        // Group dragging
        this.enableGroupDragging(titleContainer);
        // Pin on double click
        this._register(addDisposableListener(titleContainer, EventType.DBLCLICK, e => this.onTitleDoubleClick(e)));
        // Detect mouse click
        this._register(addDisposableListener(titleContainer, EventType.AUXCLICK, e => this.onTitleAuxClick(e)));
        // Detect touch
        this._register(addDisposableListener(titleContainer, TouchEventType.Tap, (e) => this.onTitleTap(e)));
        // Context Menu
        for (const event of [EventType.CONTEXT_MENU, TouchEventType.Contextmenu]) {
            this._register(addDisposableListener(titleContainer, event, e => {
                if (this.group.activeEditor) {
                    this.onContextMenu(this.group.activeEditor, e, titleContainer);
                }
            }));
        }
    }
    onTitleLabelClick(e) {
        EventHelper.stop(e, false);
        // delayed to let the onTitleClick() come first which can cause a focus change which can close quick access
        setTimeout(() => this.quickInputService.quickAccess.show());
    }
    onTitleDoubleClick(e) {
        EventHelper.stop(e);
        this.group.pinEditor();
    }
    onTitleAuxClick(e) {
        if (e.button === 1 /* Middle Button */ && this.group.activeEditor) {
            EventHelper.stop(e, true /* for https://github.com/microsoft/vscode/issues/56715 */);
            this.group.closeEditor(this.group.activeEditor);
        }
    }
    onTitleTap(e) {
        // We only want to open the quick access picker when
        // the tap occurred over the editor label, so we need
        // to check on the target
        // (https://github.com/microsoft/vscode/issues/107543)
        const target = e.initialTarget;
        if (!(target instanceof HTMLElement) || !this.editorLabel || !isAncestor(target, this.editorLabel.element)) {
            return;
        }
        // TODO@rebornix gesture tap should open the quick access
        // editorGroupView will focus on the editor again when there
        // are mouse/pointer/touch down events we need to wait a bit as
        // `GesureEvent.Tap` is generated from `touchstart` and then
        // `touchend` events, which are not an atom event.
        setTimeout(() => this.quickInputService.quickAccess.show(), 50);
    }
    openEditor(editor) {
        this.doHandleOpenEditor();
    }
    openEditors(editors) {
        this.doHandleOpenEditor();
    }
    doHandleOpenEditor() {
        const activeEditorChanged = this.ifActiveEditorChanged(() => this.redraw());
        if (!activeEditorChanged) {
            this.ifActiveEditorPropertiesChanged(() => this.redraw());
        }
    }
    closeEditor(editor, index) {
        this.ifActiveEditorChanged(() => this.redraw());
    }
    closeEditors(editors) {
        this.ifActiveEditorChanged(() => this.redraw());
    }
    moveEditor(editor, fromIndex, targetIndex) {
        this.ifActiveEditorChanged(() => this.redraw());
    }
    pinEditor(editor) {
        this.ifEditorIsActive(editor, () => this.redraw());
    }
    stickEditor(editor) {
        // Sticky editors are not presented any different with tabs disabled
    }
    unstickEditor(editor) {
        // Sticky editors are not presented any different with tabs disabled
    }
    setActive(isActive) {
        this.redraw();
    }
    updateEditorLabel(editor) {
        this.ifEditorIsActive(editor, () => this.redraw());
    }
    updateEditorDirty(editor) {
        this.ifEditorIsActive(editor, () => {
            const titleContainer = assertIsDefined(this.titleContainer);
            // Signal dirty (unless saving)
            if (editor.isDirty() && !editor.isSaving()) {
                titleContainer.classList.add('dirty');
            }
            // Otherwise, clear dirty
            else {
                titleContainer.classList.remove('dirty');
            }
        });
    }
    updateOptions(oldOptions, newOptions) {
        if (oldOptions.labelFormat !== newOptions.labelFormat || !equals(oldOptions.decorations, newOptions.decorations)) {
            this.redraw();
        }
    }
    updateStyles() {
        this.redraw();
    }
    handleBreadcrumbsEnablementChange() {
        const titleContainer = assertIsDefined(this.titleContainer);
        titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
        this.redraw();
    }
    ifActiveEditorChanged(fn) {
        if (!this.activeLabel.editor && this.group.activeEditor || // active editor changed from null => editor
            this.activeLabel.editor && !this.group.activeEditor || // active editor changed from editor => null
            (!this.activeLabel.editor || !this.group.isActive(this.activeLabel.editor)) // active editor changed from editorA => editorB
        ) {
            fn();
            return true;
        }
        return false;
    }
    ifActiveEditorPropertiesChanged(fn) {
        if (!this.activeLabel.editor || !this.group.activeEditor) {
            return; // need an active editor to check for properties changed
        }
        if (this.activeLabel.pinned !== this.group.isPinned(this.group.activeEditor)) {
            fn(); // only run if pinned state has changed
        }
    }
    ifEditorIsActive(editor, fn) {
        if (this.group.isActive(editor)) {
            fn(); // only run if editor is current active
        }
    }
    redraw() {
        const editor = withNullAsUndefined(this.group.activeEditor);
        const options = this.accessor.partOptions;
        const isEditorPinned = editor ? this.group.isPinned(editor) : false;
        const isGroupActive = this.accessor.activeGroup === this.group;
        this.activeLabel = { editor, pinned: isEditorPinned };
        // Update Breadcrumbs
        if (this.breadcrumbsControl) {
            if (isGroupActive) {
                this.breadcrumbsControl.update();
                this.breadcrumbsControl.domNode.classList.toggle('preview', !isEditorPinned);
            }
            else {
                this.breadcrumbsControl.hide();
            }
        }
        // Clear if there is no editor
        const [titleContainer, editorLabel] = assertAllDefined(this.titleContainer, this.editorLabel);
        if (!editor) {
            titleContainer.classList.remove('dirty');
            editorLabel.clear();
            this.clearEditorActionsToolbar();
        }
        // Otherwise render it
        else {
            // Dirty state
            this.updateEditorDirty(editor);
            // Editor Label
            const { labelFormat } = this.accessor.partOptions;
            let description;
            if (this.breadcrumbsControl && !this.breadcrumbsControl.isHidden()) {
                description = ''; // hide description when showing breadcrumbs
            }
            else if (labelFormat === 'default' && !isGroupActive) {
                description = ''; // hide description when group is not active and style is 'default'
            }
            else {
                description = editor.getDescription(this.getVerbosity(labelFormat)) || '';
            }
            let title = editor.getTitle(2 /* Verbosity.LONG */);
            if (description === title) {
                title = ''; // dont repeat what is already shown
            }
            editorLabel.setResource({
                resource: EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH }),
                name: editor.getName(),
                description
            }, {
                title,
                italic: !isEditorPinned,
                extraClasses: ['no-tabs', 'title-label'].concat(editor.getLabelExtraClasses()),
                fileDecorations: {
                    colors: Boolean(options.decorations?.colors),
                    badges: Boolean(options.decorations?.badges)
                },
            });
            if (isGroupActive) {
                titleContainer.style.color = this.getColor(TAB_ACTIVE_FOREGROUND) || '';
            }
            else {
                titleContainer.style.color = this.getColor(TAB_UNFOCUSED_ACTIVE_FOREGROUND) || '';
            }
            // Update Editor Actions Toolbar
            this.updateEditorActionsToolbar();
        }
    }
    getVerbosity(style) {
        switch (style) {
            case 'short': return 0 /* Verbosity.SHORT */;
            case 'long': return 2 /* Verbosity.LONG */;
            default: return 1 /* Verbosity.MEDIUM */;
        }
    }
    prepareEditorActions(editorActions) {
        const isGroupActive = this.accessor.activeGroup === this.group;
        // Active: allow all actions
        if (isGroupActive) {
            return editorActions;
        }
        // Inactive: only show "Close, "Unlock" and secondary actions
        else {
            return {
                primary: editorActions.primary.filter(action => action.id === CLOSE_EDITOR_COMMAND_ID || action.id === UNLOCK_GROUP_COMMAND_ID),
                secondary: editorActions.secondary
            };
        }
    }
    getHeight() {
        return {
            total: NoTabsTitleControl.HEIGHT,
            offset: 0
        };
    }
    layout(dimensions) {
        this.breadcrumbsControl?.layout(undefined);
        return new Dimension(dimensions.container.width, this.getHeight().total);
    }
}
