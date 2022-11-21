import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ITokenizationRegistry, ITokenizationSupport, ITokenizationSupportChangedEvent, ITokenizationSupportFactory } from 'vs/editor/common/languages';
export declare class TokenizationRegistry implements ITokenizationRegistry {
    private readonly _map;
    private readonly _factories;
    private readonly _onDidChange;
    readonly onDidChange: Event<ITokenizationSupportChangedEvent>;
    private _colorMap;
    constructor();
    fire(languages: string[]): void;
    register(language: string, support: ITokenizationSupport): IDisposable;
    registerFactory(languageId: string, factory: ITokenizationSupportFactory): IDisposable;
    getOrCreate(languageId: string): Promise<ITokenizationSupport | null>;
    get(language: string): ITokenizationSupport | null;
    isResolved(languageId: string): boolean;
    setColorMap(colorMap: Color[]): void;
    getColorMap(): Color[] | null;
    getDefaultBackground(): Color | null;
}
