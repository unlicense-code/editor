/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { localize } from 'vs/nls';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { IIntegrityService } from 'vs/workbench/services/integrity/common/integrity';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { FileAccess } from 'vs/base/common/network';
import { IChecksumService } from 'vs/platform/checksum/common/checksumService';
class IntegrityStorage {
    static KEY = 'integrityService';
    storageService;
    value;
    constructor(storageService) {
        this.storageService = storageService;
        this.value = this._read();
    }
    _read() {
        const jsonValue = this.storageService.get(IntegrityStorage.KEY, -1 /* StorageScope.APPLICATION */);
        if (!jsonValue) {
            return null;
        }
        try {
            return JSON.parse(jsonValue);
        }
        catch (err) {
            return null;
        }
    }
    get() {
        return this.value;
    }
    set(data) {
        this.value = data;
        this.storageService.store(IntegrityStorage.KEY, JSON.stringify(this.value), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
}
let IntegrityService = class IntegrityService {
    notificationService;
    lifecycleService;
    openerService;
    productService;
    checksumService;
    _storage;
    _isPurePromise;
    constructor(notificationService, storageService, lifecycleService, openerService, productService, checksumService) {
        this.notificationService = notificationService;
        this.lifecycleService = lifecycleService;
        this.openerService = openerService;
        this.productService = productService;
        this.checksumService = checksumService;
        this._storage = new IntegrityStorage(storageService);
        this._isPurePromise = this._isPure();
        this.isPure().then(r => {
            if (r.isPure) {
                return; // all is good
            }
            this._prompt();
        });
    }
    _prompt() {
        const storedData = this._storage.get();
        if (storedData?.dontShowPrompt && storedData.commit === this.productService.commit) {
            return; // Do not prompt
        }
        const checksumFailMoreInfoUrl = this.productService.checksumFailMoreInfoUrl;
        const message = localize('integrity.prompt', "Your {0} installation appears to be corrupt. Please reinstall.", this.productService.nameShort);
        if (checksumFailMoreInfoUrl) {
            this.notificationService.prompt(Severity.Warning, message, [
                {
                    label: localize('integrity.moreInformation', "More Information"),
                    run: () => this.openerService.open(URI.parse(checksumFailMoreInfoUrl))
                },
                {
                    label: localize('integrity.dontShowAgain', "Don't Show Again"),
                    isSecondary: true,
                    run: () => this._storage.set({ dontShowPrompt: true, commit: this.productService.commit })
                }
            ], { sticky: true });
        }
        else {
            this.notificationService.notify({
                severity: Severity.Warning,
                message,
                sticky: true
            });
        }
    }
    isPure() {
        return this._isPurePromise;
    }
    async _isPure() {
        const expectedChecksums = this.productService.checksums || {};
        await this.lifecycleService.when(4 /* LifecyclePhase.Eventually */);
        const allResults = await Promise.all(Object.keys(expectedChecksums).map(filename => this._resolve(filename, expectedChecksums[filename])));
        let isPure = true;
        for (let i = 0, len = allResults.length; i < len; i++) {
            if (!allResults[i].isPure) {
                isPure = false;
                break;
            }
        }
        return {
            isPure: isPure,
            proof: allResults
        };
    }
    async _resolve(filename, expected) {
        const fileUri = FileAccess.asFileUri(filename);
        try {
            const checksum = await this.checksumService.checksum(fileUri);
            return IntegrityService._createChecksumPair(fileUri, checksum, expected);
        }
        catch (error) {
            return IntegrityService._createChecksumPair(fileUri, '', expected);
        }
    }
    static _createChecksumPair(uri, actual, expected) {
        return {
            uri: uri,
            actual: actual,
            expected: expected,
            isPure: (actual === expected)
        };
    }
};
IntegrityService = __decorate([
    __param(0, INotificationService),
    __param(1, IStorageService),
    __param(2, ILifecycleService),
    __param(3, IOpenerService),
    __param(4, IProductService),
    __param(5, IChecksumService)
], IntegrityService);
export { IntegrityService };
registerSingleton(IIntegrityService, IntegrityService, 1 /* InstantiationType.Delayed */);
