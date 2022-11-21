/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator, refineServiceDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IEnvironmentService = createDecorator('environmentService');
export const INativeEnvironmentService = refineServiceDecorator(IEnvironmentService);
