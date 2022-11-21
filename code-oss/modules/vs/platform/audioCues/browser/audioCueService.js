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
import { raceTimeout } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { FileAccess } from 'vs/base/common/network';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { localize } from 'vs/nls';
import { observableFromEvent, derived } from 'vs/base/common/observable';
export const IAudioCueService = createDecorator('audioCue');
let AudioCueService = class AudioCueService extends Disposable {
    configurationService;
    accessibilityService;
    _serviceBrand;
    screenReaderAttached = observableFromEvent(this.accessibilityService.onDidChangeScreenReaderOptimized, () => /** @description accessibilityService.onDidChangeScreenReaderOptimized */ this.accessibilityService.isScreenReaderOptimized());
    constructor(configurationService, accessibilityService) {
        super();
        this.configurationService = configurationService;
        this.accessibilityService = accessibilityService;
    }
    async playAudioCue(cue, allowManyInParallel = false) {
        if (this.isEnabled(cue).get()) {
            await this.playSound(cue.sound, allowManyInParallel);
        }
    }
    async playAudioCues(cues) {
        // Some audio cues might reuse sounds. Don't play the same sound twice.
        const sounds = new Set(cues.filter(cue => this.isEnabled(cue).get()).map(cue => cue.sound));
        await Promise.all(Array.from(sounds).map(sound => this.playSound(sound)));
    }
    getVolumeInPercent() {
        const volume = this.configurationService.getValue('audioCues.volume');
        if (typeof volume !== 'number') {
            return 50;
        }
        return Math.max(Math.min(volume, 100), 0);
    }
    playingSounds = new Set();
    async playSound(sound, allowManyInParallel = false) {
        if (!allowManyInParallel && this.playingSounds.has(sound)) {
            return;
        }
        this.playingSounds.add(sound);
        const url = FileAccess.asBrowserUri(`vs/platform/audioCues/common/media/${sound.fileName}`).toString();
        const audio = new Audio(url);
        audio.volume = this.getVolumeInPercent() / 100;
        audio.addEventListener('ended', () => {
            this.playingSounds.delete(sound);
        });
        try {
            try {
                // Don't play when loading takes more than 1s, due to loading, decoding or playing issues.
                // Delayed sounds are very confusing.
                await raceTimeout(audio.play(), 1000);
            }
            catch (e) {
                console.error('Error while playing sound', e);
            }
        }
        finally {
            audio.remove();
        }
    }
    obsoleteAudioCuesEnabled = observableFromEvent(Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration('audioCues.enabled')), () => /** @description config: audioCues.enabled */ this.configurationService.getValue('audioCues.enabled'));
    isEnabledCache = new Cache((cue) => {
        const settingObservable = observableFromEvent(Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(cue.settingsKey)), () => this.configurationService.getValue(cue.settingsKey));
        return derived('audio cue enabled', reader => {
            const setting = settingObservable.read(reader);
            if (setting === 'on' ||
                (setting === 'auto' && this.screenReaderAttached.read(reader))) {
                return true;
            }
            const obsoleteSetting = this.obsoleteAudioCuesEnabled.read(reader);
            if (obsoleteSetting === 'on' ||
                (obsoleteSetting === 'auto' && this.screenReaderAttached.read(reader))) {
                return true;
            }
            return false;
        });
    });
    isEnabled(cue) {
        return this.isEnabledCache.get(cue);
    }
};
AudioCueService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IAccessibilityService)
], AudioCueService);
export { AudioCueService };
class Cache {
    getValue;
    map = new Map();
    constructor(getValue) {
        this.getValue = getValue;
    }
    get(arg) {
        if (this.map.has(arg)) {
            return this.map.get(arg);
        }
        const value = this.getValue(arg);
        this.map.set(arg, value);
        return value;
    }
}
/**
 * Corresponds to the audio files in ./media.
*/
export class Sound {
    fileName;
    static register(options) {
        const sound = new Sound(options.fileName);
        return sound;
    }
    static error = Sound.register({ fileName: 'error.mp3' });
    static warning = Sound.register({ fileName: 'warning.mp3' });
    static foldedArea = Sound.register({ fileName: 'foldedAreas.mp3' });
    static break = Sound.register({ fileName: 'break.mp3' });
    static quickFixes = Sound.register({ fileName: 'quickFixes.mp3' });
    static taskCompleted = Sound.register({ fileName: 'taskCompleted.mp3' });
    static taskFailed = Sound.register({ fileName: 'taskFailed.mp3' });
    static terminalBell = Sound.register({ fileName: 'terminalBell.mp3' });
    static diffLineInserted = Sound.register({ fileName: 'diffLineInserted.mp3' });
    static diffLineDeleted = Sound.register({ fileName: 'diffLineDeleted.mp3' });
    constructor(fileName) {
        this.fileName = fileName;
    }
}
export class AudioCue {
    sound;
    name;
    settingsKey;
    static _audioCues = new Set();
    static register(options) {
        const audioCue = new AudioCue(options.sound, options.name, options.settingsKey);
        AudioCue._audioCues.add(audioCue);
        return audioCue;
    }
    static get allAudioCues() {
        return [...this._audioCues];
    }
    static error = AudioCue.register({
        name: localize('audioCues.lineHasError.name', 'Error on Line'),
        sound: Sound.error,
        settingsKey: 'audioCues.lineHasError',
    });
    static warning = AudioCue.register({
        name: localize('audioCues.lineHasWarning.name', 'Warning on Line'),
        sound: Sound.warning,
        settingsKey: 'audioCues.lineHasWarning',
    });
    static foldedArea = AudioCue.register({
        name: localize('audioCues.lineHasFoldedArea.name', 'Folded Area on Line'),
        sound: Sound.foldedArea,
        settingsKey: 'audioCues.lineHasFoldedArea',
    });
    static break = AudioCue.register({
        name: localize('audioCues.lineHasBreakpoint.name', 'Breakpoint on Line'),
        sound: Sound.break,
        settingsKey: 'audioCues.lineHasBreakpoint',
    });
    static inlineSuggestion = AudioCue.register({
        name: localize('audioCues.lineHasInlineSuggestion.name', 'Inline Suggestion on Line'),
        sound: Sound.quickFixes,
        settingsKey: 'audioCues.lineHasInlineSuggestion',
    });
    static terminalQuickFix = AudioCue.register({
        name: localize('audioCues.terminalQuickFix.name', 'Terminal Quick Fix'),
        sound: Sound.quickFixes,
        settingsKey: 'audioCues.terminalQuickFix',
    });
    static onDebugBreak = AudioCue.register({
        name: localize('audioCues.onDebugBreak.name', 'Debugger Stopped on Breakpoint'),
        sound: Sound.break,
        settingsKey: 'audioCues.onDebugBreak',
    });
    static noInlayHints = AudioCue.register({
        name: localize('audioCues.noInlayHints', 'No Inlay Hints on Line'),
        sound: Sound.error,
        settingsKey: 'audioCues.noInlayHints'
    });
    static taskCompleted = AudioCue.register({
        name: localize('audioCues.taskCompleted', 'Task Completed'),
        sound: Sound.taskCompleted,
        settingsKey: 'audioCues.taskCompleted'
    });
    static taskFailed = AudioCue.register({
        name: localize('audioCues.taskFailed', 'Task Failed'),
        sound: Sound.taskFailed,
        settingsKey: 'audioCues.taskFailed'
    });
    static terminalBell = AudioCue.register({
        name: localize('audioCues.terminalBell', 'Terminal Bell'),
        sound: Sound.terminalBell,
        settingsKey: 'audioCues.terminalBell'
    });
    static diffLineInserted = AudioCue.register({
        name: localize('audioCues.diffLineInserted', 'Diff Line Inserted'),
        sound: Sound.diffLineInserted,
        settingsKey: 'audioCues.diffLineInserted'
    });
    static diffLineDeleted = AudioCue.register({
        name: localize('audioCues.diffLineDeleted', 'Diff Line Deleted'),
        sound: Sound.diffLineDeleted,
        settingsKey: 'audioCues.diffLineDeleted'
    });
    constructor(sound, name, settingsKey) {
        this.sound = sound;
        this.name = name;
        this.settingsKey = settingsKey;
    }
}
