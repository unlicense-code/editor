/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { FileOperationError } from 'vs/platform/files/common/files';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { VSBuffer } from 'vs/base/common/buffer';
import { areFunctions, isUndefinedOrNull } from 'vs/base/common/types';
export const ITextFileService = createDecorator('textFileService');
export var TextFileOperationResult;
(function (TextFileOperationResult) {
    TextFileOperationResult[TextFileOperationResult["FILE_IS_BINARY"] = 0] = "FILE_IS_BINARY";
})(TextFileOperationResult || (TextFileOperationResult = {}));
export class TextFileOperationError extends FileOperationError {
    textFileOperationResult;
    static isTextFileOperationError(obj) {
        return obj instanceof Error && !isUndefinedOrNull(obj.textFileOperationResult);
    }
    options;
    constructor(message, textFileOperationResult, options) {
        super(message, 11 /* FileOperationResult.FILE_OTHER_ERROR */);
        this.textFileOperationResult = textFileOperationResult;
        this.options = options;
    }
}
/**
 * States the text file editor model can be in.
 */
export var TextFileEditorModelState;
(function (TextFileEditorModelState) {
    /**
     * A model is saved.
     */
    TextFileEditorModelState[TextFileEditorModelState["SAVED"] = 0] = "SAVED";
    /**
     * A model is dirty.
     */
    TextFileEditorModelState[TextFileEditorModelState["DIRTY"] = 1] = "DIRTY";
    /**
     * A model is currently being saved but this operation has not completed yet.
     */
    TextFileEditorModelState[TextFileEditorModelState["PENDING_SAVE"] = 2] = "PENDING_SAVE";
    /**
     * A model is in conflict mode when changes cannot be saved because the
     * underlying file has changed. Models in conflict mode are always dirty.
     */
    TextFileEditorModelState[TextFileEditorModelState["CONFLICT"] = 3] = "CONFLICT";
    /**
     * A model is in orphan state when the underlying file has been deleted.
     */
    TextFileEditorModelState[TextFileEditorModelState["ORPHAN"] = 4] = "ORPHAN";
    /**
     * Any error that happens during a save that is not causing the CONFLICT state.
     * Models in error mode are always dirty.
     */
    TextFileEditorModelState[TextFileEditorModelState["ERROR"] = 5] = "ERROR";
})(TextFileEditorModelState || (TextFileEditorModelState = {}));
export var TextFileResolveReason;
(function (TextFileResolveReason) {
    TextFileResolveReason[TextFileResolveReason["EDITOR"] = 1] = "EDITOR";
    TextFileResolveReason[TextFileResolveReason["REFERENCE"] = 2] = "REFERENCE";
    TextFileResolveReason[TextFileResolveReason["OTHER"] = 3] = "OTHER";
})(TextFileResolveReason || (TextFileResolveReason = {}));
export var EncodingMode;
(function (EncodingMode) {
    /**
     * Instructs the encoding support to encode the object with the provided encoding
     */
    EncodingMode[EncodingMode["Encode"] = 0] = "Encode";
    /**
     * Instructs the encoding support to decode the object with the provided encoding
     */
    EncodingMode[EncodingMode["Decode"] = 1] = "Decode";
})(EncodingMode || (EncodingMode = {}));
export function isTextFileEditorModel(model) {
    const candidate = model;
    return areFunctions(candidate.setEncoding, candidate.getEncoding, candidate.save, candidate.revert, candidate.isDirty, candidate.getLanguageId);
}
export function snapshotToString(snapshot) {
    const chunks = [];
    let chunk;
    while (typeof (chunk = snapshot.read()) === 'string') {
        chunks.push(chunk);
    }
    return chunks.join('');
}
export function stringToSnapshot(value) {
    let done = false;
    return {
        read() {
            if (!done) {
                done = true;
                return value;
            }
            return null;
        }
    };
}
export function toBufferOrReadable(value) {
    if (typeof value === 'undefined') {
        return undefined;
    }
    if (typeof value === 'string') {
        return VSBuffer.fromString(value);
    }
    return {
        read: () => {
            const chunk = value.read();
            if (typeof chunk === 'string') {
                return VSBuffer.fromString(chunk);
            }
            return null;
        }
    };
}
