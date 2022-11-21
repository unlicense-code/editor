/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { net } from 'electron';
import { RequestService as NodeRequestService } from 'vs/platform/request/node/requestService';
function getRawRequest(options) {
    return net.request;
}
export class RequestMainService extends NodeRequestService {
    request(options, token) {
        return super.request({ ...(options || {}), getRawRequest }, token);
    }
}
