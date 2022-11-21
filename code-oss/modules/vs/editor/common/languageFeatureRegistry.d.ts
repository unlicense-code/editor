import { IDisposable } from 'vs/base/common/lifecycle';
import { ITextModel } from 'vs/editor/common/model';
import { LanguageSelector } from 'vs/editor/common/languageSelector';
import { URI } from 'vs/base/common/uri';
export interface NotebookInfo {
    readonly uri: URI;
    readonly type: string;
}
export interface NotebookInfoResolver {
    (uri: URI): NotebookInfo | undefined;
}
export declare class LanguageFeatureRegistry<T> {
    private readonly _notebookInfoResolver?;
    private _clock;
    private readonly _entries;
    private readonly _onDidChange;
    readonly onDidChange: import("vs/base/common/event").Event<number>;
    constructor(_notebookInfoResolver?: NotebookInfoResolver | undefined);
    register(selector: LanguageSelector, provider: T): IDisposable;
    has(model: ITextModel): boolean;
    all(model: ITextModel): T[];
    ordered(model: ITextModel): T[];
    orderedGroups(model: ITextModel): T[][];
    private _orderedForEach;
    private _lastCandidate;
    private _updateScores;
    private static _compareByScoreAndTime;
}
