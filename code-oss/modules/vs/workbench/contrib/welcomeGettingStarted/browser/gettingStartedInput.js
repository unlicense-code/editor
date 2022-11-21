/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./media/gettingStarted';
import { localize } from 'vs/nls';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { URI } from 'vs/base/common/uri';
import { Schemas } from 'vs/base/common/network';
export const gettingStartedInputTypeId = 'workbench.editors.gettingStartedInput';
export class GettingStartedInput extends EditorInput {
    static ID = gettingStartedInputTypeId;
    static RESOURCE = URI.from({ scheme: Schemas.walkThrough, authority: 'vscode_getting_started_page' });
    get typeId() {
        return GettingStartedInput.ID;
    }
    get resource() {
        return GettingStartedInput.RESOURCE;
    }
    matches(other) {
        if (super.matches(other)) {
            return true;
        }
        if (other instanceof GettingStartedInput) {
            return other.selectedCategory === this.selectedCategory;
        }
        return false;
    }
    constructor(options) {
        super();
        this.selectedCategory = options.selectedCategory;
        this.selectedStep = options.selectedStep;
        this.showTelemetryNotice = !!options.showTelemetryNotice;
    }
    getName() {
        return localize('getStarted', "Get Started");
    }
    selectedCategory;
    selectedStep;
    showTelemetryNotice;
}
