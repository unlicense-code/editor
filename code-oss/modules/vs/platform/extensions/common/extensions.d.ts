import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { ILocalizedString } from 'vs/platform/action/common/action';
import { ExtensionKind } from 'vs/platform/environment/common/environment';
export declare const MANIFEST_CACHE_FOLDER = "CachedExtensions";
export declare const USER_MANIFEST_CACHE_FILE = "user";
export declare const BUILTIN_MANIFEST_CACHE_FILE = "builtin";
export declare const UNDEFINED_PUBLISHER = "undefined_publisher";
export interface ICommand {
    command: string;
    title: string | ILocalizedString;
    category?: string | ILocalizedString;
}
export interface IConfigurationProperty {
    description: string;
    type: string | string[];
    default?: any;
}
export interface IConfiguration {
    id?: string;
    order?: number;
    title?: string;
    properties: {
        [key: string]: IConfigurationProperty;
    };
}
export interface IDebugger {
    label?: string;
    type: string;
    runtime?: string;
}
export interface IGrammar {
    language: string;
}
export interface IJSONValidation {
    fileMatch: string | string[];
    url: string;
}
export interface IKeyBinding {
    command: string;
    key: string;
    when?: string;
    mac?: string;
    linux?: string;
    win?: string;
}
export interface ILanguage {
    id: string;
    extensions: string[];
    aliases: string[];
}
export interface IMenu {
    command: string;
    alt?: string;
    when?: string;
    group?: string;
}
export interface ISnippet {
    language: string;
}
export interface ITheme {
    label: string;
}
export interface IViewContainer {
    id: string;
    title: string;
}
export interface IView {
    id: string;
    name: string;
}
export interface IColor {
    id: string;
    description: string;
    defaults: {
        light: string;
        dark: string;
        highContrast: string;
    };
}
interface IWebviewEditor {
    readonly viewType: string;
    readonly priority: string;
    readonly selector: readonly {
        readonly filenamePattern?: string;
    }[];
}
export interface ICodeActionContributionAction {
    readonly kind: string;
    readonly title: string;
    readonly description?: string;
}
export interface ICodeActionContribution {
    readonly languages: readonly string[];
    readonly actions: readonly ICodeActionContributionAction[];
}
export interface IAuthenticationContribution {
    readonly id: string;
    readonly label: string;
}
export interface IWalkthroughStep {
    readonly id: string;
    readonly title: string;
    readonly description: string | undefined;
    readonly media: {
        image: string | {
            dark: string;
            light: string;
            hc: string;
        };
        altText: string;
        markdown?: never;
        svg?: never;
    } | {
        markdown: string;
        image?: never;
        svg?: never;
    } | {
        svg: string;
        altText: string;
        markdown?: never;
        image?: never;
    };
    readonly completionEvents?: string[];
    /** @deprecated use `completionEvents: 'onCommand:...'` */
    readonly doneOn?: {
        command: string;
    };
    readonly when?: string;
}
export interface IWalkthrough {
    readonly id: string;
    readonly title: string;
    readonly icon?: string;
    readonly description: string;
    readonly steps: IWalkthroughStep[];
    readonly featuredFor: string[] | undefined;
    readonly when?: string;
}
export interface IStartEntry {
    readonly title: string;
    readonly description: string;
    readonly command: string;
    readonly when?: string;
    readonly category: 'file' | 'folder' | 'notebook';
}
export interface INotebookEntry {
    readonly type: string;
    readonly displayName: string;
}
export interface INotebookRendererContribution {
    readonly id: string;
    readonly displayName: string;
    readonly mimeTypes: string[];
}
export interface ITranslation {
    id: string;
    path: string;
}
export interface ILocalizationContribution {
    languageId: string;
    languageName?: string;
    localizedLanguageName?: string;
    translations: ITranslation[];
    minimalTranslations?: {
        [key: string]: string;
    };
}
export interface IExtensionContributions {
    commands?: ICommand[];
    configuration?: IConfiguration | IConfiguration[];
    debuggers?: IDebugger[];
    grammars?: IGrammar[];
    jsonValidation?: IJSONValidation[];
    keybindings?: IKeyBinding[];
    languages?: ILanguage[];
    menus?: {
        [context: string]: IMenu[];
    };
    snippets?: ISnippet[];
    themes?: ITheme[];
    iconThemes?: ITheme[];
    productIconThemes?: ITheme[];
    viewsContainers?: {
        [location: string]: IViewContainer[];
    };
    views?: {
        [location: string]: IView[];
    };
    colors?: IColor[];
    localizations?: ILocalizationContribution[];
    readonly customEditors?: readonly IWebviewEditor[];
    readonly codeActions?: readonly ICodeActionContribution[];
    authentication?: IAuthenticationContribution[];
    walkthroughs?: IWalkthrough[];
    startEntries?: IStartEntry[];
    readonly notebooks?: INotebookEntry[];
    readonly notebookRenderer?: INotebookRendererContribution[];
}
export interface IExtensionCapabilities {
    readonly virtualWorkspaces?: ExtensionVirtualWorkspaceSupport;
    readonly untrustedWorkspaces?: ExtensionUntrustedWorkspaceSupport;
}
export declare const ALL_EXTENSION_KINDS: readonly ExtensionKind[];
export declare type LimitedWorkspaceSupportType = 'limited';
export declare type ExtensionUntrustedWorkspaceSupportType = boolean | LimitedWorkspaceSupportType;
export declare type ExtensionUntrustedWorkspaceSupport = {
    supported: true;
} | {
    supported: false;
    description: string;
} | {
    supported: LimitedWorkspaceSupportType;
    description: string;
    restrictedConfigurations?: string[];
};
export declare type ExtensionVirtualWorkspaceSupportType = boolean | LimitedWorkspaceSupportType;
export declare type ExtensionVirtualWorkspaceSupport = boolean | {
    supported: true;
} | {
    supported: false | LimitedWorkspaceSupportType;
    description: string;
};
export declare function getWorkspaceSupportTypeMessage(supportType: ExtensionUntrustedWorkspaceSupport | ExtensionVirtualWorkspaceSupport | undefined): string | undefined;
export declare function isIExtensionIdentifier(thing: any): thing is IExtensionIdentifier;
export interface IExtensionIdentifier {
    id: string;
    uuid?: string;
}
export declare const EXTENSION_CATEGORIES: string[];
export interface IRelaxedExtensionManifest {
    name: string;
    displayName?: string;
    publisher: string;
    version: string;
    engines: {
        readonly vscode: string;
    };
    description?: string;
    main?: string;
    browser?: string;
    preview?: boolean;
    l10n?: string;
    icon?: string;
    categories?: string[];
    keywords?: string[];
    activationEvents?: string[];
    extensionDependencies?: string[];
    extensionPack?: string[];
    extensionKind?: ExtensionKind | ExtensionKind[];
    contributes?: IExtensionContributions;
    repository?: {
        url: string;
    };
    bugs?: {
        url: string;
    };
    enabledApiProposals?: readonly string[];
    api?: string;
    scripts?: {
        [key: string]: string;
    };
    capabilities?: IExtensionCapabilities;
}
export declare type IExtensionManifest = Readonly<IRelaxedExtensionManifest>;
export declare const enum ExtensionType {
    System = 0,
    User = 1
}
export declare const enum TargetPlatform {
    WIN32_X64 = "win32-x64",
    WIN32_IA32 = "win32-ia32",
    WIN32_ARM64 = "win32-arm64",
    LINUX_X64 = "linux-x64",
    LINUX_ARM64 = "linux-arm64",
    LINUX_ARMHF = "linux-armhf",
    ALPINE_X64 = "alpine-x64",
    ALPINE_ARM64 = "alpine-arm64",
    DARWIN_X64 = "darwin-x64",
    DARWIN_ARM64 = "darwin-arm64",
    WEB = "web",
    UNIVERSAL = "universal",
    UNKNOWN = "unknown",
    UNDEFINED = "undefined"
}
export interface IExtension {
    readonly type: ExtensionType;
    readonly isBuiltin: boolean;
    readonly identifier: IExtensionIdentifier;
    readonly manifest: IExtensionManifest;
    readonly location: URI;
    readonly targetPlatform: TargetPlatform;
    readonly readmeUrl?: URI;
    readonly changelogUrl?: URI;
    readonly isValid: boolean;
    readonly validations: readonly [Severity, string][];
    readonly browserNlsBundleUris?: {
        [language: string]: URI;
    };
}
/**
 * **!Do not construct directly!**
 *
 * **!Only static methods because it gets serialized!**
 *
 * This represents the "canonical" version for an extension identifier. Extension ids
 * have to be case-insensitive (due to the marketplace), but we must ensure case
 * preservation because the extension API is already public at this time.
 *
 * For example, given an extension with the publisher `"Hello"` and the name `"World"`,
 * its canonical extension identifier is `"Hello.World"`. This extension could be
 * referenced in some other extension's dependencies using the string `"hello.world"`.
 *
 * To make matters more complicated, an extension can optionally have an UUID. When two
 * extensions have the same UUID, they are considered equal even if their identifier is different.
 */
