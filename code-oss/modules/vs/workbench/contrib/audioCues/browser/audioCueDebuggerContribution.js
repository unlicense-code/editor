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
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { autorunWithStore } from 'vs/base/common/observable';
import { IAudioCueService, AudioCue } from 'vs/platform/audioCues/browser/audioCueService';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
let AudioCueLineDebuggerContribution = class AudioCueLineDebuggerContribution extends Disposable {
    audioCueService;
    constructor(debugService, audioCueService) {
        super();
        this.audioCueService = audioCueService;
        this._register(autorunWithStore((reader, store) => {
            if (!audioCueService.isEnabled(AudioCue.onDebugBreak).read(reader)) {
                return;
            }
            const sessionDisposables = new Map();
            store.add(toDisposable(() => {
                sessionDisposables.forEach(d => d.dispose());
                sessionDisposables.clear();
            }));
            store.add(debugService.onDidNewSession((session) => sessionDisposables.set(session, this.handleSession(session))));
            store.add(debugService.onDidEndSession(session => {
                sessionDisposables.get(session)?.dispose();
                sessionDisposables.delete(session);
            }));
            debugService
                .getModel()
                .getSessions()
                .forEach((session) => sessionDisposables.set(session, this.handleSession(session)));
        }, 'subscribe to debug sessions'));
    }
    handleSession(session) {
        return session.onDidChangeState(e => {
            const stoppedDetails = session.getStoppedDetails();
            const BREAKPOINT_STOP_REASON = 'breakpoint';
            if (stoppedDetails && stoppedDetails.reason === BREAKPOINT_STOP_REASON) {
                this.audioCueService.playAudioCue(AudioCue.onDebugBreak);
            }
        });
    }
};
AudioCueLineDebuggerContribution = __decorate([
    __param(0, IDebugService),
    __param(1, IAudioCueService)
], AudioCueLineDebuggerContribution);
export { AudioCueLineDebuggerContribution };
