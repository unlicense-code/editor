import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IRange } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { ILink, ILinksList, LinkProvider } from 'vs/editor/common/languages';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export declare class Link implements ILink {
    private _link;
    private readonly _provider;
    constructor(link: ILink, provider: LinkProvider);
    toJSON(): ILink;
    get range(): IRange;
    get url(): URI | string | undefined;
    get tooltip(): string | undefined;
    resolve(token: CancellationToken): Promise<URI | string>;
}
export declare class LinksList {
    readonly links: Link[];
    private readonly _disposables;
    constructor(tuples: [ILinksList, LinkProvider][]);
    dispose(): void;
    private static _union;
}
export declare function getLinks(providers: LanguageFeatureRegistry<LinkProvider>, model: ITextModel, token: CancellationToken): Promise<LinksList>;
