/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Codicon } from 'vs/base/common/codicons';
import { localize } from 'vs/nls';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { Action2 } from 'vs/platform/actions/common/actions';
import { AudioCue, IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
export class ShowAudioCueHelp extends Action2 {
    static ID = 'audioCues.help';
    constructor() {
        super({
            id: ShowAudioCueHelp.ID,
            title: {
                value: localize('audioCues.help', "Help: List Audio Cues"),
                original: 'Help: List Audio Cues'
            },
            f1: true,
        });
    }
    async run(accessor) {
        const audioCueService = accessor.get(IAudioCueService);
        const quickPickService = accessor.get(IQuickInputService);
        const preferencesService = accessor.get(IPreferencesService);
        const accessibilityService = accessor.get(IAccessibilityService);
        const items = AudioCue.allAudioCues.map((cue, idx) => ({
            label: accessibilityService.isScreenReaderOptimized() ?
                `${cue.name}${audioCueService.isEnabled(cue).get() ? '' : ' (' + localize('disabled', "Disabled") + ')'}`
                : `${audioCueService.isEnabled(cue).get() ? '$(check)' : '     '} ${cue.name}`,
            audioCue: cue,
            buttons: [{
                    iconClass: Codicon.settingsGear.classNames,
                    tooltip: localize('audioCues.help.settings', 'Enable/Disable Audio Cue'),
                }],
        }));
        const quickPick = quickPickService.pick(items, {
            activeItem: items[0],
            onDidFocus: (item) => {
                audioCueService.playSound(item.audioCue.sound, true);
            },
            onDidTriggerItemButton: (context) => {
                preferencesService.openSettings({ query: context.item.audioCue.settingsKey });
            },
            placeHolder: localize('audioCues.help.placeholder', 'Select an audio cue to play'),
        });
        await quickPick;
    }
}
