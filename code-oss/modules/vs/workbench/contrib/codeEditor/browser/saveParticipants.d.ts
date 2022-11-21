import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITextFileService, ITextFileSaveParticipant, ITextFileEditorModel } from 'vs/workbench/services/textfile/common/textfiles';
import { SaveReason } from 'vs/workbench/common/editor';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export declare class TrimWhitespaceParticipant implements ITextFileSaveParticipant {
    private readonly configurationService;
    private readonly codeEditorService;
    constructor(configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    participate(model: ITextFileEditorModel, env: {
        reason: SaveReason;
    }): Promise<void>;
    private doTrimTrailingWhitespace;
}
export declare class FinalNewLineParticipant implements ITextFileSaveParticipant {
    private readonly configurationService;
    private readonly codeEditorService;
    constructor(configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    participate(model: ITextFileEditorModel, _env: {
        reason: SaveReason;
    }): Promise<void>;
    private doInsertFinalNewLine;
}
export declare class TrimFinalNewLinesParticipant implements ITextFileSaveParticipant {
    private readonly configurationService;
    private readonly codeEditorService;
    constructor(configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    participate(model: ITextFileEditorModel, env: {
        reason: SaveReason;
    }): Promise<void>;
    /**
     * returns 0 if the entire file is empty
     */
    private findLastNonEmptyLine;
    private doTrimFinalNewLines;
}
export declare class SaveParticipantsContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly textFileService;
    constructor(instantiationService: IInstantiationService, textFileService: ITextFileService);
    private registerSaveParticipants;
}
