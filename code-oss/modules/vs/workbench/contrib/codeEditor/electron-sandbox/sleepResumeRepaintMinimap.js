/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { Disposable } from 'vs/base/common/lifecycle';
let SleepResumeRepaintMinimap = class SleepResumeRepaintMinimap extends Disposable {
    constructor(codeEditorService, nativeHostService) {
        super();
        this._register(nativeHostService.onDidResumeOS(() => {
            codeEditorService.listCodeEditors().forEach(editor => editor.render(true));
        }));
    }
};
SleepResumeRepaintMinimap = __decorate([
    __param(0, ICodeEditorService),
    __param(1, INativeHostService)
], SleepResumeRepaintMinimap);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(SleepResumeRepaintMinimap, 4 /* LifecyclePhase.Eventually */);
