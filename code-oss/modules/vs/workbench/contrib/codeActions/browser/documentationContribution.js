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
import { Disposable } from 'vs/base/common/lifecycle';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { CodeActionKind } from 'vs/editor/contrib/codeAction/common/types';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
let CodeActionDocumentationContribution = class CodeActionDocumentationContribution extends Disposable {
    contextKeyService;
    contributions = [];
    emptyCodeActionsList = {
        actions: [],
        dispose: () => { }
    };
    constructor(extensionPoint, contextKeyService, languageFeaturesService) {
        super();
        this.contextKeyService = contextKeyService;
        this._register(languageFeaturesService.codeActionProvider.register('*', this));
        extensionPoint.setHandler(points => {
            this.contributions = [];
            for (const documentation of points) {
                if (!documentation.value.refactoring) {
                    continue;
                }
                for (const contribution of documentation.value.refactoring) {
                    const precondition = ContextKeyExpr.deserialize(contribution.when);
                    if (!precondition) {
                        continue;
                    }
                    this.contributions.push({
                        title: contribution.title,
                        when: precondition,
                        command: contribution.command
                    });
                }
            }
        });
    }
    async provideCodeActions(_model, _range, context, _token) {
        return this.emptyCodeActionsList;
    }
    _getAdditionalMenuItems(context, actions) {
        if (context.only !== CodeActionKind.Refactor.value) {
            if (!actions.some(action => action.kind && CodeActionKind.Refactor.contains(new CodeActionKind(action.kind)))) {
                return [];
            }
        }
        return this.contributions
            .filter(contribution => this.contextKeyService.contextMatchesRules(contribution.when))
            .map(contribution => {
            return {
                id: contribution.command,
                title: contribution.title
            };
        });
    }
};
CodeActionDocumentationContribution = __decorate([
    __param(1, IContextKeyService),
    __param(2, ILanguageFeaturesService)
], CodeActionDocumentationContribution);
export { CodeActionDocumentationContribution };
