import { IProcessEnvironment } from 'vs/base/common/platform';
import { IEnvironmentVariableCollection, IExtensionOwnedEnvironmentVariableMutator, IMergedEnvironmentVariableCollection, IMergedEnvironmentVariableCollectionDiff } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { VariableResolver } from 'vs/workbench/contrib/terminal/common/terminalEnvironment';
export declare class MergedEnvironmentVariableCollection implements IMergedEnvironmentVariableCollection {
    readonly collections: ReadonlyMap<string, IEnvironmentVariableCollection>;
    readonly map: Map<string, IExtensionOwnedEnvironmentVariableMutator[]>;
    constructor(collections: ReadonlyMap<string, IEnvironmentVariableCollection>);
    applyToProcessEnvironment(env: IProcessEnvironment, variableResolver?: VariableResolver): Promise<void>;
    diff(other: IMergedEnvironmentVariableCollection): IMergedEnvironmentVariableCollectionDiff | undefined;
}
