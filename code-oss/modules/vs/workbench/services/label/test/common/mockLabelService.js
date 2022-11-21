/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { basename, normalize } from 'vs/base/common/path';
export class MockLabelService {
    _serviceBrand;
    registerCachedFormatter(formatter) {
        throw new Error('Method not implemented.');
    }
    getUriLabel(resource, options) {
        return normalize(resource.fsPath);
    }
    getUriBasenameLabel(resource) {
        return basename(resource.fsPath);
    }
    getWorkspaceLabel(workspace, options) {
        return '';
    }
    getHostLabel(scheme, authority) {
        return '';
    }
    getHostTooltip() {
        return '';
    }
    getSeparator(scheme, authority) {
        return '/';
    }
    registerFormatter(formatter) {
        return Disposable.None;
    }
    onDidChangeFormatters = new Emitter().event;
}
