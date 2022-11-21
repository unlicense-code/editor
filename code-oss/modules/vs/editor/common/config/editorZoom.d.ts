import { Event } from 'vs/base/common/event';
export interface IEditorZoom {
    onDidChangeZoomLevel: Event<number>;
    getZoomLevel(): number;
    setZoomLevel(zoomLevel: number): void;
}
export declare const EditorZoom: IEditorZoom;
