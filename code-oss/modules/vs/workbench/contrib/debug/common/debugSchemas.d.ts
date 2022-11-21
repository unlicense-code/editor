import * as extensionsRegistry from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { IDebuggerContribution, IBreakpointContribution } from 'vs/workbench/contrib/debug/common/debug';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
export declare const debuggersExtPoint: extensionsRegistry.IExtensionPoint<IDebuggerContribution[]>;
export declare const breakpointsExtPoint: extensionsRegistry.IExtensionPoint<IBreakpointContribution[]>;
export declare const presentationSchema: IJSONSchema;
export declare const launchSchema: IJSONSchema;
