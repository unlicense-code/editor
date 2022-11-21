/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { globals } from 'vs/base/common/platform';
export const ipcRenderer = globals.vscode.ipcRenderer;
export const ipcMessagePort = globals.vscode.ipcMessagePort;
export const webFrame = globals.vscode.webFrame;
export const process = globals.vscode.process;
export const context = globals.vscode.context;
