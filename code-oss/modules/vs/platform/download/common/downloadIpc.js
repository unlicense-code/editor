/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
export class DownloadServiceChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    listen(_, event, arg) {
        throw new Error('Invalid listen');
    }
    call(context, command, args) {
        switch (command) {
            case 'download': return this.service.download(URI.revive(args[0]), URI.revive(args[1]));
        }
        throw new Error('Invalid call');
    }
}
export class DownloadServiceChannelClient {
    channel;
    getUriTransformer;
    constructor(channel, getUriTransformer) {
        this.channel = channel;
        this.getUriTransformer = getUriTransformer;
    }
    async download(from, to) {
        const uriTransfomer = this.getUriTransformer();
        if (uriTransfomer) {
            from = uriTransfomer.transformOutgoingURI(from);
            to = uriTransfomer.transformOutgoingURI(to);
        }
        await this.channel.call('download', [from, to]);
    }
}
