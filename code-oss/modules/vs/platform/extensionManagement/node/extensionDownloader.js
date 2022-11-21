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
import { Promises } from 'vs/base/common/async';
import { getErrorMessage } from 'vs/base/common/errors';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { isWindows } from 'vs/base/common/platform';
import { joinPath } from 'vs/base/common/resources';
import * as semver from 'vs/base/common/semver/semver';
import { generateUuid } from 'vs/base/common/uuid';
import { Promises as FSPromises } from 'vs/base/node/pfs';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { ExtensionManagementError, ExtensionManagementErrorCode, IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionKey, groupByExtension } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IExtensionSignatureVerificationService } from 'vs/platform/extensionManagement/node/extensionSignatureVerificationService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
let ExtensionsDownloader = class ExtensionsDownloader extends Disposable {
    fileService;
    extensionGalleryService;
    configurationService;
    extensionSignatureVerificationService;
    logService;
    static SignatureArchiveExtension = '.sigzip';
    extensionsDownloadDir;
    cache;
    cleanUpPromise;
    constructor(environmentService, fileService, extensionGalleryService, configurationService, extensionSignatureVerificationService, logService) {
        super();
        this.fileService = fileService;
        this.extensionGalleryService = extensionGalleryService;
        this.configurationService = configurationService;
        this.extensionSignatureVerificationService = extensionSignatureVerificationService;
        this.logService = logService;
        this.extensionsDownloadDir = environmentService.extensionsDownloadLocation;
        this.cache = 20; // Cache 20 downloaded VSIX files
        this.cleanUpPromise = this.cleanUp();
    }
    async download(extension, operation) {
        await this.cleanUpPromise;
        const location = joinPath(this.extensionsDownloadDir, this.getName(extension));
        try {
            await this.downloadFile(extension, location, location => this.extensionGalleryService.download(extension, location, operation));
        }
        catch (error) {
            throw new ExtensionManagementError(error.message, ExtensionManagementErrorCode.Download);
        }
        let verified = false;
        if (extension.isSigned && this.configurationService.getValue('extensions.verifySignature') === true) {
            const signatureArchiveLocation = await this.downloadSignatureArchive(extension);
            try {
                verified = await this.extensionSignatureVerificationService.verify(location.fsPath, signatureArchiveLocation.fsPath);
                this.logService.info(`Verified extension: ${extension.identifier.id}`, verified);
            }
            catch (error) {
                await this.delete(signatureArchiveLocation);
                await this.delete(location);
                throw new ExtensionManagementError(error.code, ExtensionManagementErrorCode.Signature);
            }
        }
        return { location, verified };
    }
    async downloadSignatureArchive(extension) {
        await this.cleanUpPromise;
        const location = joinPath(this.extensionsDownloadDir, `${this.getName(extension)}${ExtensionsDownloader.SignatureArchiveExtension}`);
        await this.downloadFile(extension, location, location => this.extensionGalleryService.downloadSignatureArchive(extension, location));
        return location;
    }
    async downloadFile(extension, location, downloadFn) {
        // Do not download if exists
        if (await this.fileService.exists(location)) {
            return;
        }
        // Download directly if locaiton is not file scheme
        if (location.scheme !== Schemas.file) {
            await downloadFn(location);
            return;
        }
        // Download to temporary location first only if file does not exist
        const tempLocation = joinPath(this.extensionsDownloadDir, `.${generateUuid()}`);
        if (!await this.fileService.exists(tempLocation)) {
            await downloadFn(tempLocation);
        }
        try {
            // Rename temp location to original
            await this.rename(tempLocation, location, Date.now() + (2 * 60 * 1000) /* Retry for 2 minutes */);
        }
        catch (error) {
            try {
                await this.fileService.del(tempLocation);
            }
            catch (e) { /* ignore */ }
            if (error.code === 'ENOTEMPTY') {
                this.logService.info(`Rename failed because the file was downloaded by another source. So ignoring renaming.`, extension.identifier.id, location.path);
            }
            else {
                this.logService.info(`Rename failed because of ${getErrorMessage(error)}. Deleted the file from downloaded location`, tempLocation.path);
                throw error;
            }
        }
    }
    async delete(location) {
        await this.cleanUpPromise;
        await this.fileService.del(location);
    }
    async rename(from, to, retryUntil) {
        try {
            await FSPromises.rename(from.fsPath, to.fsPath);
        }
        catch (error) {
            if (isWindows && error && error.code === 'EPERM' && Date.now() < retryUntil) {
                this.logService.info(`Failed renaming ${from} to ${to} with 'EPERM' error. Trying again...`);
                return this.rename(from, to, retryUntil);
            }
            throw error;
        }
    }
    async cleanUp() {
        try {
            if (!(await this.fileService.exists(this.extensionsDownloadDir))) {
                this.logService.trace('Extension VSIX downloads cache dir does not exist');
                return;
            }
            const folderStat = await this.fileService.resolve(this.extensionsDownloadDir, { resolveMetadata: true });
            if (folderStat.children) {
                const toDelete = [];
                const vsixs = [];
                const signatureArchives = [];
                for (const stat of folderStat.children) {
                    if (stat.name.endsWith(ExtensionsDownloader.SignatureArchiveExtension)) {
                        signatureArchives.push(stat.resource);
                    }
                    else {
                        const extension = ExtensionKey.parse(stat.name);
                        if (extension) {
                            vsixs.push([extension, stat]);
                        }
                    }
                }
                const byExtension = groupByExtension(vsixs, ([extension]) => extension);
                const distinct = [];
                for (const p of byExtension) {
                    p.sort((a, b) => semver.rcompare(a[0].version, b[0].version));
                    toDelete.push(...p.slice(1).map(e => e[1].resource)); // Delete outdated extensions
                    distinct.push(p[0][1]);
                }
                distinct.sort((a, b) => a.mtime - b.mtime); // sort by modified time
                toDelete.push(...distinct.slice(0, Math.max(0, distinct.length - this.cache)).map(s => s.resource)); // Retain minimum cacheSize and delete the rest
                toDelete.push(...signatureArchives); // Delete all signature archives
                await Promises.settled(toDelete.map(resource => {
                    this.logService.trace('Deleting from cache', resource.path);
                    return this.fileService.del(resource);
                }));
            }
        }
        catch (e) {
            this.logService.error(e);
        }
    }
    getName(extension) {
        return this.cache ? ExtensionKey.create(extension).toString().toLowerCase() : generateUuid();
    }
};
ExtensionsDownloader = __decorate([
    __param(0, INativeEnvironmentService),
    __param(1, IFileService),
    __param(2, IExtensionGalleryService),
    __param(3, IConfigurationService),
    __param(4, IExtensionSignatureVerificationService),
    __param(5, ILogService)
], ExtensionsDownloader);
export { ExtensionsDownloader };
