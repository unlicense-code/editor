import * as testUtils from 'vs/base/test/common/testUtils';
export declare function getRandomTestPath(tmpdir: string, ...segments: string[]): string;
export declare function getPathFromAmdModule(requirefn: typeof require, relativePath: string): string;
export import flakySuite = testUtils.flakySuite;
