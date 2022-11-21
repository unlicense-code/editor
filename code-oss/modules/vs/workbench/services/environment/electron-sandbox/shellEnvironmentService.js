/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { process } from 'vs/base/parts/sandbox/electron-sandbox/globals';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
export const IShellEnvironmentService = createDecorator('shellEnvironmentService');
export class ShellEnvironmentService {
    getShellEnv() {
        return process.shellEnv();
    }
}
registerSingleton(IShellEnvironmentService, ShellEnvironmentService, 1 /* InstantiationType.Delayed */);
