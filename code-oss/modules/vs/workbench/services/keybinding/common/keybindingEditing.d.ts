import { Disposable } from 'vs/base/common/lifecycle';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare const IKeybindingEditingService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IKeybindingEditingService>;
export interface IKeybindingEditingService {
    readonly _serviceBrand: undefined;
    addKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    editKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    removeKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
    resetKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
}
export declare class KeybindingsEditingService extends Disposable implements IKeybindingEditingService {
    private readonly textModelResolverService;
    private readonly textFileService;
    private readonly fileService;
    private readonly configurationService;
    private readonly userDataProfileService;
    _serviceBrand: undefined;
    private queue;
    constructor(textModelResolverService: ITextModelService, textFileService: ITextFileService, fileService: IFileService, configurationService: IConfigurationService, userDataProfileService: IUserDataProfileService);
    addKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    editKeybinding(keybindingItem: ResolvedKeybindingItem, key: string, when: string | undefined): Promise<void>;
    resetKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
    removeKeybinding(keybindingItem: ResolvedKeybindingItem): Promise<void>;
    private doEditKeybinding;
    private doRemoveKeybinding;
    private doResetKeybinding;
    private save;
    private updateKeybinding;
    private removeUserKeybinding;
    private removeDefaultKeybinding;
    private removeUnassignedDefaultKeybinding;
    private findUserKeybindingEntryIndex;
    private findUnassignedDefaultKeybindingEntryIndex;
    private asObject;
    private areSame;
    private applyEditsToBuffer;
    private resolveModelReference;
    private resolveAndValidate;
    private parse;
    private getEmptyContent;
}
