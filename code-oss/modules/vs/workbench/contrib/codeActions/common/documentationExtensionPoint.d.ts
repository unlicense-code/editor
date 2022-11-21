import { IConfigurationPropertySchema } from 'vs/platform/configuration/common/configurationRegistry';
declare enum DocumentationExtensionPointFields {
    when = "when",
    title = "title",
    command = "command"
}
interface RefactoringDocumentationExtensionPoint {
    readonly [DocumentationExtensionPointFields.title]: string;
    readonly [DocumentationExtensionPointFields.when]: string;
    readonly [DocumentationExtensionPointFields.command]: string;
}
export interface DocumentationExtensionPoint {
    readonly refactoring?: readonly RefactoringDocumentationExtensionPoint[];
}
export declare const documentationExtensionPointDescriptor: {
    extensionPoint: string;
    deps: import("../../../services/extensions/common/extensionsRegistry").IExtensionPoint<import("vs/workbench/services/language/common/languageService").IRawLanguageExtensionPoint[]>[];
    jsonSchema: Readonly<IConfigurationPropertySchema>;
};
export {};
