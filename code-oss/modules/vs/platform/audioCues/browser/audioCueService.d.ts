import { Disposable } from 'vs/base/common/lifecycle';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IObservable } from 'vs/base/common/observable';
export declare const IAudioCueService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IAudioCueService>;
export interface IAudioCueService {
    readonly _serviceBrand: undefined;
    playAudioCue(cue: AudioCue, allowManyInParallel?: boolean): Promise<void>;
    playAudioCues(cues: AudioCue[]): Promise<void>;
    isEnabled(cue: AudioCue): IObservable<boolean>;
    playSound(cue: Sound, allowManyInParallel?: boolean): Promise<void>;
}
export declare class AudioCueService extends Disposable implements IAudioCueService {
    private readonly configurationService;
    private readonly accessibilityService;
    readonly _serviceBrand: undefined;
    private readonly screenReaderAttached;
    constructor(configurationService: IConfigurationService, accessibilityService: IAccessibilityService);
    playAudioCue(cue: AudioCue, allowManyInParallel?: boolean): Promise<void>;
    playAudioCues(cues: AudioCue[]): Promise<void>;
    private getVolumeInPercent;
    private playingSounds;
    playSound(sound: Sound, allowManyInParallel?: boolean): Promise<void>;
    private readonly obsoleteAudioCuesEnabled;
    private readonly isEnabledCache;
    isEnabled(cue: AudioCue): IObservable<boolean>;
}
/**
 * Corresponds to the audio files in ./media.
*/
export declare class Sound {
    readonly fileName: string;
    private static register;
    static readonly error: Sound;
    static readonly warning: Sound;
    static readonly foldedArea: Sound;
    static readonly break: Sound;
    static readonly quickFixes: Sound;
    static readonly taskCompleted: Sound;
    static readonly taskFailed: Sound;
    static readonly terminalBell: Sound;
    static readonly diffLineInserted: Sound;
    static readonly diffLineDeleted: Sound;
    private constructor();
}
export declare class AudioCue {
    readonly sound: Sound;
    readonly name: string;
    readonly settingsKey: string;
    private static _audioCues;
    private static register;
    static get allAudioCues(): AudioCue[];
    static readonly error: AudioCue;
    static readonly warning: AudioCue;
    static readonly foldedArea: AudioCue;
    static readonly break: AudioCue;
    static readonly inlineSuggestion: AudioCue;
    static readonly terminalQuickFix: AudioCue;
    static readonly onDebugBreak: AudioCue;
    static readonly noInlayHints: AudioCue;
    static readonly taskCompleted: AudioCue;
    static readonly taskFailed: AudioCue;
    static readonly terminalBell: AudioCue;
    static readonly diffLineInserted: AudioCue;
    static readonly diffLineDeleted: AudioCue;
    private constructor();
}
