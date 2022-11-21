/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as DOM from 'vs/base/browser/dom';
import { createKeybinding } from 'vs/base/common/keybindings';
import { OS } from 'vs/base/common/platform';
import * as nls from 'vs/nls';
import { searchComparer } from 'vs/workbench/contrib/search/common/searchModel';
import { VIEW_ID } from 'vs/workbench/services/search/common/search';
export const category = { value: nls.localize('search', "Search"), original: 'Search' };
export function isSearchViewFocused(viewsService) {
    const searchView = getSearchView(viewsService);
    const activeElement = document.activeElement;
    return !!(searchView && activeElement && DOM.isAncestor(activeElement, searchView.getContainer()));
}
export function appendKeyBindingLabel(label, inputKeyBinding, keyBindingService2) {
    if (typeof inputKeyBinding === 'number') {
        const keybinding = createKeybinding(inputKeyBinding, OS);
        if (keybinding) {
            const resolvedKeybindings = keyBindingService2.resolveKeybinding(keybinding);
            return doAppendKeyBindingLabel(label, resolvedKeybindings.length > 0 ? resolvedKeybindings[0] : undefined);
        }
        return doAppendKeyBindingLabel(label, undefined);
    }
    else {
        return doAppendKeyBindingLabel(label, inputKeyBinding);
    }
}
export function getSearchView(viewsService) {
    return viewsService.getActiveViewWithId(VIEW_ID);
}
export function getElementsToOperateOnInfo(viewer, currElement, sortConfig) {
    let elements = viewer.getSelection().filter((x) => x !== null).sort((a, b) => searchComparer(a, b, sortConfig.sortOrder));
    const mustReselect = !currElement || elements.includes(currElement); // this indicates whether we need to re-focus/re-select on a remove.
    // if selection doesn't include multiple elements, just return current focus element.
    if (currElement && !(elements.length > 1 && elements.includes(currElement))) {
        elements = [currElement];
    }
    return { elements, mustReselect };
}
export function openSearchView(viewsService, focus) {
    return viewsService.openView(VIEW_ID, focus).then(view => (view ?? undefined));
}
function doAppendKeyBindingLabel(label, keyBinding) {
    return keyBinding ? label + ' (' + keyBinding.getLabel() + ')' : label;
}
