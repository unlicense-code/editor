import { DebugModel } from 'vs/workbench/contrib/debug/common/debugModel';
import { DebugSession } from 'vs/workbench/contrib/debug/browser/debugSession';
import { IDebugSessionOptions } from 'vs/workbench/contrib/debug/common/debug';
export declare function createTestSession(model: DebugModel, name?: string, options?: IDebugSessionOptions): DebugSession;
