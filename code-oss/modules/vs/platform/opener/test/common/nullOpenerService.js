/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
export const NullOpenerService = Object.freeze({
    _serviceBrand: undefined,
    registerOpener() { return Disposable.None; },
    registerValidator() { return Disposable.None; },
    registerExternalUriResolver() { return Disposable.None; },
    setDefaultExternalOpener() { },
    registerExternalOpener() { return Disposable.None; },
    async open() { return false; },
    async resolveExternalUri(uri) { return { resolved: uri, dispose() { } }; },
});
