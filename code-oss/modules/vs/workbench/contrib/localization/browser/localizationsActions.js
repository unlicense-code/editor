/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { Action2, MenuId } from 'vs/platform/actions/common/actions';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
import { ILocaleService } from 'vs/workbench/contrib/localization/common/locale';
export class ConfigureDisplayLanguageAction extends Action2 {
    static ID = 'workbench.action.configureLocale';
    static LABEL = localize('configureLocale', "Configure Display Language");
    constructor() {
        super({
            id: ConfigureDisplayLanguageAction.ID,
            title: { original: 'Configure Display Language', value: ConfigureDisplayLanguageAction.LABEL },
            menu: {
                id: MenuId.CommandPalette
            }
        });
    }
    async run(accessor) {
        const languagePackService = accessor.get(ILanguagePackService);
        const quickInputService = accessor.get(IQuickInputService);
        const localeService = accessor.get(ILocaleService);
        const installedLanguages = await languagePackService.getInstalledLanguages();
        const qp = quickInputService.createQuickPick();
        qp.placeholder = localize('chooseLocale', "Select Display Language");
        if (installedLanguages?.length) {
            const items = [{ type: 'separator', label: localize('installed', "Installed") }];
            qp.items = items.concat(installedLanguages);
        }
        const disposables = new DisposableStore();
        const source = new CancellationTokenSource();
        disposables.add(qp.onDispose(() => {
            source.cancel();
            disposables.dispose();
        }));
        const installedSet = new Set(installedLanguages?.map(language => language.id) ?? []);
        languagePackService.getAvailableLanguages().then(availableLanguages => {
            const newLanguages = availableLanguages.filter(l => l.id && !installedSet.has(l.id));
            if (newLanguages.length) {
                qp.items = [
                    ...qp.items,
                    { type: 'separator', label: localize('available', "Available") },
                    ...newLanguages
                ];
            }
            qp.busy = false;
        });
        disposables.add(qp.onDidAccept(async () => {
            const selectedLanguage = qp.activeItems[0];
            qp.hide();
            await localeService.setLocale(selectedLanguage);
        }));
        qp.show();
        qp.busy = true;
    }
}
export class ClearDisplayLanguageAction extends Action2 {
    static ID = 'workbench.action.clearLocalePreference';
    static LABEL = localize('clearDisplayLanguage', "Clear Display Language Preference");
    constructor() {
        super({
            id: ClearDisplayLanguageAction.ID,
            title: { original: 'Clear Display Language Preference', value: ClearDisplayLanguageAction.LABEL },
            menu: {
                id: MenuId.CommandPalette
            }
        });
    }
    async run(accessor) {
        const localeService = accessor.get(ILocaleService);
        await localeService.clearLocalePreference();
    }
}
