/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { onUnexpectedError } from 'vs/base/common/errors';
import { parse } from 'vs/base/common/marshalling';
import { MergeEditorInput, MergeEditorInputData } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInput';
export class MergeEditorSerializer {
    canSerialize() {
        return true;
    }
    serialize(editor) {
        return JSON.stringify(this.toJSON(editor));
    }
    toJSON(editor) {
        return {
            base: editor.base,
            input1: editor.input1,
            input2: editor.input2,
            result: editor.result,
        };
    }
    deserialize(instantiationService, raw) {
        try {
            const data = parse(raw);
            return instantiationService.createInstance(MergeEditorInput, data.base, new MergeEditorInputData(data.input1.uri, data.input1.title, data.input1.detail, data.input1.description), new MergeEditorInputData(data.input2.uri, data.input2.title, data.input2.detail, data.input2.description), data.result);
        }
        catch (err) {
            onUnexpectedError(err);
            return undefined;
        }
    }
}
