/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IActivityService = createDecorator('activityService');
class BaseBadge {
    descriptorFn;
    constructor(descriptorFn) {
        this.descriptorFn = descriptorFn;
        this.descriptorFn = descriptorFn;
    }
    getDescription() {
        return this.descriptorFn(null);
    }
}
export class NumberBadge extends BaseBadge {
    number;
    constructor(number, descriptorFn) {
        super(descriptorFn);
        this.number = number;
        this.number = number;
    }
    getDescription() {
        return this.descriptorFn(this.number);
    }
}
export class TextBadge extends BaseBadge {
    text;
    constructor(text, descriptorFn) {
        super(descriptorFn);
        this.text = text;
    }
}
export class IconBadge extends BaseBadge {
    icon;
    constructor(icon, descriptorFn) {
        super(descriptorFn);
        this.icon = icon;
    }
}
export class ProgressBadge extends BaseBadge {
}
