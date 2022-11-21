import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IFileCoverage, CoverageDetails, ICoveredCount } from 'vs/workbench/contrib/testing/common/testTypes';
export interface ICoverageAccessor {
    provideFileCoverage: (token: CancellationToken) => Promise<IFileCoverage[]>;
    resolveFileCoverage: (fileIndex: number, token: CancellationToken) => Promise<CoverageDetails[]>;
}
/**
 * Class that exposese coverage information for a run.
 */
export declare class TestCoverage {
    private readonly accessor;
    private fileCoverage?;
    constructor(accessor: ICoverageAccessor);
    /**
     * Gets coverage information for all files.
     */
    getAllFiles(token?: Readonly<CancellationToken>): Promise<IFileCoverage[]>;
    /**
     * Gets coverage information for a specific file.
     */
    getUri(uri: URI, token?: Readonly<CancellationToken>): Promise<IFileCoverage | undefined>;
}
export declare class FileCoverage {
    private readonly index;
    private readonly accessor;
    private _details?;
    readonly uri: URI;
    readonly statement: ICoveredCount;
    readonly branch?: ICoveredCount;
    readonly function?: ICoveredCount;
    /** Gets the total coverage percent based on information provided. */
    get tpc(): number;
    constructor(coverage: IFileCoverage, index: number, accessor: ICoverageAccessor);
    /**
     * Gets per-line coverage details.
     */
    details(token?: Readonly<CancellationToken>): Promise<CoverageDetails[]>;
}
