import { IJSONSchema } from 'vs/base/common/jsonSchema';
import * as Tasks from 'vs/workbench/contrib/tasks/common/tasks';
import { Event } from 'vs/base/common/event';
export interface ITaskDefinitionRegistry {
    onReady(): Promise<void>;
    get(key: string): Tasks.ITaskDefinition;
    all(): Tasks.ITaskDefinition[];
    getJsonSchema(): IJSONSchema;
    onDefinitionsChanged: Event<void>;
}
export declare const TaskDefinitionRegistry: ITaskDefinitionRegistry;
