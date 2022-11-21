import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export declare class SaveParticipant {
    private readonly _textFileService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _textFileService: ITextFileService);
    dispose(): void;
}
