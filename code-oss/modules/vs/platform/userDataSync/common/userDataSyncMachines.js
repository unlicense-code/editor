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
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { isAndroid, isChrome, isEdge, isFirefox, isSafari, isWeb, platform, PlatformToString } from 'vs/base/common/platform';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { localize } from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IProductService } from 'vs/platform/product/common/productService';
import { getServiceMachineId } from 'vs/platform/externalServices/common/serviceMachineId';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataSyncLogService, IUserDataSyncStoreService } from 'vs/platform/userDataSync/common/userDataSync';
export const IUserDataSyncMachinesService = createDecorator('IUserDataSyncMachinesService');
const currentMachineNameKey = 'sync.currentMachineName';
const Safari = 'Safari';
const Chrome = 'Chrome';
const Edge = 'Edge';
const Firefox = 'Firefox';
const Android = 'Android';
export function isWebPlatform(platform) {
    switch (platform) {
        case Safari:
        case Chrome:
        case Edge:
        case Firefox:
        case Android:
        case PlatformToString(0 /* Platform.Web */):
            return true;
    }
    return false;
}
function getPlatformName() {
    if (isSafari) {
        return Safari;
    }
    if (isChrome) {
        return Chrome;
    }
    if (isEdge) {
        return Edge;
    }
    if (isFirefox) {
        return Firefox;
    }
    if (isAndroid) {
        return Android;
    }
    return PlatformToString(isWeb ? 0 /* Platform.Web */ : platform);
}
let UserDataSyncMachinesService = class UserDataSyncMachinesService extends Disposable {
    storageService;
    userDataSyncStoreService;
    logService;
    productService;
    static VERSION = 1;
    static RESOURCE = 'machines';
    _serviceBrand;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    currentMachineIdPromise;
    userData = null;
    constructor(environmentService, fileService, storageService, userDataSyncStoreService, logService, productService) {
        super();
        this.storageService = storageService;
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.logService = logService;
        this.productService = productService;
        this.currentMachineIdPromise = getServiceMachineId(environmentService, fileService, storageService);
    }
    async getMachines(manifest) {
        const currentMachineId = await this.currentMachineIdPromise;
        const machineData = await this.readMachinesData(manifest);
        return machineData.machines.map(machine => ({ ...machine, ...{ isCurrent: machine.id === currentMachineId } }));
    }
    async addCurrentMachine(manifest) {
        const currentMachineId = await this.currentMachineIdPromise;
        const machineData = await this.readMachinesData(manifest);
        if (!machineData.machines.some(({ id }) => id === currentMachineId)) {
            machineData.machines.push({ id: currentMachineId, name: this.computeCurrentMachineName(machineData.machines), platform: getPlatformName() });
            await this.writeMachinesData(machineData);
        }
    }
    async removeCurrentMachine(manifest) {
        const currentMachineId = await this.currentMachineIdPromise;
        const machineData = await this.readMachinesData(manifest);
        const updatedMachines = machineData.machines.filter(({ id }) => id !== currentMachineId);
        if (updatedMachines.length !== machineData.machines.length) {
            machineData.machines = updatedMachines;
            await this.writeMachinesData(machineData);
        }
    }
    async renameMachine(machineId, name, manifest) {
        const machineData = await this.readMachinesData(manifest);
        const machine = machineData.machines.find(({ id }) => id === machineId);
        if (machine) {
            machine.name = name;
            await this.writeMachinesData(machineData);
            const currentMachineId = await this.currentMachineIdPromise;
            if (machineId === currentMachineId) {
                this.storageService.store(currentMachineNameKey, name, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
    }
    async setEnablements(enablements) {
        const machineData = await this.readMachinesData();
        for (const [machineId, enabled] of enablements) {
            const machine = machineData.machines.find(machine => machine.id === machineId);
            if (machine) {
                machine.disabled = enabled ? undefined : true;
            }
        }
        await this.writeMachinesData(machineData);
    }
    computeCurrentMachineName(machines) {
        const previousName = this.storageService.get(currentMachineNameKey, -1 /* StorageScope.APPLICATION */);
        if (previousName) {
            return previousName;
        }
        const namePrefix = `${this.productService.embedderIdentifier ? `${this.productService.embedderIdentifier} - ` : ''}${getPlatformName()} (${this.productService.nameShort})`;
        const nameRegEx = new RegExp(`${escapeRegExpCharacters(namePrefix)}\\s#(\\d+)`);
        let nameIndex = 0;
        for (const machine of machines) {
            const matches = nameRegEx.exec(machine.name);
            const index = matches ? parseInt(matches[1]) : 0;
            nameIndex = index > nameIndex ? index : nameIndex;
        }
        return `${namePrefix} #${nameIndex + 1}`;
    }
    async readMachinesData(manifest) {
        this.userData = await this.readUserData(manifest);
        const machinesData = this.parse(this.userData);
        if (machinesData.version !== UserDataSyncMachinesService.VERSION) {
            throw new Error(localize('error incompatible', "Cannot read machines data as the current version is incompatible. Please update {0} and try again.", this.productService.nameLong));
        }
        return machinesData;
    }
    async writeMachinesData(machinesData) {
        const content = JSON.stringify(machinesData);
        const ref = await this.userDataSyncStoreService.writeResource(UserDataSyncMachinesService.RESOURCE, content, this.userData?.ref || null);
        this.userData = { ref, content };
        this._onDidChange.fire();
    }
    async readUserData(manifest) {
        if (this.userData) {
            const latestRef = manifest && manifest.latest ? manifest.latest[UserDataSyncMachinesService.RESOURCE] : undefined;
            // Last time synced resource and latest resource on server are same
            if (this.userData.ref === latestRef) {
                return this.userData;
            }
            // There is no resource on server and last time it was synced with no resource
            if (latestRef === undefined && this.userData.content === null) {
                return this.userData;
            }
        }
        return this.userDataSyncStoreService.readResource(UserDataSyncMachinesService.RESOURCE, this.userData);
    }
    parse(userData) {
        if (userData.content !== null) {
            try {
                return JSON.parse(userData.content);
            }
            catch (e) {
                this.logService.error(e);
            }
        }
        return {
            version: UserDataSyncMachinesService.VERSION,
            machines: []
        };
    }
};
UserDataSyncMachinesService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IFileService),
    __param(2, IStorageService),
    __param(3, IUserDataSyncStoreService),
    __param(4, IUserDataSyncLogService),
    __param(5, IProductService)
], UserDataSyncMachinesService);
export { UserDataSyncMachinesService };
