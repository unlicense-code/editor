/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { clearNode, createCSSRule, createStyleSheet } from 'vs/base/browser/dom';
import { RunOnceScheduler } from 'vs/base/common/async';
export var ZIndex;
(function (ZIndex) {
    ZIndex[ZIndex["Base"] = 0] = "Base";
    ZIndex[ZIndex["Sash"] = 35] = "Sash";
    ZIndex[ZIndex["SuggestWidget"] = 40] = "SuggestWidget";
    ZIndex[ZIndex["Hover"] = 50] = "Hover";
    ZIndex[ZIndex["DragImage"] = 1000] = "DragImage";
    ZIndex[ZIndex["MenubarMenuItemsHolder"] = 2000] = "MenubarMenuItemsHolder";
    ZIndex[ZIndex["ContextView"] = 2500] = "ContextView";
    ZIndex[ZIndex["ModalDialog"] = 2600] = "ModalDialog";
    ZIndex[ZIndex["PaneDropOverlay"] = 10000] = "PaneDropOverlay";
})(ZIndex || (ZIndex = {}));
const ZIndexValues = Object.keys(ZIndex).filter(key => !isNaN(Number(key))).map(key => Number(key)).sort((a, b) => b - a);
function findBase(z) {
    for (const zi of ZIndexValues) {
        if (z >= zi) {
            return zi;
        }
    }
    return -1;
}
class ZIndexRegistry {
    styleSheet;
    zIndexMap;
    scheduler;
    constructor() {
        this.styleSheet = createStyleSheet();
        this.zIndexMap = new Map();
        this.scheduler = new RunOnceScheduler(() => this.updateStyleElement(), 200);
    }
    registerZIndex(relativeLayer, z, name) {
        if (this.zIndexMap.get(name)) {
            throw new Error(`z-index with name ${name} has already been registered.`);
        }
        const proposedZValue = relativeLayer + z;
        if (findBase(proposedZValue) !== relativeLayer) {
            throw new Error(`Relative layer: ${relativeLayer} + z-index: ${z} exceeds next layer ${proposedZValue}.`);
        }
        this.zIndexMap.set(name, proposedZValue);
        this.scheduler.schedule();
        return this.getVarName(name);
    }
    getVarName(name) {
        return `--z-index-${name}`;
    }
    updateStyleElement() {
        clearNode(this.styleSheet);
        let ruleBuilder = '';
        this.zIndexMap.forEach((zIndex, name) => {
            ruleBuilder += `${this.getVarName(name)}: ${zIndex};\n`;
        });
        createCSSRule(':root', ruleBuilder, this.styleSheet);
    }
}
const zIndexRegistry = new ZIndexRegistry();
export function registerZIndex(relativeLayer, z, name) {
    return zIndexRegistry.registerZIndex(relativeLayer, z, name);
}
