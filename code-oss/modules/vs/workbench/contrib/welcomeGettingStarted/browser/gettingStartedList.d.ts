import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { Dimension } from 'vs/base/browser/dom';
import { ContextKeyExpression, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
declare type GettingStartedIndexListOptions<T> = {
    title: string;
    klass: string;
    limit: number;
    empty?: HTMLElement | undefined;
    more?: HTMLElement | undefined;
    footer?: HTMLElement | undefined;
    renderElement: (item: T) => HTMLElement;
    rankElement?: (item: T) => number | null;
    contextService: IContextKeyService;
};
export declare class GettingStartedIndexList<T extends {
    id: string;
    when?: ContextKeyExpression;
}> extends Disposable {
    private options;
    private readonly _onDidChangeEntries;
    private readonly onDidChangeEntries;
    private domElement;
    private list;
    private scrollbar;
    private entries;
    private lastRendered;
    itemCount: number;
    private isDisposed;
    private contextService;
    private contextKeysToWatch;
    constructor(options: GettingStartedIndexListOptions<T>);
    getDomElement(): HTMLElement;
    layout(size: Dimension): void;
    onDidChange(listener: () => void): void;
    register(d: IDisposable): void;
    dispose(): void;
    setLimit(limit: number): void;
    rerender(): void;
    setEntries(entries: undefined | T[]): void;
}
export {};
