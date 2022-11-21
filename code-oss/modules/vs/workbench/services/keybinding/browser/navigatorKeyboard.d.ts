export interface IKeyboard {
    getLayoutMap(): Promise<Object>;
    lock(keyCodes?: string[]): Promise<void>;
    unlock(): void;
    addEventListener?(type: string, listener: () => void): void;
}
export declare type INavigatorWithKeyboard = Navigator & {
    keyboard: IKeyboard;
};
