import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export interface IFindInFilesArgs {
    query?: string;
    replace?: string;
    preserveCase?: boolean;
    triggerSearch?: boolean;
    filesToInclude?: string;
    filesToExclude?: string;
    isRegex?: boolean;
    isCaseSensitive?: boolean;
    matchWholeWord?: boolean;
    useExcludeSettingsAndIgnoreFiles?: boolean;
    onlyOpenEditors?: boolean;
}
export declare function findInFilesCommand(accessor: ServicesAccessor, args?: IFindInFilesArgs): void;
