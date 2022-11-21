/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { getSelectionKeyboardEvent } from 'vs/platform/list/browser/listService';
import { IViewsService } from 'vs/workbench/common/views';
import { searchRemoveIcon, searchReplaceIcon } from 'vs/workbench/contrib/search/browser/searchIcons';
import * as Constants from 'vs/workbench/contrib/search/common/constants';
import { IReplaceService } from 'vs/workbench/contrib/search/common/replace';
import { arrayContainsElementOrParent, FileMatch, FolderMatch, Match, SearchResult } from 'vs/workbench/contrib/search/common/searchModel';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { category, getElementsToOperateOnInfo, getSearchView } from 'vs/workbench/contrib/search/browser/searchActionsBase';
//#endregion
//#region Actions
registerAction2(class RemoveAction extends Action2 {
    constructor() {
        super({
            id: Constants.RemoveActionId,
            title: {
                value: nls.localize('RemoveAction.label', "Dismiss"),
                original: 'Dismiss'
            },
            category,
            icon: searchRemoveIcon,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                },
            },
            menu: [
                {
                    id: MenuId.SearchContext,
                    group: 'search',
                    order: 2,
                },
                {
                    id: MenuId.SearchActionMenu,
                    group: 'inline',
                    order: 2,
                },
            ]
        });
    }
    run(accessor, context) {
        const viewsService = accessor.get(IViewsService);
        const configurationService = accessor.get(IConfigurationService);
        const searchView = getSearchView(viewsService);
        if (!searchView) {
            return;
        }
        let element = context?.element;
        let viewer = context?.viewer;
        if (!viewer) {
            viewer = searchView.getControl();
        }
        if (!element) {
            element = viewer.getFocus()[0] ?? undefined;
        }
        const opInfo = getElementsToOperateOnInfo(viewer, element, configurationService.getValue('search'));
        const elementsToRemove = opInfo.elements;
        let focusElement = viewer.getFocus()[0] ?? undefined;
        if (elementsToRemove.length === 0) {
            return;
        }
        if (!focusElement || (focusElement instanceof SearchResult)) {
            focusElement = element;
        }
        let nextFocusElement;
        if (opInfo.mustReselect && focusElement) {
            nextFocusElement = getElementToFocusAfterRemoved(viewer, focusElement, elementsToRemove);
        }
        const searchResult = searchView.searchResult;
        if (searchResult) {
            searchResult.batchRemove(elementsToRemove);
        }
        if (opInfo.mustReselect && focusElement) {
            if (!nextFocusElement) {
                nextFocusElement = getLastNodeFromSameType(viewer, focusElement);
            }
            if (nextFocusElement && !arrayContainsElementOrParent(nextFocusElement, elementsToRemove)) {
                viewer.reveal(nextFocusElement);
                viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
                viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
            }
        }
        viewer.domFocus();
        return;
    }
});
registerAction2(class ReplaceAction extends Action2 {
    constructor() {
        super({
            id: Constants.ReplaceActionId,
            title: {
                value: nls.localize('match.replace.label', "Replace"),
                original: 'Replace'
            },
            category,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.MatchFocusKey),
                primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
            },
            icon: searchReplaceIcon,
            menu: [
                {
                    id: MenuId.SearchContext,
                    when: ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.MatchFocusKey),
                    group: 'search',
                    order: 1
                },
                {
                    id: MenuId.SearchActionMenu,
                    when: ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.MatchFocusKey),
                    group: 'inline',
                    order: 1
                }
            ]
        });
    }
    async run(accessor, context) {
        return performReplace(accessor, context);
    }
});
registerAction2(class ReplaceAllAction extends Action2 {
    constructor() {
        super({
            id: Constants.ReplaceAllInFileActionId,
            title: {
                value: nls.localize('file.replaceAll.label', "Replace All"),
                original: 'Replace All'
            },
            category,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FileFocusKey),
                primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
            },
            icon: searchReplaceIcon,
            menu: [
                {
                    id: MenuId.SearchContext,
                    when: ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FileFocusKey),
                    group: 'search',
                    order: 1
                },
                {
                    id: MenuId.SearchActionMenu,
                    when: ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FileFocusKey),
                    group: 'inline',
                    order: 1
                }
            ]
        });
    }
    async run(accessor, context) {
        return performReplace(accessor, context);
    }
});
registerAction2(class ReplaceAllInFolderAction extends Action2 {
    constructor() {
        super({
            id: Constants.ReplaceAllInFolderActionId,
            title: {
                value: nls.localize('file.replaceAll.label', "Replace All"),
                original: 'Replace All'
            },
            category,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FolderFocusKey),
                primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
            },
            icon: searchReplaceIcon,
            menu: [
                {
                    id: MenuId.SearchContext,
                    when: ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FolderFocusKey),
                    group: 'search',
                    order: 1
                },
                {
                    id: MenuId.SearchActionMenu,
                    when: ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FolderFocusKey),
                    group: 'inline',
                    order: 1
                }
            ]
        });
    }
    async run(accessor, context) {
        return performReplace(accessor, context);
    }
});
//#endregion
//#region Helpers
function performReplace(accessor, context) {
    const configurationService = accessor.get(IConfigurationService);
    const viewsService = accessor.get(IViewsService);
    const viewlet = getSearchView(viewsService);
    const viewer = context?.viewer ?? viewlet?.getControl();
    if (!viewer) {
        return;
    }
    const element = context?.element ?? viewer.getFocus()[0];
    // since multiple elements can be selected, we need to check the type of the FolderMatch/FileMatch/Match before we perform the replace.
    const opInfo = getElementsToOperateOnInfo(viewer, element ?? undefined, configurationService.getValue('search'));
    const elementsToReplace = opInfo.elements;
    let focusElement = viewer.getFocus()[0];
    if (!focusElement || (focusElement && !arrayContainsElementOrParent(focusElement, elementsToReplace)) || (focusElement instanceof SearchResult)) {
        focusElement = element;
    }
    if (elementsToReplace.length === 0) {
        return;
    }
    let nextFocusElement;
    if (focusElement) {
        nextFocusElement = getElementToFocusAfterRemoved(viewer, focusElement, elementsToReplace);
    }
    const searchResult = viewlet?.searchResult;
    if (searchResult) {
        searchResult.batchReplace(elementsToReplace);
    }
    if (focusElement) {
        if (!nextFocusElement) {
            nextFocusElement = getLastNodeFromSameType(viewer, focusElement);
        }
        if (nextFocusElement) {
            viewer.reveal(nextFocusElement);
            viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
            viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
            if (nextFocusElement instanceof Match) {
                const useReplacePreview = configurationService.getValue().search.useReplacePreview;
                if (!useReplacePreview || hasToOpenFile(accessor, nextFocusElement)) {
                    viewlet?.open(nextFocusElement, true);
                }
                else {
                    accessor.get(IReplaceService).openReplacePreview(nextFocusElement, true);
                }
            }
            else if (nextFocusElement instanceof FileMatch) {
                viewlet?.open(nextFocusElement, true);
            }
        }
    }
    viewer.domFocus();
}
function hasToOpenFile(accessor, currBottomElem) {
    if (!(currBottomElem instanceof Match)) {
        return false;
    }
    const activeEditor = accessor.get(IEditorService).activeEditor;
    const file = activeEditor?.resource;
    if (file) {
        return accessor.get(IUriIdentityService).extUri.isEqual(file, currBottomElem.parent().resource);
    }
    return false;
}
function compareLevels(elem1, elem2) {
    if (elem1 instanceof Match) {
        if (elem2 instanceof Match) {
            return 0;
        }
        else {
            return -1;
        }
    }
    else if (elem1 instanceof FileMatch) {
        if (elem2 instanceof Match) {
            return 1;
        }
        else if (elem2 instanceof FileMatch) {
            return 0;
        }
        else {
            return -1;
        }
    }
    else {
        // FolderMatch
        if (elem2 instanceof FolderMatch) {
            return 0;
        }
        else {
            return 1;
        }
    }
}
/**
 * Returns element to focus after removing the given element
 */
export function getElementToFocusAfterRemoved(viewer, element, elementsToRemove) {
    const navigator = viewer.navigate(element);
    if (element instanceof FolderMatch) {
        while (!!navigator.next() && (!(navigator.current() instanceof FolderMatch) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) { }
    }
    else if (element instanceof FileMatch) {
        while (!!navigator.next() && (!(navigator.current() instanceof FileMatch) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) {
            viewer.expand(navigator.current());
        }
    }
    else {
        while (navigator.next() && (!(navigator.current() instanceof Match) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) {
            viewer.expand(navigator.current());
        }
    }
    return navigator.current();
}
/***
 * Finds the last element in the tree with the same type as `element`
 */
export function getLastNodeFromSameType(viewer, element) {
    let lastElem = viewer.lastVisibleElement ?? null;
    while (lastElem) {
        const compareVal = compareLevels(element, lastElem);
        if (compareVal === -1) {
            viewer.expand(lastElem);
            lastElem = viewer.lastVisibleElement;
        }
        else if (compareVal === 1) {
            lastElem = viewer.getParentElement(lastElem);
        }
        else {
            return lastElem;
        }
    }
    return undefined;
}
//#endregion
