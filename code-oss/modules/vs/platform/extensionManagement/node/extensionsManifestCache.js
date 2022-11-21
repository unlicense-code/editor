/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { join } from 'vs/base/common/path';
import * as pfs from 'vs/base/node/pfs';
import { MANIFEST_CACHE_FOLDER, USER_MANIFEST_CACHE_FILE } from 'vs/platform/extensions/common/extensions';
export class ExtensionsManifestCache extends Disposable {
    environmentService;
    extensionsManifestCache = join(this.environmentService.userDataPath, MANIFEST_CACHE_FOLDER, USER_MANIFEST_CACHE_FILE);
    constructor(environmentService, extensionsManagementService) {
        super();
        this.environmentService = environmentService;
        this._register(extensionsManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
        this._register(extensionsManagementService.onDidUninstallExtension(e => this.onDidUnInstallExtension(e)));
    }
    onDidInstallExtensions(results) {
        if (results.some(r => !!r.local)) {
            this.invalidate();
        }
    }
    onDidUnInstallExtension(e) {
        if (!e.error) {
            this.invalidate();
        }
    }
    invalidate() {
        pfs.Promises.rm(this.extensionsManifestCache, pfs.RimRafMode.MOVE).then(() => { }, () => { });
    }
}
