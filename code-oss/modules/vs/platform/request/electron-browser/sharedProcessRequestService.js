/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { RequestService } from 'vs/platform/request/browser/requestService';
import { RequestChannelClient } from 'vs/platform/request/common/requestIpc';
export class SharedProcessRequestService {
    configurationService;
    logService;
    browserRequestService;
    mainRequestService;
    constructor(mainProcessService, configurationService, logService) {
        this.configurationService = configurationService;
        this.logService = logService;
        this.browserRequestService = new RequestService(configurationService, logService);
        this.mainRequestService = new RequestChannelClient(mainProcessService.getChannel('request'));
    }
    request(options, token) {
        return this.getRequestService().request(options, token);
    }
    async resolveProxy(url) {
        return this.getRequestService().resolveProxy(url);
    }
    getRequestService() {
        if (this.configurationService.getValue('developer.sharedProcess.redirectRequestsToMain') === true) {
            this.logService.trace('Using main request service');
            return this.mainRequestService;
        }
        this.logService.trace('Using browser request service');
        return this.browserRequestService;
    }
}
