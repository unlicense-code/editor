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
import { localize } from 'vs/nls';
import { raceCancellation } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { insert } from 'vs/base/common/arrays';
let TextFileSaveParticipant = class TextFileSaveParticipant extends Disposable {
    progressService;
    logService;
    saveParticipants = [];
    constructor(progressService, logService) {
        super();
        this.progressService = progressService;
        this.logService = logService;
    }
    addSaveParticipant(participant) {
        const remove = insert(this.saveParticipants, participant);
        return toDisposable(() => remove());
    }
    participate(model, context, token) {
        const cts = new CancellationTokenSource(token);
        return this.progressService.withProgress({
            title: localize('saveParticipants', "Saving '{0}'", model.name),
            location: 15 /* ProgressLocation.Notification */,
            cancellable: true,
            delay: model.isDirty() ? 3000 : 5000
        }, async (progress) => {
            // undoStop before participation
            model.textEditorModel?.pushStackElement();
            for (const saveParticipant of this.saveParticipants) {
                if (cts.token.isCancellationRequested || !model.textEditorModel /* disposed */) {
                    break;
                }
                try {
                    const promise = saveParticipant.participate(model, context, progress, cts.token);
                    await raceCancellation(promise, cts.token);
                }
                catch (err) {
                    this.logService.warn(err);
                }
            }
            // undoStop after participation
            model.textEditorModel?.pushStackElement();
        }, () => {
            // user cancel
            cts.dispose(true);
        });
    }
    dispose() {
        this.saveParticipants.splice(0, this.saveParticipants.length);
    }
};
TextFileSaveParticipant = __decorate([
    __param(0, IProgressService),
    __param(1, ILogService)
], TextFileSaveParticipant);
export { TextFileSaveParticipant };
