/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ExternalUriOpenerPriority } from 'vs/editor/common/languages';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ExternalUriOpenerService } from 'vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService';
class MockQuickInputService {
    pickIndex;
    constructor(pickIndex) {
        this.pickIndex = pickIndex;
    }
    async pick(picks, options, token) {
        const resolvedPicks = await picks;
        const item = resolvedPicks[this.pickIndex];
        if (item.type === 'separator') {
            return undefined;
        }
        return item;
    }
}
suite('ExternalUriOpenerService', () => {
    let instantiationService;
    setup(() => {
        instantiationService = new TestInstantiationService();
        instantiationService.stub(IConfigurationService, new TestConfigurationService());
        instantiationService.stub(IOpenerService, {
            registerExternalOpener: () => { return Disposable.None; }
        });
    });
    test('Should not open if there are no openers', async () => {
        const externalUriOpenerService = instantiationService.createInstance(ExternalUriOpenerService);
        externalUriOpenerService.registerExternalOpenerProvider(new class {
            async *getOpeners(_targetUri) {
                // noop
            }
        });
        const uri = URI.parse('http://contoso.com');
        const didOpen = await externalUriOpenerService.openExternal(uri.toString(), { sourceUri: uri }, CancellationToken.None);
        assert.strictEqual(didOpen, false);
    });
    test('Should prompt if there is at least one enabled opener', async () => {
        instantiationService.stub(IQuickInputService, new MockQuickInputService(0));
        const externalUriOpenerService = instantiationService.createInstance(ExternalUriOpenerService);
        let openedWithEnabled = false;
        externalUriOpenerService.registerExternalOpenerProvider(new class {
            async *getOpeners(_targetUri) {
                yield {
                    id: 'disabled-id',
                    label: 'disabled',
                    canOpen: async () => ExternalUriOpenerPriority.None,
                    openExternalUri: async () => true,
                };
                yield {
                    id: 'enabled-id',
                    label: 'enabled',
                    canOpen: async () => ExternalUriOpenerPriority.Default,
                    openExternalUri: async () => {
                        openedWithEnabled = true;
                        return true;
                    }
                };
            }
        });
        const uri = URI.parse('http://contoso.com');
        const didOpen = await externalUriOpenerService.openExternal(uri.toString(), { sourceUri: uri }, CancellationToken.None);
        assert.strictEqual(didOpen, true);
        assert.strictEqual(openedWithEnabled, true);
    });
    test('Should automatically pick single preferred opener without prompt', async () => {
        const externalUriOpenerService = instantiationService.createInstance(ExternalUriOpenerService);
        let openedWithPreferred = false;
        externalUriOpenerService.registerExternalOpenerProvider(new class {
            async *getOpeners(_targetUri) {
                yield {
                    id: 'other-id',
                    label: 'other',
                    canOpen: async () => ExternalUriOpenerPriority.Default,
                    openExternalUri: async () => {
                        return true;
                    }
                };
                yield {
                    id: 'preferred-id',
                    label: 'preferred',
                    canOpen: async () => ExternalUriOpenerPriority.Preferred,
                    openExternalUri: async () => {
                        openedWithPreferred = true;
                        return true;
                    }
                };
            }
        });
        const uri = URI.parse('http://contoso.com');
        const didOpen = await externalUriOpenerService.openExternal(uri.toString(), { sourceUri: uri }, CancellationToken.None);
        assert.strictEqual(didOpen, true);
        assert.strictEqual(openedWithPreferred, true);
    });
});
