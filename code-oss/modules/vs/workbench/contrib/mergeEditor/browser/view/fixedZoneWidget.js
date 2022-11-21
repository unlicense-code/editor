/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { h } from 'vs/base/browser/dom';
import { Disposable } from 'vs/base/common/lifecycle';
export class FixedZoneWidget extends Disposable {
    editor;
    static counter = 0;
    overlayWidgetId = `fixedZoneWidget-${FixedZoneWidget.counter++}`;
    viewZoneId;
    widgetDomNode = h('div.fixed-zone-widget').root;
    overlayWidget = {
        getId: () => this.overlayWidgetId,
        getDomNode: () => this.widgetDomNode,
        getPosition: () => null
    };
    constructor(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp) {
        super();
        this.editor = editor;
        this.viewZoneId = viewZoneAccessor.addZone({
            domNode: document.createElement('div'),
            afterLineNumber: afterLineNumber,
            heightInPx: height,
            onComputedHeight: (height) => {
                this.widgetDomNode.style.height = `${height}px`;
            },
            onDomNodeTop: (top) => {
                this.widgetDomNode.style.top = `${top}px`;
            }
        });
        viewZoneIdsToCleanUp.push(this.viewZoneId);
        this.widgetDomNode.style.left = this.editor.getLayoutInfo().contentLeft + 'px';
        this.editor.addOverlayWidget(this.overlayWidget);
        this._register({
            dispose: () => {
                this.editor.removeOverlayWidget(this.overlayWidget);
            },
        });
    }
}
