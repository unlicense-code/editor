import { Emitter, Event } from 'vs/base/common/event';
import { IMatch } from 'vs/base/common/filters';
import { IDisposable, IReference } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { Position } from 'vs/editor/common/core/position';
import { IRange } from 'vs/editor/common/core/range';
import { LocationLink } from 'vs/editor/common/languages';
import { ITextEditorModel, ITextModelService } from 'vs/editor/common/services/resolverService';
export declare class OneReference {
    readonly isProviderFirst: boolean;
    readonly parent: FileReferences;
    readonly link: LocationLink;
    private _rangeCallback;
    readonly id: string;
    private _range?;
    constructor(isProviderFirst: boolean, parent: FileReferences, link: LocationLink, _rangeCallback: (ref: OneReference) => void);
    get uri(): URI;
    get range(): IRange;
    set range(value: IRange);
    get ariaMessage(): string;
}
export declare class FilePreview implements IDisposable {
    private readonly _modelReference;
    constructor(_modelReference: IReference<ITextEditorModel>);
    dispose(): void;
    preview(range: IRange, n?: number): {
        value: string;
        highlight: IMatch;
    } | undefined;
}
export declare class FileReferences implements IDisposable {
    readonly parent: ReferencesModel;
    readonly uri: URI;
    readonly children: OneReference[];
    private _previews;
    constructor(parent: ReferencesModel, uri: URI);
    dispose(): void;
    getPreview(child: OneReference): FilePreview | undefined;
    get ariaMessage(): string;
    resolve(textModelResolverService: ITextModelService): Promise<FileReferences>;
}
export declare class ReferencesModel implements IDisposable {
    private readonly _links;
    private readonly _title;
    readonly groups: FileReferences[];
    readonly references: OneReference[];
    readonly _onDidChangeReferenceRange: Emitter<OneReference>;
    readonly onDidChangeReferenceRange: Event<OneReference>;
    constructor(links: LocationLink[], title: string);
    dispose(): void;
    clone(): ReferencesModel;
    get title(): string;
    get isEmpty(): boolean;
    get ariaMessage(): string;
    nextOrPreviousReference(reference: OneReference, next: boolean): OneReference;
    nearestReference(resource: URI, position: Position): OneReference | undefined;
    referenceAt(resource: URI, position: Position): OneReference | undefined;
    firstReference(): OneReference | undefined;
    private static _compareReferences;
}
