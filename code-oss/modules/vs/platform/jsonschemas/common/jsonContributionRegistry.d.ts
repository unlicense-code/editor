import { Event } from 'vs/base/common/event';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
export declare const Extensions: {
    JSONContribution: string;
};
export interface ISchemaContributions {
    schemas: {
        [id: string]: IJSONSchema;
    };
}
export interface IJSONContributionRegistry {
    readonly onDidChangeSchema: Event<string>;
    /**
     * Register a schema to the registry.
     */
    registerSchema(uri: string, unresolvedSchemaContent: IJSONSchema): void;
    /**
     * Notifies all listeners that the content of the given schema has changed.
     * @param uri The id of the schema
     */
    notifySchemaChanged(uri: string): void;
    /**
     * Get all schemas
     */
    getSchemaContributions(): ISchemaContributions;
}
