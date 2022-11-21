/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { DataTransfers } from 'vs/base/browser/dnd';
import { createFileDataTransferItem, createStringDataTransferItem, UriList, VSDataTransfer } from 'vs/base/common/dataTransfer';
import { Mimes } from 'vs/base/common/mime';
import { URI } from 'vs/base/common/uri';
import { CodeDataTransfers, extractEditorsDropData } from 'vs/platform/dnd/browser/dnd';
export function toVSDataTransfer(dataTransfer) {
    const vsDataTransfer = new VSDataTransfer();
    for (const item of dataTransfer.items) {
        const type = item.type;
        if (item.kind === 'string') {
            const asStringValue = new Promise(resolve => item.getAsString(resolve));
            vsDataTransfer.append(type, createStringDataTransferItem(asStringValue));
        }
        else if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
                vsDataTransfer.append(type, createFileDataTransferItemFromFile(file));
            }
        }
    }
    return vsDataTransfer;
}
function createFileDataTransferItemFromFile(file) {
    const uri = file.path ? URI.parse(file.path) : undefined;
    return createFileDataTransferItem(file.name, uri, async () => {
        return new Uint8Array(await file.arrayBuffer());
    });
}
const INTERNAL_DND_MIME_TYPES = Object.freeze([
    CodeDataTransfers.EDITORS,
    CodeDataTransfers.FILES,
    DataTransfers.RESOURCES,
]);
export function addExternalEditorsDropData(dataTransfer, dragEvent, overwriteUriList = false) {
    if (dragEvent.dataTransfer && (overwriteUriList || !dataTransfer.has(Mimes.uriList))) {
        const editorData = extractEditorsDropData(dragEvent)
            .filter(input => input.resource)
            .map(input => input.resource.toString());
        // Also add in the files
        for (const item of dragEvent.dataTransfer?.items) {
            const file = item.getAsFile();
            if (file) {
                editorData.push(file.path ? URI.file(file.path).toString() : file.name);
            }
        }
        if (editorData.length) {
            dataTransfer.replace(Mimes.uriList, createStringDataTransferItem(UriList.create(editorData)));
        }
    }
    for (const internal of INTERNAL_DND_MIME_TYPES) {
        dataTransfer.delete(internal);
    }
}
