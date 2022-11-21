/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ShowAudioCueHelp } from 'vs/workbench/contrib/audioCues/browser/commands';
import { localize } from 'vs/nls';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IAudioCueService, AudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { AudioCueLineDebuggerContribution } from 'vs/workbench/contrib/audioCues/browser/audioCueDebuggerContribution';
import { AudioCueLineFeatureContribution } from 'vs/workbench/contrib/audioCues/browser/audioCueLineFeatureContribution';
registerSingleton(IAudioCueService, AudioCueService, 1 /* InstantiationType.Delayed */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(AudioCueLineFeatureContribution, 3 /* LifecyclePhase.Restored */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(AudioCueLineDebuggerContribution, 3 /* LifecyclePhase.Restored */);
const audioCueFeatureBase = {
    'type': 'string',
    'enum': ['auto', 'on', 'off'],
    'default': 'auto',
    'enumDescriptions': [
        localize('audioCues.enabled.auto', "Enable audio cue when a screen reader is attached."),
        localize('audioCues.enabled.on', "Enable audio cue."),
        localize('audioCues.enabled.off', "Disable audio cue.")
    ],
    tags: ['accessibility']
};
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    'properties': {
        'audioCues.enabled': {
            markdownDeprecationMessage: 'Deprecated. Use the specific setting for each audio cue instead (`audioCues.*`).',
            tags: ['accessibility']
        },
        'audioCues.volume': {
            'description': localize('audioCues.volume', "The volume of the audio cues in percent (0-100)."),
            'type': 'number',
            'minimum': 0,
            'maximum': 100,
            'default': 70,
            tags: ['accessibility']
        },
        'audioCues.lineHasBreakpoint': {
            'description': localize('audioCues.lineHasBreakpoint', "Plays a sound when the active line has a breakpoint."),
            ...audioCueFeatureBase
        },
        'audioCues.lineHasInlineSuggestion': {
            'description': localize('audioCues.lineHasInlineSuggestion', "Plays a sound when the active line has an inline suggestion."),
            ...audioCueFeatureBase
        },
        'audioCues.lineHasError': {
            'description': localize('audioCues.lineHasError', "Plays a sound when the active line has an error."),
            ...audioCueFeatureBase,
        },
        'audioCues.lineHasFoldedArea': {
            'description': localize('audioCues.lineHasFoldedArea', "Plays a sound when the active line has a folded area that can be unfolded."),
            ...audioCueFeatureBase,
        },
        'audioCues.lineHasWarning': {
            'description': localize('audioCues.lineHasWarning', "Plays a sound when the active line has a warning."),
            ...audioCueFeatureBase,
            default: 'off',
        },
        'audioCues.onDebugBreak': {
            'description': localize('audioCues.onDebugBreak', "Plays a sound when the debugger stopped on a breakpoint."),
            ...audioCueFeatureBase,
        },
        'audioCues.noInlayHints': {
            'description': localize('audioCues.noInlayHints', "Plays a sound when trying to read a line with inlay hints that has no inlay hints."),
            ...audioCueFeatureBase,
        },
        'audioCues.taskCompleted': {
            'description': localize('audioCues.taskCompleted', "Plays a sound when a task is completed."),
            ...audioCueFeatureBase,
        },
        'audioCues.taskFailed': {
            'description': localize('audioCues.taskFailed', "Plays a sound when a task fails (non-zero exit code)."),
            ...audioCueFeatureBase,
        },
        'audioCues.terminalQuickFix': {
            'description': localize('audioCues.terminalQuickFix', "Plays a sound when terminal Quick Fixes are available."),
            ...audioCueFeatureBase,
        },
        'audioCues.diffLineInserted': {
            'description': localize('audioCues.diffLineInserted', "Plays a sound when the focus moves to an inserted line in diff review mode"),
            ...audioCueFeatureBase,
        },
        'audioCues.diffLineDeleted': {
            'description': localize('audioCues.diffLineDeleted', "Plays a sound when the focus moves to a deleted line in diff review mode"),
            ...audioCueFeatureBase,
        },
    }
});
registerAction2(ShowAudioCueHelp);
