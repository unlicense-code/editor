import { IRange } from 'vs/editor/common/core/range';
import { SymbolKind, ProviderResult, SymbolTag } from 'vs/editor/common/languages';
import { ITextModel } from 'vs/editor/common/model';
import { CancellationToken } from 'vs/base/common/cancellation';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { URI } from 'vs/base/common/uri';
import { IPosition } from 'vs/editor/common/core/position';
import { RefCountedDisposable } from 'vs/base/common/lifecycle';
export declare const enum CallHierarchyDirection {
    CallsTo = "incomingCalls",
    CallsFrom = "outgoingCalls"
}
export interface CallHierarchyItem {
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
export interface IncomingCall {
    from: CallHierarchyItem;
    fromRanges: IRange[];
}
export interface OutgoingCall {
    fromRanges: IRange[];
    to: CallHierarchyItem;
}
export interface CallHierarchySession {
    roots: CallHierarchyItem[];
    dispose(): void;
}
export interface CallHierarchyProvider {
    prepareCallHierarchy(document: ITextModel, position: IPosition, token: CancellationToken): ProviderResult<CallHierarchySession>;
    provideIncomingCalls(item: CallHierarchyItem, token: CancellationToken): ProviderResult<IncomingCall[]>;
    provideOutgoingCalls(item: CallHierarchyItem, token: CancellationToken): ProviderResult<OutgoingCall[]>;
}
export declare const CallHierarchyProviderRegistry: LanguageFeatureRegistry<CallHierarchyProvider>;
export declare class CallHierarchyModel {
    readonly id: string;
    readonly provider: CallHierarchyProvider;
    readonly roots: CallHierarchyItem[];
    readonly ref: RefCountedDisposable;
    static create(model: ITextModel, position: IPosition, token: CancellationToken): Promise<CallHierarchyModel | undefined>;
    readonly root: CallHierarchyItem;
    private constructor();
    dispose(): void;
    fork(item: CallHierarchyItem): CallHierarchyModel;
    resolveIncomingCalls(item: CallHierarchyItem, token: CancellationToken): Promise<IncomingCall[]>;
    resolveOutgoingCalls(item: CallHierarchyItem, token: CancellationToken): Promise<OutgoingCall[]>;
}
