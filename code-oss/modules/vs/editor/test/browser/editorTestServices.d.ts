import { Event } from 'vs/base/common/event';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { AbstractCodeEditorService, GlobalStyleSheet } from 'vs/editor/browser/services/abstractCodeEditorService';
import { ICommandEvent, ICommandService } from 'vs/platform/commands/common/commands';
import { IResourceEditorInput } from 'vs/platform/editor/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class TestCodeEditorService extends AbstractCodeEditorService {
    readonly globalStyleSheet: TestGlobalStyleSheet;
    protected _createGlobalStyleSheet(): GlobalStyleSheet;
    getActiveCodeEditor(): ICodeEditor | null;
    lastInput?: IResourceEditorInput;
    openCodeEditor(input: IResourceEditorInput, source: ICodeEditor | null, sideBySide?: boolean): Promise<ICodeEditor | null>;
}
export declare class TestGlobalStyleSheet extends GlobalStyleSheet {
    rules: string[];
    constructor();
    insertRule(rule: string, index?: number): void;
    removeRulesContainingSelector(ruleName: string): void;
    read(): string;
}
export declare class TestCommandService implements ICommandService {
    readonly _serviceBrand: undefined;
    private readonly _instantiationService;
    private readonly _onWillExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    private readonly _onDidExecuteCommand;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(instantiationService: IInstantiationService);
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
}
