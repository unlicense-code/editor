/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { StateService } from 'vs/platform/state/node/stateService';
export class StateMainService extends StateService {
    setItem(key, data) {
        this.fileStorage.setItem(key, data);
    }
    setItems(items) {
        this.fileStorage.setItems(items);
    }
    removeItem(key) {
        this.fileStorage.removeItem(key);
    }
    close() {
        return this.fileStorage.close();
    }
}
