/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import { fromNow } from 'vs/base/common/date';
import { Disposable } from 'vs/base/common/lifecycle';
import { COMMENTS_SECTION } from 'vs/workbench/contrib/comments/common/commentsConfiguration';
export class TimestampWidget extends Disposable {
    configurationService;
    _date;
    _timestamp;
    _useRelativeTime;
    constructor(configurationService, container, timeStamp) {
        super();
        this.configurationService = configurationService;
        this._date = dom.append(container, dom.$('span.timestamp'));
        this._date.style.display = 'none';
        this._useRelativeTime = this.useRelativeTimeSetting;
        this.setTimestamp(timeStamp);
    }
    get useRelativeTimeSetting() {
        return this.configurationService.getValue(COMMENTS_SECTION).useRelativeTime;
    }
    async setTimestamp(timestamp) {
        if ((timestamp !== this._timestamp) || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
            this.updateDate(timestamp);
        }
        this._timestamp = timestamp;
        this._useRelativeTime = this.useRelativeTimeSetting;
    }
    updateDate(timestamp) {
        if (!timestamp) {
            this._date.textContent = '';
            this._date.style.display = 'none';
        }
        else if ((timestamp !== this._timestamp)
            || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
            this._date.style.display = '';
            let textContent;
            let tooltip;
            if (this.useRelativeTimeSetting) {
                textContent = this.getRelative(timestamp);
                tooltip = this.getDateString(timestamp);
            }
            else {
                textContent = this.getDateString(timestamp);
            }
            this._date.textContent = textContent;
            if (tooltip) {
                this._date.title = tooltip;
            }
        }
    }
    getRelative(date) {
        return fromNow(date, true, true);
    }
    getDateString(date) {
        return date.toLocaleString();
    }
}
