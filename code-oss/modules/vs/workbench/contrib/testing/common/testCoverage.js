/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
/**
 * Class that exposese coverage information for a run.
 */
export class TestCoverage {
    accessor;
    fileCoverage;
    constructor(accessor) {
        this.accessor = accessor;
    }
    /**
     * Gets coverage information for all files.
     */
    async getAllFiles(token = CancellationToken.None) {
        if (!this.fileCoverage) {
            this.fileCoverage = this.accessor.provideFileCoverage(token);
        }
        try {
            return await this.fileCoverage;
        }
        catch (e) {
            this.fileCoverage = undefined;
            throw e;
        }
    }
    /**
     * Gets coverage information for a specific file.
     */
    async getUri(uri, token = CancellationToken.None) {
        const files = await this.getAllFiles(token);
        return files.find(f => f.uri.toString() === uri.toString());
    }
}
export class FileCoverage {
    index;
    accessor;
    _details;
    uri;
    statement;
    branch;
    function;
    /** Gets the total coverage percent based on information provided. */
    get tpc() {
        let numerator = this.statement.covered;
        let denominator = this.statement.total;
        if (this.branch) {
            numerator += this.branch.covered;
            denominator += this.branch.total;
        }
        if (this.function) {
            numerator += this.function.covered;
            denominator += this.function.total;
        }
        return denominator === 0 ? 1 : numerator / denominator;
    }
    constructor(coverage, index, accessor) {
        this.index = index;
        this.accessor = accessor;
        this.uri = URI.revive(coverage.uri);
        this.statement = coverage.statement;
        this.branch = coverage.branch;
        this.function = coverage.branch;
        this._details = coverage.details;
    }
    /**
     * Gets per-line coverage details.
     */
    async details(token = CancellationToken.None) {
        if (!this._details) {
            this._details = this.accessor.resolveFileCoverage(this.index, token);
        }
        try {
            return await this._details;
        }
        catch (e) {
            this._details = undefined;
            throw e;
        }
    }
}
