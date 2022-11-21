/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { OpenEditor } from 'vs/workbench/contrib/files/common/files';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { List } from 'vs/base/browser/ui/list/listWidget';
import { ExplorerItem } from 'vs/workbench/contrib/files/common/explorerModel';
import { coalesce } from 'vs/base/common/arrays';
import { AsyncDataTree } from 'vs/base/browser/ui/tree/asyncDataTree';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IExplorerService = createDecorator('explorerService');
function getFocus(listService) {
    const list = listService.lastFocusedList;
    if (list?.getHTMLElement() === document.activeElement) {
        let focus;
        if (list instanceof List) {
            const focused = list.getFocusedElements();
            if (focused.length) {
                focus = focused[0];
            }
        }
        else if (list instanceof AsyncDataTree) {
            const focused = list.getFocus();
            if (focused.length) {
                focus = focused[0];
            }
        }
        return focus;
    }
    return undefined;
}
// Commands can get executed from a command palette, from a context menu or from some list using a keybinding
// To cover all these cases we need to properly compute the resource on which the command is being executed
export function getResourceForCommand(resource, listService, editorService) {
    if (URI.isUri(resource)) {
        return resource;
    }
    const focus = getFocus(listService);
    if (focus instanceof ExplorerItem) {
        return focus.resource;
    }
    else if (focus instanceof OpenEditor) {
        return focus.getResource();
    }
    return EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
}
export function getMultiSelectedResources(resource, listService, editorService, explorerService) {
    const list = listService.lastFocusedList;
    if (list?.getHTMLElement() === document.activeElement) {
        // Explorer
        if (list instanceof AsyncDataTree && list.getFocus().every(item => item instanceof ExplorerItem)) {
            // Explorer
            const context = explorerService.getContext(true, true);
            if (context.length) {
                return context.map(c => c.resource);
            }
        }
        // Open editors view
        if (list instanceof List) {
            const selection = coalesce(list.getSelectedElements().filter(s => s instanceof OpenEditor).map((oe) => oe.getResource()));
            const focusedElements = list.getFocusedElements();
            const focus = focusedElements.length ? focusedElements[0] : undefined;
            let mainUriStr = undefined;
            if (URI.isUri(resource)) {
                mainUriStr = resource.toString();
            }
            else if (focus instanceof OpenEditor) {
                const focusedResource = focus.getResource();
                mainUriStr = focusedResource ? focusedResource.toString() : undefined;
            }
            // We only respect the selection if it contains the main element.
            if (selection.some(s => s.toString() === mainUriStr)) {
                return selection;
            }
        }
    }
    const result = getResourceForCommand(resource, listService, editorService);
    return !!result ? [result] : [];
}
export function getOpenEditorsViewMultiSelection(listService, editorGroupService) {
    const list = listService.lastFocusedList;
    if (list?.getHTMLElement() === document.activeElement) {
        // Open editors view
        if (list instanceof List) {
            const selection = coalesce(list.getSelectedElements().filter(s => s instanceof OpenEditor));
            const focusedElements = list.getFocusedElements();
            const focus = focusedElements.length ? focusedElements[0] : undefined;
            let mainEditor = undefined;
            if (focus instanceof OpenEditor) {
                mainEditor = focus;
            }
            // We only respect the selection if it contains the main element.
            if (selection.some(s => s === mainEditor)) {
                return selection;
            }
        }
    }
    return undefined;
}
