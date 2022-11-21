import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IHostColorSchemeService } from 'vs/workbench/services/themes/common/hostColorSchemeService';
export declare class BrowserHostColorSchemeService extends Disposable implements IHostColorSchemeService {
    readonly _serviceBrand: undefined;
    private readonly _onDidSchemeChangeEvent;
    constructor();
    private registerListeners;
    get onDidChangeColorScheme(): Event<void>;
    get dark(): boolean;
    get highContrast(): boolean;
}
