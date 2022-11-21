/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MainContext } from './extHost.protocol';
import * as typeConvert from 'vs/workbench/api/common/extHostTypeConverters';
import { StandardTokenType, Range, LanguageStatusSeverity } from 'vs/workbench/api/common/extHostTypes';
import Severity from 'vs/base/common/severity';
import { disposableTimeout } from 'vs/base/common/async';
import { DisposableStore } from 'vs/base/common/lifecycle';
export class ExtHostLanguages {
    _documents;
    _commands;
    _uriTransformer;
    _proxy;
    _languageIds = [];
    constructor(mainContext, _documents, _commands, _uriTransformer) {
        this._documents = _documents;
        this._commands = _commands;
        this._uriTransformer = _uriTransformer;
        this._proxy = mainContext.getProxy(MainContext.MainThreadLanguages);
    }
    $acceptLanguageIds(ids) {
        this._languageIds = ids;
    }
    async getLanguages() {
        return this._languageIds.slice(0);
    }
    async changeLanguage(uri, languageId) {
        await this._proxy.$changeLanguage(uri, languageId);
        const data = this._documents.getDocumentData(uri);
        if (!data) {
            throw new Error(`document '${uri.toString()}' NOT found`);
        }
        return data.document;
    }
    async tokenAtPosition(document, position) {
        const versionNow = document.version;
        const pos = typeConvert.Position.from(position);
        const info = await this._proxy.$tokensAtPosition(document.uri, pos);
        const defaultRange = {
            type: StandardTokenType.Other,
            range: document.getWordRangeAtPosition(position) ?? new Range(position.line, position.character, position.line, position.character)
        };
        if (!info) {
            // no result
            return defaultRange;
        }
        const result = {
            range: typeConvert.Range.to(info.range),
            type: typeConvert.TokenType.to(info.type)
        };
        if (!result.range.contains(position)) {
            // bogous result
            return defaultRange;
        }
        if (versionNow !== document.version) {
            // concurrent change
            return defaultRange;
        }
        return result;
    }
    _handlePool = 0;
    _ids = new Set();
    createLanguageStatusItem(extension, id, selector) {
        const handle = this._handlePool++;
        const proxy = this._proxy;
        const ids = this._ids;
        // enforce extension unique identifier
        const fullyQualifiedId = `${extension.identifier.value}/${id}`;
        if (ids.has(fullyQualifiedId)) {
            throw new Error(`LanguageStatusItem with id '${id}' ALREADY exists`);
        }
        ids.add(fullyQualifiedId);
        const data = {
            selector,
            id,
            name: extension.displayName ?? extension.name,
            severity: LanguageStatusSeverity.Information,
            command: undefined,
            text: '',
            detail: '',
            busy: false
        };
        let soonHandle;
        const commandDisposables = new DisposableStore();
        const updateAsync = () => {
            soonHandle?.dispose();
            soonHandle = disposableTimeout(() => {
                commandDisposables.clear();
                this._proxy.$setLanguageStatus(handle, {
                    id: fullyQualifiedId,
                    name: data.name ?? extension.displayName ?? extension.name,
                    source: extension.displayName ?? extension.name,
                    selector: typeConvert.DocumentSelector.from(data.selector, this._uriTransformer),
                    label: data.text,
                    detail: data.detail ?? '',
                    severity: data.severity === LanguageStatusSeverity.Error ? Severity.Error : data.severity === LanguageStatusSeverity.Warning ? Severity.Warning : Severity.Info,
                    command: data.command && this._commands.toInternal(data.command, commandDisposables),
                    accessibilityInfo: data.accessibilityInformation,
                    busy: data.busy
                });
            }, 0);
        };
        const result = {
            dispose() {
                commandDisposables.dispose();
                soonHandle?.dispose();
                proxy.$removeLanguageStatus(handle);
                ids.delete(fullyQualifiedId);
            },
            get id() {
                return data.id;
            },
            get name() {
                return data.name;
            },
            set name(value) {
                data.name = value;
                updateAsync();
            },
            get selector() {
                return data.selector;
            },
            set selector(value) {
                data.selector = value;
                updateAsync();
            },
            get text() {
                return data.text;
            },
            set text(value) {
                data.text = value;
                updateAsync();
            },
            get detail() {
                return data.detail;
            },
            set detail(value) {
                data.detail = value;
                updateAsync();
            },
            get severity() {
                return data.severity;
            },
            set severity(value) {
                data.severity = value;
                updateAsync();
            },
            get accessibilityInformation() {
                return data.accessibilityInformation;
            },
            set accessibilityInformation(value) {
                data.accessibilityInformation = value;
                updateAsync();
            },
            get command() {
                return data.command;
            },
            set command(value) {
                data.command = value;
                updateAsync();
            },
            get busy() {
                return data.busy;
            },
            set busy(value) {
                data.busy = value;
                updateAsync();
            }
        };
        updateAsync();
        return result;
    }
}
