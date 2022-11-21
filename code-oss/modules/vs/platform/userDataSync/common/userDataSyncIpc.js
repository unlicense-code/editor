/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
export class UserDataAutoSyncChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        switch (event) {
            case 'onError': return this.service.onError;
        }
        throw new Error(`Event not found: ${event}`);
    }
    call(context, command, args) {
        switch (command) {
            case 'triggerSync': return this.service.triggerSync(args[0], args[1], args[2]);
            case 'turnOn': return this.service.turnOn();
            case 'turnOff': return this.service.turnOff(args[0]);
        }
        throw new Error('Invalid call');
    }
}
export class UserDataSycnUtilServiceChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        throw new Error(`Event not found: ${event}`);
    }
    call(context, command, args) {
        switch (command) {
            case 'resolveDefaultIgnoredSettings': return this.service.resolveDefaultIgnoredSettings();
            case 'resolveUserKeybindings': return this.service.resolveUserBindings(args[0]);
            case 'resolveFormattingOptions': return this.service.resolveFormattingOptions(URI.revive(args[0]));
        }
        throw new Error('Invalid call');
    }
}
export class UserDataSyncUtilServiceClient {
    channel;
    constructor(channel) {
        this.channel = channel;
    }
    async resolveDefaultIgnoredSettings() {
        return this.channel.call('resolveDefaultIgnoredSettings');
    }
    async resolveUserBindings(userbindings) {
        return this.channel.call('resolveUserKeybindings', [userbindings]);
    }
    async resolveFormattingOptions(file) {
        return this.channel.call('resolveFormattingOptions', [file]);
    }
}
export class UserDataSyncMachinesServiceChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        switch (event) {
            case 'onDidChange': return this.service.onDidChange;
        }
        throw new Error(`Event not found: ${event}`);
    }
    async call(context, command, args) {
        switch (command) {
            case 'getMachines': return this.service.getMachines();
            case 'addCurrentMachine': return this.service.addCurrentMachine();
            case 'removeCurrentMachine': return this.service.removeCurrentMachine();
            case 'renameMachine': return this.service.renameMachine(args[0], args[1]);
            case 'setEnablements': return this.service.setEnablements(args);
        }
        throw new Error('Invalid call');
    }
}
export class UserDataSyncAccountServiceChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        switch (event) {
            case 'onDidChangeAccount': return this.service.onDidChangeAccount;
            case 'onTokenFailed': return this.service.onTokenFailed;
        }
        throw new Error(`Event not found: ${event}`);
    }
    call(context, command, args) {
        switch (command) {
            case '_getInitialData': return Promise.resolve(this.service.account);
            case 'updateAccount': return this.service.updateAccount(args);
        }
        throw new Error('Invalid call');
    }
}
export class UserDataSyncStoreManagementServiceChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        switch (event) {
            case 'onDidChangeUserDataSyncStore': return this.service.onDidChangeUserDataSyncStore;
        }
        throw new Error(`Event not found: ${event}`);
    }
    call(context, command, args) {
        switch (command) {
            case 'switch': return this.service.switch(args[0]);
            case 'getPreviousUserDataSyncStore': return this.service.getPreviousUserDataSyncStore();
        }
        throw new Error('Invalid call');
    }
}
export class UserDataSyncStoreManagementServiceChannelClient extends Disposable {
    channel;
    onDidChangeUserDataSyncStore;
    constructor(channel) {
        super();
        this.channel = channel;
        this.onDidChangeUserDataSyncStore = this.channel.listen('onDidChangeUserDataSyncStore');
    }
    async switch(type) {
        return this.channel.call('switch', [type]);
    }
    async getPreviousUserDataSyncStore() {
        const userDataSyncStore = await this.channel.call('getPreviousUserDataSyncStore');
        return this.revive(userDataSyncStore);
    }
    revive(userDataSyncStore) {
        return {
            url: URI.revive(userDataSyncStore.url),
            type: userDataSyncStore.type,
            defaultUrl: URI.revive(userDataSyncStore.defaultUrl),
            insidersUrl: URI.revive(userDataSyncStore.insidersUrl),
            stableUrl: URI.revive(userDataSyncStore.stableUrl),
            canSwitch: userDataSyncStore.canSwitch,
            authenticationProviders: userDataSyncStore.authenticationProviders,
        };
    }
}
