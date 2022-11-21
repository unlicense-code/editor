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
import { webContents } from 'electron';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { WebviewProtocolProvider } from 'vs/platform/webview/electron-main/webviewProtocolProvider';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
let WebviewMainService = class WebviewMainService extends Disposable {
    windowsMainService;
    _onFoundInFrame = this._register(new Emitter());
    onFoundInFrame = this._onFoundInFrame.event;
    constructor(windowsMainService) {
        super();
        this.windowsMainService = windowsMainService;
        this._register(new WebviewProtocolProvider());
    }
    async setIgnoreMenuShortcuts(id, enabled) {
        let contents;
        if (typeof id.windowId === 'number') {
            const { windowId } = id;
            const window = this.windowsMainService.getWindowById(windowId);
            if (!window?.win) {
                throw new Error(`Invalid windowId: ${windowId}`);
            }
            contents = window.win.webContents;
        }
        else {
            const { webContentsId } = id;
            contents = webContents.fromId(webContentsId);
            if (!contents) {
                throw new Error(`Invalid webContentsId: ${webContentsId}`);
            }
        }
        if (!contents.isDestroyed()) {
            contents.setIgnoreMenuShortcuts(enabled);
        }
    }
    async findInFrame(windowId, frameName, text, options) {
        const initialFrame = this.getFrameByName(windowId, frameName);
        const frame = initialFrame;
        if (typeof frame.findInFrame === 'function') {
            frame.findInFrame(text, {
                findNext: options.findNext,
                forward: options.forward,
            });
            const foundInFrameHandler = (_, result) => {
                if (result.finalUpdate) {
                    this._onFoundInFrame.fire(result);
                    frame.removeListener('found-in-frame', foundInFrameHandler);
                }
            };
            frame.on('found-in-frame', foundInFrameHandler);
        }
    }
    async stopFindInFrame(windowId, frameName, options) {
        const initialFrame = this.getFrameByName(windowId, frameName);
        const frame = initialFrame;
        if (typeof frame.stopFindInFrame === 'function') {
            frame.stopFindInFrame(options.keepSelection ? 'keepSelection' : 'clearSelection');
        }
    }
    getFrameByName(windowId, frameName) {
        const window = this.windowsMainService.getWindowById(windowId.windowId);
        if (!window?.win) {
            throw new Error(`Invalid windowId: ${windowId}`);
        }
        const frame = window.win.webContents.mainFrame.framesInSubtree.find(frame => {
            return frame.name === frameName;
        });
        if (!frame) {
            throw new Error(`Unknown frame: ${frameName}`);
        }
        return frame;
    }
};
WebviewMainService = __decorate([
    __param(0, IWindowsMainService)
], WebviewMainService);
export { WebviewMainService };
