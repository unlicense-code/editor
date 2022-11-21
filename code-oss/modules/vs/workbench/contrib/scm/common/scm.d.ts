import { URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Command } from 'vs/editor/common/languages';
import { ISequence } from 'vs/base/common/sequence';
import { IAction } from 'vs/base/common/actions';
import { IMenu } from 'vs/platform/actions/common/actions';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IMarkdownString } from 'vs/base/common/htmlContent';
export declare const VIEWLET_ID = "workbench.view.scm";
export declare const VIEW_PANE_ID = "workbench.scm";
export declare const REPOSITORIES_VIEW_PANE_ID = "workbench.scm.repositories";
export interface IBaselineResourceProvider {
    getBaselineResource(resource: URI): Promise<URI>;
}
export declare const ISCMService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISCMService>;
export interface ISCMResourceDecorations {
    icon?: URI | ThemeIcon;
    iconDark?: URI | ThemeIcon;
    tooltip?: string;
    strikeThrough?: boolean;
    faded?: boolean;
}
export interface ISCMResource {
    readonly resourceGroup: ISCMResourceGroup;
    readonly sourceUri: URI;
    readonly decorations: ISCMResourceDecorations;
    readonly contextValue: string | undefined;
    readonly command: Command | undefined;
    open(preserveFocus: boolean): Promise<void>;
}
export interface ISCMResourceGroup extends ISequence<ISCMResource> {
    readonly provider: ISCMProvider;
    readonly label: string;
    readonly id: string;
    readonly hideWhenEmpty: boolean;
    readonly onDidChange: Event<void>;
}
export interface ISCMProvider extends IDisposable {
    readonly label: string;
    readonly id: string;
    readonly contextValue: string;
    readonly groups: ISequence<ISCMResourceGroup>;
    readonly onDidChangeResources: Event<void>;
    readonly rootUri?: URI;
    readonly count?: number;
    readonly commitTemplate: string;
    readonly onDidChangeCommitTemplate: Event<string>;
    readonly onDidChangeStatusBarCommands?: Event<readonly Command[]>;
    readonly acceptInputCommand?: Command;
    readonly actionButton?: ISCMActionButtonDescriptor;
    readonly statusBarCommands?: readonly Command[];
    readonly onDidChange: Event<void>;
    getOriginalResource(uri: URI): Promise<URI | null>;
}
export declare const enum InputValidationType {
    Error = 0,
    Warning = 1,
    Information = 2
}
export interface IInputValidation {
    message: string | IMarkdownString;
    type: InputValidationType;
}
export interface IInputValidator {
    (value: string, cursorPosition: number): Promise<IInputValidation | undefined>;
}
export declare enum SCMInputChangeReason {
    HistoryPrevious = 0,
    HistoryNext = 1
}
export interface ISCMInputChangeEvent {
    readonly value: string;
    readonly reason?: SCMInputChangeReason;
}
export interface ISCMActionButtonDescriptor {
    command: Command;
    secondaryCommands?: Command[][];
    description?: string;
    enabled: boolean;
}
export interface ISCMActionButton {
    readonly type: 'actionButton';
    readonly repository: ISCMRepository;
    readonly button?: ISCMActionButtonDescriptor;
}
export interface ISCMInput {
    readonly repository: ISCMRepository;
    readonly value: string;
    setValue(value: string, fromKeyboard: boolean): void;
    readonly onDidChange: Event<ISCMInputChangeEvent>;
    placeholder: string;
    readonly onDidChangePlaceholder: Event<string>;
    validateInput: IInputValidator;
    readonly onDidChangeValidateInput: Event<void>;
    enabled: boolean;
    readonly onDidChangeEnablement: Event<boolean>;
    visible: boolean;
    readonly onDidChangeVisibility: Event<boolean>;
    setFocus(): void;
    readonly onDidChangeFocus: Event<void>;
    showValidationMessage(message: string | IMarkdownString, type: InputValidationType): void;
    readonly onDidChangeValidationMessage: Event<IInputValidation>;
    showNextHistoryValue(): void;
    showPreviousHistoryValue(): void;
}
export interface ISCMRepository extends IDisposable {
    readonly id: string;
    readonly provider: ISCMProvider;
    readonly input: ISCMInput;
}
export interface ISCMService {
    readonly _serviceBrand: undefined;
    readonly onDidAddRepository: Event<ISCMRepository>;
    readonly onDidRemoveRepository: Event<ISCMRepository>;
    readonly repositories: Iterable<ISCMRepository>;
    readonly repositoryCount: number;
    registerSCMProvider(provider: ISCMProvider): ISCMRepository;
    getRepository(id: string): ISCMRepository | undefined;
}
export interface ISCMTitleMenu {
    readonly actions: IAction[];
    readonly secondaryActions: IAction[];
    readonly onDidChangeTitle: Event<void>;
    readonly menu: IMenu;
}
export interface ISCMRepositoryMenus {
    readonly titleMenu: ISCMTitleMenu;
    readonly repositoryMenu: IMenu;
    getResourceGroupMenu(group: ISCMResourceGroup): IMenu;
    getResourceMenu(resource: ISCMResource): IMenu;
    getResourceFolderMenu(group: ISCMResourceGroup): IMenu;
}
export interface ISCMMenus {
    getRepositoryMenus(provider: ISCMProvider): ISCMRepositoryMenus;
}
export declare const enum ISCMRepositorySortKey {
    DiscoveryTime = "discoveryTime",
    Name = "name",
    Path = "path"
}
export declare const ISCMViewService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISCMViewService>;
export interface ISCMViewVisibleRepositoryChangeEvent {
    readonly added: Iterable<ISCMRepository>;
    readonly removed: Iterable<ISCMRepository>;
}
export interface ISCMViewService {
    readonly _serviceBrand: undefined;
    readonly menus: ISCMMenus;
    repositories: ISCMRepository[];
    readonly onDidChangeRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    visibleRepositories: ISCMRepository[];
    readonly onDidChangeVisibleRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    isVisible(repository: ISCMRepository): boolean;
    toggleVisibility(repository: ISCMRepository, visible?: boolean): void;
    toggleSortKey(sortKey: ISCMRepositorySortKey): void;
    readonly focusedRepository: ISCMRepository | undefined;
    readonly onDidFocusRepository: Event<ISCMRepository | undefined>;
    focus(repository: ISCMRepository): void;
}
