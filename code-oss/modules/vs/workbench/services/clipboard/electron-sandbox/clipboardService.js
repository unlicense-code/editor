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
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { URI } from 'vs/base/common/uri';
import { isMacintosh } from 'vs/base/common/platform';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { VSBuffer } from 'vs/base/common/buffer';
let NativeClipboardService = class NativeClipboardService {
    nativeHostService;
    static FILE_FORMAT = 'code/file-list'; // Clipboard format for files
    constructor(nativeHostService) {
        this.nativeHostService = nativeHostService;
    }
    async writeText(text, type) {
        return this.nativeHostService.writeClipboardText(text, type);
    }
    async readText(type) {
        return this.nativeHostService.readClipboardText(type);
    }
    async readFindText() {
        if (isMacintosh) {
            return this.nativeHostService.readClipboardFindText();
        }
        return '';
    }
    async writeFindText(text) {
        if (isMacintosh) {
            return this.nativeHostService.writeClipboardFindText(text);
        }
    }
    async writeResources(resources) {
        if (resources.length) {
            return this.nativeHostService.writeClipboardBuffer(NativeClipboardService.FILE_FORMAT, this.resourcesToBuffer(resources));
        }
    }
    async readResources() {
        return this.bufferToResources(await this.nativeHostService.readClipboardBuffer(NativeClipboardService.FILE_FORMAT));
    }
    async hasResources() {
        return this.nativeHostService.hasClipboard(NativeClipboardService.FILE_FORMAT);
    }
    resourcesToBuffer(resources) {
        return VSBuffer.fromString(resources.map(r => r.toString()).join('\n'));
    }
    bufferToResources(buffer) {
        if (!buffer) {
            return [];
        }
        const bufferValue = buffer.toString();
        if (!bufferValue) {
            return [];
        }
        try {
            return bufferValue.split('\n').map(f => URI.parse(f));
        }
        catch (error) {
            return []; // do not trust clipboard data
        }
    }
};
NativeClipboardService = __decorate([
    __param(0, INativeHostService)
], NativeClipboardService);
export { NativeClipboardService };
registerSingleton(IClipboardService, NativeClipboardService, 1 /* InstantiationType.Delayed */);
