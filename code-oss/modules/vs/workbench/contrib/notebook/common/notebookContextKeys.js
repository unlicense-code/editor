/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ContextKeyExpr, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { INTERACTIVE_WINDOW_EDITOR_ID, NOTEBOOK_EDITOR_ID } from 'vs/workbench/contrib/notebook/common/notebookCommon';
//#region Context Keys
export const HAS_OPENED_NOTEBOOK = new RawContextKey('userHasOpenedNotebook', false);
export const KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED = new RawContextKey('notebookFindWidgetFocused', false);
// Is Notebook
export const NOTEBOOK_IS_ACTIVE_EDITOR = ContextKeyExpr.equals('activeEditor', NOTEBOOK_EDITOR_ID);
export const INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR = ContextKeyExpr.equals('activeEditor', INTERACTIVE_WINDOW_EDITOR_ID);
// Editor keys
export const NOTEBOOK_EDITOR_FOCUSED = new RawContextKey('notebookEditorFocused', false);
export const NOTEBOOK_CELL_LIST_FOCUSED = new RawContextKey('notebookCellListFocused', false);
export const NOTEBOOK_OUTPUT_FOCUSED = new RawContextKey('notebookOutputFocused', false);
export const NOTEBOOK_EDITOR_EDITABLE = new RawContextKey('notebookEditable', true);
export const NOTEBOOK_HAS_RUNNING_CELL = new RawContextKey('notebookHasRunningCell', false);
export const NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON = new RawContextKey('notebookUseConsolidatedOutputButton', false);
export const NOTEBOOK_BREAKPOINT_MARGIN_ACTIVE = new RawContextKey('notebookBreakpointMargin', false);
export const NOTEBOOK_CELL_TOOLBAR_LOCATION = new RawContextKey('notebookCellToolbarLocation', 'left');
export const NOTEBOOK_CURSOR_NAVIGATION_MODE = new RawContextKey('notebookCursorNavigationMode', false);
export const NOTEBOOK_LAST_CELL_FAILED = new RawContextKey('notebookLastCellFailed', false);
// Cell keys
export const NOTEBOOK_VIEW_TYPE = new RawContextKey('notebookType', undefined);
export const NOTEBOOK_CELL_TYPE = new RawContextKey('notebookCellType', undefined);
export const NOTEBOOK_CELL_EDITABLE = new RawContextKey('notebookCellEditable', false);
export const NOTEBOOK_CELL_FOCUSED = new RawContextKey('notebookCellFocused', false);
export const NOTEBOOK_CELL_EDITOR_FOCUSED = new RawContextKey('notebookCellEditorFocused', false);
export const NOTEBOOK_CELL_MARKDOWN_EDIT_MODE = new RawContextKey('notebookCellMarkdownEditMode', false);
export const NOTEBOOK_CELL_LINE_NUMBERS = new RawContextKey('notebookCellLineNumbers', 'inherit');
export const NOTEBOOK_CELL_EXECUTION_STATE = new RawContextKey('notebookCellExecutionState', undefined);
export const NOTEBOOK_CELL_EXECUTING = new RawContextKey('notebookCellExecuting', false); // This only exists to simplify a context key expression, see #129625
export const NOTEBOOK_CELL_HAS_OUTPUTS = new RawContextKey('notebookCellHasOutputs', false);
export const NOTEBOOK_CELL_INPUT_COLLAPSED = new RawContextKey('notebookCellInputIsCollapsed', false);
export const NOTEBOOK_CELL_OUTPUT_COLLAPSED = new RawContextKey('notebookCellOutputIsCollapsed', false);
export const NOTEBOOK_CELL_RESOURCE = new RawContextKey('notebookCellResource', '');
// Kernels
export const NOTEBOOK_KERNEL = new RawContextKey('notebookKernel', undefined);
export const NOTEBOOK_KERNEL_COUNT = new RawContextKey('notebookKernelCount', 0);
export const NOTEBOOK_KERNEL_SOURCE_COUNT = new RawContextKey('notebookKernelSourceCount', 0);
export const NOTEBOOK_KERNEL_SELECTED = new RawContextKey('notebookKernelSelected', false);
export const NOTEBOOK_INTERRUPTIBLE_KERNEL = new RawContextKey('notebookInterruptibleKernel', false);
export const NOTEBOOK_MISSING_KERNEL_EXTENSION = new RawContextKey('notebookMissingKernelExtension', false);
export const NOTEBOOK_HAS_OUTPUTS = new RawContextKey('notebookHasOutputs', false);
//#endregion
