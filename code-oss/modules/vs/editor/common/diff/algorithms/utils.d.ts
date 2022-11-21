export declare class Array2D<T> {
    readonly width: number;
    readonly height: number;
    private readonly array;
    constructor(width: number, height: number);
    get(x: number, y: number): T;
    set(x: number, y: number, value: T): void;
}
