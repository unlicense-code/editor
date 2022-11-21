/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { languagesExtPoint } from 'vs/workbench/services/language/common/languageService';
var DocumentationExtensionPointFields;
(function (DocumentationExtensionPointFields) {
    DocumentationExtensionPointFields["when"] = "when";
    DocumentationExtensionPointFields["title"] = "title";
    DocumentationExtensionPointFields["command"] = "command";
})(DocumentationExtensionPointFields || (DocumentationExtensionPointFields = {}));
const documentationExtensionPointSchema = Object.freeze({
    type: 'object',
    description: nls.localize('contributes.documentation', "Contributed documentation."),
    properties: {
        'refactoring': {
            type: 'array',
            description: nls.localize('contributes.documentation.refactorings', "Contributed documentation for refactorings."),
            items: {
                type: 'object',
                description: nls.localize('contributes.documentation.refactoring', "Contributed documentation for refactoring."),
                required: [
                    DocumentationExtensionPointFields.title,
                    DocumentationExtensionPointFields.when,
                    DocumentationExtensionPointFields.command
                ],
                properties: {
                    [DocumentationExtensionPointFields.title]: {
                        type: 'string',
                        description: nls.localize('contributes.documentation.refactoring.title', "Label for the documentation used in the UI."),
                    },
                    [DocumentationExtensionPointFields.when]: {
                        type: 'string',
                        description: nls.localize('contributes.documentation.refactoring.when', "When clause."),
                    },
                    [DocumentationExtensionPointFields.command]: {
                        type: 'string',
                        description: nls.localize('contributes.documentation.refactoring.command', "Command executed."),
                    },
                },
            }
        }
    }
});
export const documentationExtensionPointDescriptor = {
    extensionPoint: 'documentation',
    deps: [languagesExtPoint],
    jsonSchema: documentationExtensionPointSchema
};
