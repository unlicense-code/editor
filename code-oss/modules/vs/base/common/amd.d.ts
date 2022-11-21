export declare abstract class LoaderStats {
    abstract get amdLoad(): [string, number][];
    abstract get amdInvoke(): [string, number][];
    abstract get nodeRequire(): [string, number][];
    abstract get nodeEval(): [string, number][];
    abstract get nodeRequireTotal(): number;
    static get(): LoaderStats;
    static toMarkdownTable(header: string[], rows: Array<Array<{
        toString(): string;
    } | undefined>>): string;
}
