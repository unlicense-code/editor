/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export const ctxIsMergeEditor = new RawContextKey('isMergeEditor', false, { type: 'boolean', description: localize('is', 'The editor is a merge editor') });
export const ctxIsMergeResultEditor = new RawContextKey('isMergeResultEditor', false, { type: 'boolean', description: localize('isr', 'The editor is a the result editor of a merge editor.') });
export const ctxMergeEditorLayout = new RawContextKey('mergeEditorLayout', 'mixed', { type: 'string', description: localize('editorLayout', 'The layout mode of a merge editor') });
export const ctxMergeEditorShowBase = new RawContextKey('mergeEditorShowBase', false, { type: 'boolean', description: localize('showBase', 'If the merge editor shows the base version') });
export const ctxMergeEditorShowBaseAtTop = new RawContextKey('mergeEditorShowBaseAtTop', false, { type: 'boolean', description: localize('showBaseAtTop', 'If base should be shown at the top') });
export const ctxMergeEditorShowNonConflictingChanges = new RawContextKey('mergeEditorShowNonConflictingChanges', false, { type: 'boolean', description: localize('showNonConflictingChanges', 'If the merge editor shows non-conflicting changes') });
export const ctxMergeBaseUri = new RawContextKey('mergeEditorBaseUri', '', { type: 'string', description: localize('baseUri', 'The uri of the baser of a merge editor') });
export const ctxMergeResultUri = new RawContextKey('mergeEditorResultUri', '', { type: 'string', description: localize('resultUri', 'The uri of the result of a merge editor') });
