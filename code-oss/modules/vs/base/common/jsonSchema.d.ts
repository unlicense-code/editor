export declare type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'array' | 'object';
export interface IJSONSchema {
    id?: string;
    $id?: string;
    $schema?: string;
    type?: JSONSchemaType | JSONSchemaType[];
    title?: string;
    default?: any;
    definitions?: IJSONSchemaMap;
    description?: string;
    properties?: IJSONSchemaMap;
    patternProperties?: IJSONSchemaMap;
    additionalProperties?: boolean | IJSONSchema;
    minProperties?: number;
    maxProperties?: number;
    dependencies?: IJSONSchemaMap | {
        [prop: string]: string[];
    };
    items?: IJSONSchema | IJSONSchema[];
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    additionalItems?: boolean | IJSONSchema;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean | number;
    exclusiveMaximum?: boolean | number;
    multipleOf?: number;
    required?: string[];
    $ref?: string;
    anyOf?: IJSONSchema[];
    allOf?: IJSONSchema[];
    oneOf?: IJSONSchema[];
    not?: IJSONSchema;
    enum?: any[];
    format?: string;
    const?: any;
    contains?: IJSONSchema;
    propertyNames?: IJSONSchema;
    examples?: any[];
    $comment?: string;
    if?: IJSONSchema;
    then?: IJSONSchema;
    else?: IJSONSchema;
    unevaluatedProperties?: boolean | IJSONSchema;
    unevaluatedItems?: boolean | IJSONSchema;
    minContains?: number;
    maxContains?: number;
    deprecated?: boolean;
    dependentRequired?: {
        [prop: string]: string[];
    };
    dependentSchemas?: IJSONSchemaMap;
    $defs?: {
        [name: string]: IJSONSchema;
    };
    $anchor?: string;
    $recursiveRef?: string;
    $recursiveAnchor?: string;
    $vocabulary?: any;
    prefixItems?: IJSONSchema[];
    $dynamicRef?: string;
    $dynamicAnchor?: string;
    defaultSnippets?: IJSONSchemaSnippet[];
    errorMessage?: string;
    patternErrorMessage?: string;
    deprecationMessage?: string;
    markdownDeprecationMessage?: string;
    enumDescriptions?: string[];
    markdownEnumDescriptions?: string[];
    markdownDescription?: string;
    doNotSuggest?: boolean;
    suggestSortText?: string;
    allowComments?: boolean;
    allowTrailingCommas?: boolean;
}
export interface IJSONSchemaMap {
    [name: string]: IJSONSchema;
}
export interface IJSONSchemaSnippet {
    label?: string;
    description?: string;
    body?: any;
    bodyText?: string;
}