export declare class ExtensionIdentifier {
    readonly value: string;
    private readonly _lower;
    constructor(value: string);
    static equals(a: ExtensionIdentifier | string | null | undefined, b: ExtensionIdentifier | string | null | undefined): boolean;
    /**
     * Gives the value by which to index (for equality).
     */
    static toKey(id: ExtensionIdentifier | string): string;
}
export interface IRelaxedExtensionDescription extends IRelaxedExtensionManifest {
    id?: string;
    identifier: ExtensionIdentifier;
    uuid?: string;
    targetPlatform: TargetPlatform;
    isBuiltin: boolean;
    isUserBuiltin: boolean;
    isUnderDevelopment: boolean;
    extensionLocation: URI;
    browserNlsBundleUris?: {
        [language: string]: URI;
    };
}
export declare type IExtensionDescription = Readonly<IRelaxedExtensionDescription>;
export declare function isApplicationScopedExtension(manifest: IExtensionManifest): boolean;
export declare function isLanguagePackExtension(manifest: IExtensionManifest): boolean;
export declare function isAuthenticationProviderExtension(manifest: IExtensionManifest): boolean;
export declare function isResolverExtension(manifest: IExtensionManifest, remoteAuthority: string | undefined): boolean;
export declare const IBuiltinExtensionsScannerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IBuiltinExtensionsScannerService>;
export interface IBuiltinExtensionsScannerService {
    readonly _serviceBrand: undefined;
    scanBuiltinExtensions(): Promise<IExtension[]>;
}
export {};
