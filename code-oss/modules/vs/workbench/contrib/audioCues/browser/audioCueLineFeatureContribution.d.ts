import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
export declare class AudioCueLineFeatureContribution extends Disposable implements IWorkbenchContribution {
    private readonly editorService;
    private readonly instantiationService;
    private readonly audioCueService;
    private readonly store;
    private readonly features;
    constructor(editorService: IEditorService, instantiationService: IInstantiationService, audioCueService: IAudioCueService);
    private registerAudioCuesForEditor;
}
