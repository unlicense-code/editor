export declare type PerfName = 'startTime' | 'extensionActivated' | 'inputLoaded' | 'webviewCommLoaded' | 'customMarkdownLoaded' | 'editorLoaded';
declare type PerformanceMark = {
    [key in PerfName]?: number;
};
export declare class NotebookPerfMarks {
    private _marks;
    get value(): PerformanceMark;
    mark(name: PerfName): void;
}
export {};
