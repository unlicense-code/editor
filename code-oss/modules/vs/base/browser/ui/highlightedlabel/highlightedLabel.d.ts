/**
 * A range to be highlighted.
 */
export interface IHighlight {
    start: number;
    end: number;
    extraClasses?: string[];
}
export interface IOptions {
    /**
     * Whether
     */
    readonly supportIcons?: boolean;
}
/**
 * A widget which can render a label with substring highlights, often
 * originating from a filter function like the fuzzy matcher.
 */
export declare class HighlightedLabel {
    private readonly domNode;
    private text;
    private title;
    private highlights;
    private supportIcons;
    private didEverRender;
    /**
     * Create a new {@link HighlightedLabel}.
     *
     * @param container The parent container to append to.
     */
    constructor(container: HTMLElement, options?: IOptions);
    /**
     * The label's DOM node.
     */
    get element(): HTMLElement;
    /**
     * Set the label and highlights.
     *
     * @param text The label to display.
     * @param highlights The ranges to highlight.
     * @param title An optional title for the hover tooltip.
     * @param escapeNewLines Whether to escape new lines.
     * @returns
     */
    set(text: string | undefined, highlights?: readonly IHighlight[], title?: string, escapeNewLines?: boolean): void;
    private render;
    static escapeNewLines(text: string, highlights: readonly IHighlight[]): string;
}
