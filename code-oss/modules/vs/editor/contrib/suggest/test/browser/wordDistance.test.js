/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { mock } from 'vs/base/test/common/mock';
import { DEFAULT_WORD_REGEXP } from 'vs/editor/common/core/wordHelper';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { EditorSimpleWorker } from 'vs/editor/common/services/editorSimpleWorker';
import { EditorWorkerService } from 'vs/editor/browser/services/editorWorkerService';
import { CompletionItem } from 'vs/editor/contrib/suggest/browser/suggest';
import { WordDistance } from 'vs/editor/contrib/suggest/browser/wordDistance';
import { createCodeEditorServices, instantiateTestCodeEditor } from 'vs/editor/test/browser/testCodeEditor';
import { instantiateTextModel } from 'vs/editor/test/common/testTextModel';
import { TestLanguageConfigurationService } from 'vs/editor/test/common/modes/testLanguageConfigurationService';
import { NullLogService } from 'vs/platform/log/common/log';
import { LanguageFeaturesService } from 'vs/editor/common/services/languageFeaturesService';
import { ILanguageService } from 'vs/editor/common/languages/language';
suite('suggest, word distance', function () {
    let distance;
    const disposables = new DisposableStore();
    setup(async function () {
        const languageId = 'bracketMode';
        disposables.clear();
        const instantiationService = createCodeEditorServices(disposables);
        const languageConfigurationService = instantiationService.get(ILanguageConfigurationService);
        const languageService = instantiationService.get(ILanguageService);
        disposables.add(languageService.registerLanguage({ id: languageId }));
        disposables.add(languageConfigurationService.register(languageId, {
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')'],
            ]
        }));
        const model = disposables.add(instantiateTextModel(instantiationService, 'function abc(aa, ab){\na\n}', languageId, undefined, URI.parse('test:///some.path')));
        const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model));
        editor.updateOptions({ suggest: { localityBonus: true } });
        editor.setPosition({ lineNumber: 2, column: 2 });
        const modelService = new class extends mock() {
            onModelRemoved = Event.None;
            getModel(uri) {
                return uri.toString() === model.uri.toString() ? model : null;
            }
        };
        const service = new class extends EditorWorkerService {
            _worker = new EditorSimpleWorker(new class extends mock() {
            }, null);
            constructor() {
                super(modelService, new class extends mock() {
                }, new NullLogService(), new TestLanguageConfigurationService(), new LanguageFeaturesService());
                this._worker.acceptNewModel({
                    url: model.uri.toString(),
                    lines: model.getLinesContent(),
                    EOL: model.getEOL(),
                    versionId: model.getVersionId()
                });
                model.onDidChangeContent(e => this._worker.acceptModelChanged(model.uri.toString(), e));
            }
            computeWordRanges(resource, range) {
                return this._worker.computeWordRanges(resource.toString(), range, DEFAULT_WORD_REGEXP.source, DEFAULT_WORD_REGEXP.flags);
            }
        };
        distance = await WordDistance.create(service, editor);
        disposables.add(service);
    });
    teardown(function () {
        disposables.clear();
    });
    function createSuggestItem(label, overwriteBefore, position) {
        const suggestion = {
            label,
            range: { startLineNumber: position.lineNumber, startColumn: position.column - overwriteBefore, endLineNumber: position.lineNumber, endColumn: position.column },
            insertText: label,
            kind: 0
        };
        const container = {
            suggestions: [suggestion]
        };
        const provider = {
            provideCompletionItems() {
                return;
            }
        };
        return new CompletionItem(position, suggestion, container, provider);
    }
    test('Suggest locality bonus can boost current word #90515', function () {
        const pos = { lineNumber: 2, column: 2 };
        const d1 = distance.distance(pos, createSuggestItem('a', 1, pos).completion);
        const d2 = distance.distance(pos, createSuggestItem('aa', 1, pos).completion);
        const d3 = distance.distance(pos, createSuggestItem('ab', 1, pos).completion);
        assert.ok(d1 > d2);
        assert.ok(d2 === d3);
    });
});
