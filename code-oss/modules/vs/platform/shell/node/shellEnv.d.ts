import { IProcessEnvironment } from 'vs/base/common/platform';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { ILogService } from 'vs/platform/log/common/log';
/**
 * Resolves the shell environment by spawning a shell. This call will cache
 * the shell spawning so that subsequent invocations use that cached result.
 *
 * Will throw an error if:
 * - we hit a timeout of `MAX_SHELL_RESOLVE_TIME`
 * - any other error from spawning a shell to figure out the environment
 */
export declare function getResolvedShellEnv(logService: ILogService, args: NativeParsedArgs, env: IProcessEnvironment): Promise<typeof process.env>;
