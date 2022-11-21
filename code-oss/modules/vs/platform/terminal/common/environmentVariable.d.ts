export declare enum EnvironmentVariableMutatorType {
    Replace = 1,
    Append = 2,
    Prepend = 3
}
export interface IEnvironmentVariableMutator {
    readonly value: string;
    readonly type: EnvironmentVariableMutatorType;
}
/** [variable, mutator] */
export declare type ISerializableEnvironmentVariableCollection = [string, IEnvironmentVariableMutator][];
/** [extension, collection] */
export declare type ISerializableEnvironmentVariableCollections = [string, ISerializableEnvironmentVariableCollection][];
