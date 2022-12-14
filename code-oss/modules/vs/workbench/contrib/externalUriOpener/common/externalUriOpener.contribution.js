/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import { externalUriOpenersConfigurationNode } from 'vs/workbench/contrib/externalUriOpener/common/configuration';
import { ExternalUriOpenerService, IExternalUriOpenerService } from 'vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService';
registerSingleton(IExternalUriOpenerService, ExternalUriOpenerService, 1 /* InstantiationType.Delayed */);
Registry.as(ConfigurationExtensions.Configuration)
    .registerConfiguration(externalUriOpenersConfigurationNode);
