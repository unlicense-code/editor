/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ILanguageDetectionService = createDecorator('ILanguageDetectionService');
export const LanguageDetectionLanguageEventSource = 'languageDetection';
//#region Telemetry events
export const AutomaticLanguageDetectionLikelyWrongId = 'automaticlanguagedetection.likelywrong';
export const LanguageDetectionStatsId = 'automaticlanguagedetection.stats';
//#endregion
