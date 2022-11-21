/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService';
import { DebugModel } from 'vs/workbench/contrib/debug/common/debugModel';
import { MockDebugStorage } from 'vs/workbench/contrib/debug/test/common/mockDebug';
import { TestFileService } from 'vs/workbench/test/browser/workbenchTestServices';
const fileService = new TestFileService();
export const mockUriIdentityService = new UriIdentityService(fileService);
export function createMockDebugModel() {
    return new DebugModel(new MockDebugStorage(), { isDirty: (e) => false }, mockUriIdentityService);
}
