import { IProcessEnvironment } from 'vs/base/common/platform';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
/**
 * Use this to parse raw code process.argv such as: `Electron . --verbose --wait`
 */
export declare function parseMainProcessArgv(processArgv: string[]): NativeParsedArgs;
/**
 * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
 */
export declare function parseCLIProcessArgv(processArgv: string[]): NativeParsedArgs;
export declare function addArg(argv: string[], ...args: string[]): string[];
export declare function isLaunchedFromCli(env: IProcessEnvironment): boolean;
