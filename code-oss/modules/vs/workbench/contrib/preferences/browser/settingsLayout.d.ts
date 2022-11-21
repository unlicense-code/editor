export interface ITOCEntry<T> {
    id: string;
    label: string;
    order?: number;
    children?: ITOCEntry<T>[];
    settings?: Array<T>;
}
export declare const commonlyUsedData: ITOCEntry<string>;
export declare const tocData: ITOCEntry<string>;
export declare const knownAcronyms: Set<string>;
export declare const knownTermMappings: Map<string, string>;
