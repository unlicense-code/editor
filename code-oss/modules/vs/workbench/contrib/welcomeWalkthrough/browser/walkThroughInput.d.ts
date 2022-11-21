import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { URI } from 'vs/base/common/uri';
import { DisposableStore, IReference } from 'vs/base/common/lifecycle';
import { ITextEditorModel, ITextModelService } from 'vs/editor/common/services/resolverService';
import { Dimension } from 'vs/base/browser/dom';
import { EditorInputCapabilities, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
declare class WalkThroughModel extends EditorModel {
    private mainRef;
    private snippetRefs;
    constructor(mainRef: string, snippetRefs: IReference<ITextEditorModel>[]);
    get main(): string;
    get snippets(): ITextEditorModel[];
    dispose(): void;
}
export interface WalkThroughInputOptions {
    readonly typeId: string;
    readonly name: string;
    readonly description?: string;
    readonly resource: URI;
    readonly telemetryFrom: string;
    readonly onReady?: (container: HTMLElement, contentDisposables: DisposableStore) => void;
    readonly layout?: (dimension: Dimension) => void;
}
export declare class WalkThroughInput extends EditorInput {
    private readonly options;
    private readonly instantiationService;
    private readonly textModelResolverService;
    get capabilities(): EditorInputCapabilities;
    private promise;
    private maxTopScroll;
    private maxBottomScroll;
    get resource(): URI;
    constructor(options: WalkThroughInputOptions, instantiationService: IInstantiationService, textModelResolverService: ITextModelService);
    get typeId(): string;
    getName(): string;
    getDescription(): string;
    getTelemetryFrom(): string;
    getTelemetryDescriptor(): {
        [key: string]: unknown;
    };
    get onReady(): ((container: HTMLElement, contentDisposables: DisposableStore) => void) | undefined;
    get layout(): ((dimension: Dimension) => void) | undefined;
    resolve(): Promise<WalkThroughModel>;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
    relativeScrollPosition(topScroll: number, bottomScroll: number): void;
}
export {};
