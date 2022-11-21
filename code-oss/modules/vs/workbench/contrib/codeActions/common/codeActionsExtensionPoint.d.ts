import { IConfigurationPropertySchema } from 'vs/platform/configuration/common/configurationRegistry';
declare enum CodeActionExtensionPointFields {
    languages = "languages",
    actions = "actions",
    kind = "kind",
    title = "title",
    description = "description"
}
export interface ContributedCodeAction {
    readonly [CodeActionExtensionPointFields.kind]: string;
    readonly [CodeActionExtensionPointFields.title]: string;
    readonly [CodeActionExtensionPointFields.description]?: string;
}
export interface CodeActionsExtensionPoint {
    readonly [CodeActionExtensionPointFields.languages]: readonly string[];
    readonly [CodeActionExtensionPointFields.actions]: readonly ContributedCodeAction[];
}
export declare const codeActionsExtensionPointDescriptor: {
    extensionPoint: string;
    deps: import("../../../services/extensions/common/extensionsRegistry").IExtensionPoint<import("vs/workbench/services/language/common/languageService").IRawLanguageExtensionPoint[]>[];
    jsonSchema: Readonly<IConfigurationPropertySchema>;
};
export {};
