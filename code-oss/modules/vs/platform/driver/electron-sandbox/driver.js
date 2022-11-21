/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { BrowserWindowDriver } from 'vs/platform/driver/browser/driver';
class NativeWindowDriver extends BrowserWindowDriver {
    helper;
    constructor(helper) {
        super();
        this.helper = helper;
    }
    exitApplication() {
        return this.helper.exitApplication();
    }
}
export function registerWindowDriver(helper) {
    Object.assign(window, { driver: new NativeWindowDriver(helper) });
}
