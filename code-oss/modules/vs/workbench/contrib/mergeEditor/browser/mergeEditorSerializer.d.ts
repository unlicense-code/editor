import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorSerializer } from 'vs/workbench/common/editor';
import { MergeEditorInput } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInput';
export declare class MergeEditorSerializer implements IEditorSerializer {
    canSerialize(): boolean;
    serialize(editor: MergeEditorInput): string;
    toJSON(editor: MergeEditorInput): MergeEditorInputJSON;
    deserialize(instantiationService: IInstantiationService, raw: string): MergeEditorInput | undefined;
}
interface MergeEditorInputJSON {
    base: URI;
    input1: {
        uri: URI;
        title?: string;
        detail?: string;
        description?: string;
    };
    input2: {
        uri: URI;
        title?: string;
        detail?: string;
        description?: string;
    };
    result: URI;
}
export {};
