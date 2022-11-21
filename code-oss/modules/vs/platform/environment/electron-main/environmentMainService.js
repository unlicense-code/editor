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
import { memoize } from 'vs/base/common/decorators';
import { join } from 'vs/base/common/path';
import { createStaticIPCHandle } from 'vs/base/parts/ipc/node/ipc.net';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { NativeEnvironmentService } from 'vs/platform/environment/node/environmentService';
import { refineServiceDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IEnvironmentMainService = refineServiceDecorator(IEnvironmentService);
export class EnvironmentMainService extends NativeEnvironmentService {
    get cachedLanguagesPath() { return join(this.userDataPath, 'clp'); }
    get backupHome() { return join(this.userDataPath, 'Backups'); }
    get mainIPCHandle() { return createStaticIPCHandle(this.userDataPath, 'main', this.productService.version); }
    get mainLockfile() { return join(this.userDataPath, 'code.lock'); }
    get disableUpdates() { return !!this.args['disable-updates']; }
    get disableKeytar() { return !!this.args['disable-keytar']; }
    get crossOriginIsolated() { return !!this.args['enable-coi']; }
    get codeCachePath() { return process.env['VSCODE_CODE_CACHE_PATH'] || undefined; }
    get useCodeCache() { return !!this.codeCachePath; }
}
__decorate([
    memoize
], EnvironmentMainService.prototype, "cachedLanguagesPath", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "backupHome", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "mainIPCHandle", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "mainLockfile", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "disableUpdates", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "disableKeytar", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "crossOriginIsolated", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "codeCachePath", null);
__decorate([
    memoize
], EnvironmentMainService.prototype, "useCodeCache", null);
