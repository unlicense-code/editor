import { Verbosity, EditorInputWithPreferredResource, EditorInputCapabilities } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
/**
 * The base class for all editor inputs that open resources.
 */
export declare abstract class AbstractResourceEditorInput extends EditorInput implements EditorInputWithPreferredResource {
    readonly resource: URI;
    protected readonly labelService: ILabelService;
    protected readonly fileService: IFileService;
    get capabilities(): EditorInputCapabilities;
    private _preferredResource;
    get preferredResource(): URI;
    constructor(resource: URI, preferredResource: URI | undefined, labelService: ILabelService, fileService: IFileService);
    private registerListeners;
    private onLabelEvent;
    private updateLabel;
    setPreferredResource(preferredResource: URI): void;
    private _name;
    getName(): string;
    getDescription(verbosity?: Verbosity): string | undefined;
    private _shortDescription;
    private get shortDescription();
    private _mediumDescription;
    private get mediumDescription();
    private _longDescription;
    private get longDescription();
    private _shortTitle;
    private get shortTitle();
    private _mediumTitle;
    private get mediumTitle();
    private _longTitle;
    private get longTitle();
    getTitle(verbosity?: Verbosity): string;
}
