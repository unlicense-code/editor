/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IExternalTerminalService = createDecorator('externalTerminal');
export const DEFAULT_TERMINAL_OSX = 'Terminal.app';
export const IExternalTerminalMainService = createDecorator('externalTerminal');
