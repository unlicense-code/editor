import { IPosition } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { CompletionItemKind } from 'vs/editor/common/languages';
import { CompletionItem } from 'vs/editor/contrib/suggest/browser/suggest';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare abstract class Memory {
    readonly name: MemMode;
    constructor(name: MemMode);
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    abstract memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    abstract toJSON(): object | undefined;
    abstract fromJSON(data: object): void;
}
export declare class NoMemory extends Memory {
    constructor();
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    toJSON(): undefined;
    fromJSON(): void;
}
export interface MemItem {
    type: string | CompletionItemKind;
    insertText: string;
    touch: number;
}
export declare class LRUMemory extends Memory {
    constructor();
    private _cache;
    private _seq;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    toJSON(): object;
    fromJSON(data: [string, MemItem][]): void;
}
export declare class PrefixMemory extends Memory {
    constructor();
    private _trie;
    private _seq;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    toJSON(): object;
    fromJSON(data: [string, MemItem][]): void;
}
export declare type MemMode = 'first' | 'recentlyUsed' | 'recentlyUsedByPrefix';
export declare class SuggestMemoryService implements ISuggestMemoryService {
    private readonly _storageService;
    private readonly _configService;
    private static readonly _strategyCtors;
    private static readonly _storagePrefix;
    readonly _serviceBrand: undefined;
    private readonly _persistSoon;
    private readonly _disposables;
    private _strategy?;
    constructor(_storageService: IStorageService, _configService: IConfigurationService);
    dispose(): void;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
    private _withStrategy;
    private _saveState;
}
export declare const ISuggestMemoryService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISuggestMemoryService>;
export interface ISuggestMemoryService {
    readonly _serviceBrand: undefined;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
}
