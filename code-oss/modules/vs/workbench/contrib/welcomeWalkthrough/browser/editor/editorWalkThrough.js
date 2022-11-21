/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough';
import { localize } from 'vs/nls';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WalkThroughInput } from 'vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput';
import { FileAccess, Schemas } from 'vs/base/common/network';
import { Action2 } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
const typeId = 'workbench.editors.walkThroughInput';
const inputOptions = {
    typeId,
    name: localize('editorWalkThrough.title', "Editor Playground"),
    resource: FileAccess.asBrowserUri('vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.md')
        .with({
        scheme: Schemas.walkThrough,
        query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough' })
    }),
    telemetryFrom: 'walkThrough'
};
export class EditorWalkThroughAction extends Action2 {
    static ID = 'workbench.action.showInteractivePlayground';
    static LABEL = { value: localize('editorWalkThrough', "Interactive Editor Playground"), original: 'Interactive Editor Playground' };
    constructor() {
        super({
            id: EditorWalkThroughAction.ID,
            title: EditorWalkThroughAction.LABEL,
            category: Categories.Help,
            f1: true
        });
    }
    run(serviceAccessor) {
        const editorService = serviceAccessor.get(IEditorService);
        const instantiationService = serviceAccessor.get(IInstantiationService);
        const input = instantiationService.createInstance(WalkThroughInput, inputOptions);
        // TODO @lramos15 adopt the resolver here
        return editorService.openEditor(input, { pinned: true })
            .then(() => void (0));
    }
}
export class EditorWalkThroughInputSerializer {
    static ID = typeId;
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        return '';
    }
    deserialize(instantiationService) {
        return instantiationService.createInstance(WalkThroughInput, inputOptions);
    }
}
