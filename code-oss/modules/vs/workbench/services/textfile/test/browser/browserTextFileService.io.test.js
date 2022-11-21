/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workbenchInstantiationService, TestInMemoryFileSystemProvider, TestBrowserTextFileServiceWithEncodingOverrides } from 'vs/workbench/test/browser/workbenchTestServices';
import { NullLogService } from 'vs/platform/log/common/log';
import { FileService } from 'vs/platform/files/common/fileService';
import { Schemas } from 'vs/base/common/network';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IFileService } from 'vs/platform/files/common/files';
import { URI } from 'vs/base/common/uri';
import { join } from 'vs/base/common/path';
import { detectEncodingByBOMFromBuffer, toCanonicalName } from 'vs/workbench/services/textfile/common/encoding';
import { VSBuffer } from 'vs/base/common/buffer';
import files from 'vs/workbench/services/textfile/test/browser/fixtures/files';
import createSuite from 'vs/workbench/services/textfile/test/common/textFileService.io.test';
import { isWeb } from 'vs/base/common/platform';
import { IWorkingCopyFileService, WorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { WorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService';
// optimization: we don't need to run this suite in native environment,
// because we have nativeTextFileService.io.test.ts for it,
// so our tests run faster
if (isWeb) {
    suite('Files - BrowserTextFileService i/o', function () {
        const disposables = new DisposableStore();
        let service;
        let fileProvider;
        const testDir = 'test';
        createSuite({
            setup: async () => {
                const instantiationService = workbenchInstantiationService(undefined, disposables);
                const logService = new NullLogService();
                const fileService = new FileService(logService);
                fileProvider = new TestInMemoryFileSystemProvider();
                disposables.add(fileService.registerProvider(Schemas.file, fileProvider));
                disposables.add(fileProvider);
                const collection = new ServiceCollection();
                collection.set(IFileService, fileService);
                collection.set(IWorkingCopyFileService, new WorkingCopyFileService(fileService, new WorkingCopyService(), instantiationService, new UriIdentityService(fileService)));
                service = instantiationService.createChild(collection).createInstance(TestBrowserTextFileServiceWithEncodingOverrides);
                await fileProvider.mkdir(URI.file(testDir));
                for (const fileName in files) {
                    await fileProvider.writeFile(URI.file(join(testDir, fileName)), files[fileName], { create: true, overwrite: false, unlock: false });
                }
                return { service, testDir };
            },
            teardown: async () => {
                service.files.dispose();
                disposables.clear();
            },
            exists,
            stat,
            readFile,
            detectEncodingByBOM
        });
        async function exists(fsPath) {
            try {
                await fileProvider.readFile(URI.file(fsPath));
                return true;
            }
            catch (e) {
                return false;
            }
        }
        async function readFile(fsPath, encoding) {
            const file = await fileProvider.readFile(URI.file(fsPath));
            if (!encoding) {
                return VSBuffer.wrap(file);
            }
            return new TextDecoder(toCanonicalName(encoding)).decode(file);
        }
        async function stat(fsPath) {
            return fileProvider.stat(URI.file(fsPath));
        }
        async function detectEncodingByBOM(fsPath) {
            try {
                const buffer = await readFile(fsPath);
                return detectEncodingByBOMFromBuffer(buffer.slice(0, 3), 3);
            }
            catch (error) {
                return null; // ignore errors (like file not found)
            }
        }
    });
}
