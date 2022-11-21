/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable, markAsSingleton } from 'vs/base/common/lifecycle';
import { RGBA8 } from 'vs/editor/common/core/rgba';
import { TokenizationRegistry } from 'vs/editor/common/languages';
export class MinimapTokensColorTracker extends Disposable {
    static _INSTANCE = null;
    static getInstance() {
        if (!this._INSTANCE) {
            this._INSTANCE = markAsSingleton(new MinimapTokensColorTracker());
        }
        return this._INSTANCE;
    }
    _colors;
    _backgroundIsLight;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    constructor() {
        super();
        this._updateColorMap();
        this._register(TokenizationRegistry.onDidChange(e => {
            if (e.changedColorMap) {
                this._updateColorMap();
            }
        }));
    }
    _updateColorMap() {
        const colorMap = TokenizationRegistry.getColorMap();
        if (!colorMap) {
            this._colors = [RGBA8.Empty];
            this._backgroundIsLight = true;
            return;
        }
        this._colors = [RGBA8.Empty];
        for (let colorId = 1; colorId < colorMap.length; colorId++) {
            const source = colorMap[colorId].rgba;
            // Use a VM friendly data-type
            this._colors[colorId] = new RGBA8(source.r, source.g, source.b, Math.round(source.a * 255));
        }
        const backgroundLuminosity = colorMap[2 /* ColorId.DefaultBackground */].getRelativeLuminance();
        this._backgroundIsLight = backgroundLuminosity >= 0.5;
        this._onDidChange.fire(undefined);
    }
    getColor(colorId) {
        if (colorId < 1 || colorId >= this._colors.length) {
            // background color (basically invisible)
            colorId = 2 /* ColorId.DefaultBackground */;
        }
        return this._colors[colorId];
    }
    backgroundIsLight() {
        return this._backgroundIsLight;
    }
}
