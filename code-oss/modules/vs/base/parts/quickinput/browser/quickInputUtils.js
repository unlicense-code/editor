/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import { IdGenerator } from 'vs/base/common/idGenerator';
import 'vs/css!./media/quickInput';
const iconPathToClass = {};
const iconClassGenerator = new IdGenerator('quick-input-button-icon-');
export function getIconClass(iconPath) {
    if (!iconPath) {
        return undefined;
    }
    let iconClass;
    const key = iconPath.dark.toString();
    if (iconPathToClass[key]) {
        iconClass = iconPathToClass[key];
    }
    else {
        iconClass = iconClassGenerator.nextId();
        dom.createCSSRule(`.${iconClass}, .hc-light .${iconClass}`, `background-image: ${dom.asCSSUrl(iconPath.light || iconPath.dark)}`);
        dom.createCSSRule(`.vs-dark .${iconClass}, .hc-black .${iconClass}`, `background-image: ${dom.asCSSUrl(iconPath.dark)}`);
        iconPathToClass[key] = iconClass;
    }
    return iconClass;
}
