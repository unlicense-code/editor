import { OperatingSystem } from 'vs/base/common/platform';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IKeybindingItemEntry } from 'vs/workbench/services/preferences/common/preferences';
export declare const KEYBINDING_ENTRY_TEMPLATE_ID = "keybinding.entry.template";
export declare class KeybindingsEditorModel extends EditorModel {
    private readonly keybindingsService;
    private _keybindingItems;
    private _keybindingItemsSortedByPrecedence;
    private modifierLabels;
    constructor(os: OperatingSystem, keybindingsService: IKeybindingService);
    fetch(searchValue: string, sortByPrecedence?: boolean): IKeybindingItemEntry[];
    private filterBySource;
    private filterByText;
    private splitKeybindingWords;
    resolve(actionLabels?: Map<string, string>): Promise<void>;
    private static getId;
    private static compareKeybindingData;
    private static toKeybindingEntry;
    private static getCommandDefaultLabel;
    private static getCommandLabel;
}
