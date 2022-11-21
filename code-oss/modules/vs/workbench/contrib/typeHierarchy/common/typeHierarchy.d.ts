import { IRange } from 'vs/editor/common/core/range';
import { SymbolKind, ProviderResult, SymbolTag } from 'vs/editor/common/languages';
import { ITextModel } from 'vs/editor/common/model';
import { CancellationToken } from 'vs/base/common/cancellation';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { URI } from 'vs/base/common/uri';
import { IPosition } from 'vs/editor/common/core/position';
import { RefCountedDisposable } from 'vs/base/common/lifecycle';
export declare const enum TypeHierarchyDirection {
    Subtypes = "subtypes",
    Supertypes = "supertypes"
}
export interface TypeHierarchyItem {
    _sessionId: string;
    _itemId: string;
    kind: SymbolKind;
    name: string;
    detail?: string;
    uri: URI;
    range: IRange;
    selectionRange: IRange;
    tags?: SymbolTag[];
}
export interface TypeHierarchySession {
    roots: TypeHierarchyItem[];
    dispose(): void;
}
export interface TypeHierarchyProvider {
    prepareTypeHierarchy(document: ITextModel, position: IPosition, token: CancellationToken): ProviderResult<TypeHierarchySession>;
    provideSupertypes(item: TypeHierarchyItem, token: CancellationToken): ProviderResult<TypeHierarchyItem[]>;
    provideSubtypes(item: TypeHierarchyItem, token: CancellationToken): ProviderResult<TypeHierarchyItem[]>;
}
export declare const TypeHierarchyProviderRegistry: LanguageFeatureRegistry<TypeHierarchyProvider>;
export declare class TypeHierarchyModel {
    readonly id: string;
    readonly provider: TypeHierarchyProvider;
    readonly roots: TypeHierarchyItem[];
    readonly ref: RefCountedDisposable;
    static create(model: ITextModel, position: IPosition, token: CancellationToken): Promise<TypeHierarchyModel | undefined>;
    readonly root: TypeHierarchyItem;
    private constructor();
    dispose(): void;
    fork(item: TypeHierarchyItem): TypeHierarchyModel;
    provideSupertypes(item: TypeHierarchyItem, token: CancellationToken): Promise<TypeHierarchyItem[]>;
    provideSubtypes(item: TypeHierarchyItem, token: CancellationToken): Promise<TypeHierarchyItem[]>;
}
