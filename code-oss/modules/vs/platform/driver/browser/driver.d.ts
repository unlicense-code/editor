import { IElement, ILocaleInfo, ILocalizedStrings, IWindowDriver } from 'vs/platform/driver/common/driver';
export declare class BrowserWindowDriver implements IWindowDriver {
    setValue(selector: string, text: string): Promise<void>;
    getTitle(): Promise<string>;
    isActiveElement(selector: string): Promise<boolean>;
    getElements(selector: string, recursive: boolean): Promise<IElement[]>;
    private serializeElement;
    getElementXY(selector: string, xoffset?: number, yoffset?: number): Promise<{
        x: number;
        y: number;
    }>;
    typeInEditor(selector: string, text: string): Promise<void>;
    getTerminalBuffer(selector: string): Promise<string[]>;
    writeInTerminal(selector: string, text: string): Promise<void>;
    getLocaleInfo(): Promise<ILocaleInfo>;
    getLocalizedStrings(): Promise<ILocalizedStrings>;
    protected _getElementXY(selector: string, offset?: {
        x: number;
        y: number;
    }): Promise<{
        x: number;
        y: number;
    }>;
    click(selector: string, xoffset?: number, yoffset?: number): Promise<void>;
    exitApplication(): Promise<void>;
}
export declare function registerWindowDriver(): void;
