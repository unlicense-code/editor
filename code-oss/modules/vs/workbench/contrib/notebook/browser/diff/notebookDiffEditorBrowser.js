/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export var DiffSide;
(function (DiffSide) {
    DiffSide[DiffSide["Original"] = 0] = "Original";
    DiffSide[DiffSide["Modified"] = 1] = "Modified";
})(DiffSide || (DiffSide = {}));
export const DIFF_CELL_MARGIN = 16;
export const NOTEBOOK_DIFF_CELL_INPUT = new RawContextKey('notebookDiffCellInputChanged', false);
export const NOTEBOOK_DIFF_CELL_PROPERTY = new RawContextKey('notebookDiffCellPropertyChanged', false);
export const NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED = new RawContextKey('notebookDiffCellPropertyExpanded', false);
