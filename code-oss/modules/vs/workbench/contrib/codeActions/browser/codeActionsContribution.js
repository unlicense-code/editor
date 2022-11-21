/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { editorConfigurationBaseNode } from 'vs/editor/common/config/editorConfigurationSchema';
import { codeActionCommandId, refactorCommandId, sourceActionCommandId } from 'vs/editor/contrib/codeAction/browser/codeAction';
import { CodeActionKind } from 'vs/editor/contrib/codeAction/common/types';
import * as nls from 'vs/nls';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { Registry } from 'vs/platform/registry/common/platform';
const codeActionsOnSaveDefaultProperties = Object.freeze({
    'source.fixAll': {
        type: 'boolean',
        description: nls.localize('codeActionsOnSave.fixAll', "Controls whether auto fix action should be run on file save.")
    }
});
const codeActionsOnSaveSchema = {
    oneOf: [
        {
            type: 'object',
            properties: codeActionsOnSaveDefaultProperties,
            additionalProperties: {
                type: 'boolean'
            },
        },
        {
            type: 'array',
            items: { type: 'string' }
        }
    ],
    default: {},
    description: nls.localize('codeActionsOnSave', "Code Action kinds to be run on save."),
    scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
};
export const editorConfiguration = Object.freeze({
    ...editorConfigurationBaseNode,
    properties: {
        'editor.codeActionsOnSave': codeActionsOnSaveSchema
    }
});
let CodeActionsContribution = class CodeActionsContribution extends Disposable {
    _contributedCodeActions = [];
    _onDidChangeContributions = this._register(new Emitter());
    constructor(codeActionsExtensionPoint, keybindingService) {
        super();
        codeActionsExtensionPoint.setHandler(extensionPoints => {
            this._contributedCodeActions = extensionPoints.map(x => x.value).flat();
            this.updateConfigurationSchema(this._contributedCodeActions);
            this._onDidChangeContributions.fire();
        });
        keybindingService.registerSchemaContribution({
            getSchemaAdditions: () => this.getSchemaAdditions(),
            onDidChange: this._onDidChangeContributions.event,
        });
    }
    updateConfigurationSchema(codeActionContributions) {
        const newProperties = { ...codeActionsOnSaveDefaultProperties };
        for (const [sourceAction, props] of this.getSourceActions(codeActionContributions)) {
            newProperties[sourceAction] = {
                type: 'boolean',
                description: nls.localize('codeActionsOnSave.generic', "Controls whether '{0}' actions should be run on file save.", props.title)
            };
        }
        codeActionsOnSaveSchema.properties = newProperties;
        Registry.as(Extensions.Configuration)
            .notifyConfigurationSchemaUpdated(editorConfiguration);
    }
    getSourceActions(contributions) {
        const defaultKinds = Object.keys(codeActionsOnSaveDefaultProperties).map(value => new CodeActionKind(value));
        const sourceActions = new Map();
        for (const contribution of contributions) {
            for (const action of contribution.actions) {
                const kind = new CodeActionKind(action.kind);
                if (CodeActionKind.Source.contains(kind)
                    // Exclude any we already included by default
                    && !defaultKinds.some(defaultKind => defaultKind.contains(kind))) {
                    sourceActions.set(kind.value, action);
                }
            }
        }
        return sourceActions;
    }
    getSchemaAdditions() {
        const conditionalSchema = (command, actions) => {
            return {
                if: {
                    properties: {
                        'command': { const: command }
                    }
                },
                then: {
                    properties: {
                        'args': {
                            required: ['kind'],
                            properties: {
                                'kind': {
                                    anyOf: [
                                        {
                                            enum: actions.map(action => action.kind),
                                            enumDescriptions: actions.map(action => action.description ?? action.title),
                                        },
                                        { type: 'string' },
                                    ]
                                }
                            }
                        }
                    }
                }
            };
        };
        const getActions = (ofKind) => {
            const allActions = this._contributedCodeActions.map(desc => desc.actions).flat();
            const out = new Map();
            for (const action of allActions) {
                if (!out.has(action.kind) && ofKind.contains(new CodeActionKind(action.kind))) {
                    out.set(action.kind, action);
                }
            }
            return Array.from(out.values());
        };
        return [
            conditionalSchema(codeActionCommandId, getActions(CodeActionKind.Empty)),
            conditionalSchema(refactorCommandId, getActions(CodeActionKind.Refactor)),
            conditionalSchema(sourceActionCommandId, getActions(CodeActionKind.Source)),
        ];
    }
};
CodeActionsContribution = __decorate([
    __param(1, IKeybindingService)
], CodeActionsContribution);
export { CodeActionsContribution };
