import { URI } from 'vs/base/common/uri';
import { IModelContentChange } from 'vs/editor/common/textModelEvents';
import { PrefixSumComputer } from 'vs/editor/common/model/prefixSumComputer';
export interface IModelChangedEvent {
    /**
     * The actual changes.
     */
    readonly changes: IModelContentChange[];
    /**
     * The (new) end-of-line character.
     */
    readonly eol: string;
    /**
     * The new version id the model has transitioned to.
     */
    readonly versionId: number;
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
}
export interface IMirrorTextModel {
    readonly version: number;
}
export declare class MirrorTextModel implements IMirrorTextModel {
    protected _uri: URI;
    protected _lines: string[];
    protected _eol: string;
    protected _versionId: number;
    protected _lineStarts: PrefixSumComputer | null;
    private _cachedTextValue;
    constructor(uri: URI, lines: string[], eol: string, versionId: number);
    dispose(): void;
    get version(): number;
    getText(): string;
    onEvents(e: IModelChangedEvent): void;
    protected _ensureLineStarts(): void;
    /**
     * All changes to a line's text go through this method
     */
    private _setLineText;
    private _acceptDeleteRange;
    private _acceptInsertText;
}
