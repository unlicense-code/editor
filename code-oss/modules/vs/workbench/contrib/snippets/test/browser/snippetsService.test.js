/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { SnippetCompletionProvider } from 'vs/workbench/contrib/snippets/browser/snippetCompletionProvider';
import { Position } from 'vs/editor/common/core/position';
import { createModelServices, instantiateTextModel } from 'vs/editor/test/common/testTextModel';
import { Snippet } from 'vs/workbench/contrib/snippets/browser/snippetsFile';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { TestLanguageConfigurationService } from 'vs/editor/test/common/modes/testLanguageConfigurationService';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { generateUuid } from 'vs/base/common/uuid';
class SimpleSnippetService {
    snippets;
    constructor(snippets) {
        this.snippets = snippets;
    }
    getSnippets() {
        return Promise.resolve(this.getSnippetsSync());
    }
    getSnippetsSync() {
        return this.snippets;
    }
    getSnippetFiles() {
        throw new Error();
    }
    isEnabled() {
        throw new Error();
    }
    updateEnablement() {
        throw new Error();
    }
    updateUsageTimestamp(snippet) {
        throw new Error();
    }
}
suite('SnippetsService', function () {
    const context = { triggerKind: 0 /* CompletionTriggerKind.Invoke */ };
    let disposables;
    let instantiationService;
    let languageService;
    let snippetService;
    setup(function () {
        disposables = new DisposableStore();
        instantiationService = createModelServices(disposables);
        languageService = instantiationService.get(ILanguageService);
        disposables.add(languageService.registerLanguage({
            id: 'fooLang',
            extensions: ['.fooLang',]
        }));
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'barTest', 'bar', '', 'barCodeSnippet', '', 1 /* SnippetSource.User */, generateUuid()), new Snippet(false, ['fooLang'], 'bazzTest', 'bazz', '', 'bazzCodeSnippet', '', 1 /* SnippetSource.User */, generateUuid())]);
    });
    teardown(() => {
        disposables.dispose();
    });
    test('snippet completions - simple', function () {
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, '', 'fooLang'));
        return provider.provideCompletionItems(model, new Position(1, 1), context).then(result => {
            assert.strictEqual(result.incomplete, undefined);
            assert.strictEqual(result.suggestions.length, 2);
        });
    });
    test('snippet completions - simple 2', async function () {
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'hello ', 'fooLang'));
        await provider.provideCompletionItems(model, new Position(1, 6) /* hello| */, context).then(result => {
            assert.strictEqual(result.incomplete, undefined);
            assert.strictEqual(result.suggestions.length, 0);
        });
        await provider.provideCompletionItems(model, new Position(1, 7) /* hello |*/, context).then(result => {
            assert.strictEqual(result.incomplete, undefined);
            assert.strictEqual(result.suggestions.length, 2);
        });
    });
    test('snippet completions - with prefix', function () {
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'bar', 'fooLang'));
        return provider.provideCompletionItems(model, new Position(1, 4), context).then(result => {
            assert.strictEqual(result.incomplete, undefined);
            assert.strictEqual(result.suggestions.length, 1);
            assert.deepStrictEqual(result.suggestions[0].label, {
                label: 'bar',
                description: 'barTest'
            });
            assert.strictEqual(result.suggestions[0].range.insert.startColumn, 1);
            assert.strictEqual(result.suggestions[0].insertText, 'barCodeSnippet');
        });
    });
    test('snippet completions - with different prefixes', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'barTest', 'bar', '', 's1', '', 1 /* SnippetSource.User */, generateUuid()), new Snippet(false, ['fooLang'], 'name', 'bar-bar', '', 's2', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'bar-bar', 'fooLang'));
        await provider.provideCompletionItems(model, new Position(1, 3), context).then(result => {
            assert.strictEqual(result.incomplete, undefined);
            assert.strictEqual(result.suggestions.length, 2);
            assert.deepStrictEqual(result.suggestions[0].label, {
                label: 'bar',
                description: 'barTest'
            });
            assert.strictEqual(result.suggestions[0].insertText, 's1');
            assert.strictEqual(result.suggestions[0].range.insert.startColumn, 1);
            assert.deepStrictEqual(result.suggestions[1].label, {
                label: 'bar-bar',
                description: 'name'
            });
            assert.strictEqual(result.suggestions[1].insertText, 's2');
            assert.strictEqual(result.suggestions[1].range.insert.startColumn, 1);
        });
        await provider.provideCompletionItems(model, new Position(1, 5), context).then(result => {
            assert.strictEqual(result.incomplete, undefined);
            assert.strictEqual(result.suggestions.length, 2);
            const [first, second] = result.suggestions;
            assert.deepStrictEqual(first.label, {
                label: 'bar',
                description: 'barTest'
            });
            assert.strictEqual(first.insertText, 's1');
            assert.strictEqual(first.range.insert.startColumn, 5);
            assert.deepStrictEqual(second.label, {
                label: 'bar-bar',
                description: 'name'
            });
            assert.strictEqual(second.insertText, 's2');
            assert.strictEqual(second.range.insert.startColumn, 1);
        });
        await provider.provideCompletionItems(model, new Position(1, 6), context).then(result => {
            assert.strictEqual(result.incomplete, undefined);
            assert.strictEqual(result.suggestions.length, 2);
            assert.deepStrictEqual(result.suggestions[0].label, {
                label: 'bar',
                description: 'barTest'
            });
            assert.strictEqual(result.suggestions[0].insertText, 's1');
            assert.strictEqual(result.suggestions[0].range.insert.startColumn, 5);
            assert.deepStrictEqual(result.suggestions[1].label, {
                label: 'bar-bar',
                description: 'name'
            });
            assert.strictEqual(result.suggestions[1].insertText, 's2');
            assert.strictEqual(result.suggestions[1].range.insert.startColumn, 1);
        });
    });
    test('Cannot use "<?php" as user snippet prefix anymore, #26275', function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], '', '<?php', '', 'insert me', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        let model = instantiateTextModel(instantiationService, '\t<?php', 'fooLang');
        return provider.provideCompletionItems(model, new Position(1, 7), context).then(result => {
            assert.strictEqual(result.suggestions.length, 1);
            model.dispose();
            model = instantiateTextModel(instantiationService, '\t<?', 'fooLang');
            return provider.provideCompletionItems(model, new Position(1, 4), context);
        }).then(result => {
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
            model.dispose();
            model = instantiateTextModel(instantiationService, 'a<?', 'fooLang');
            return provider.provideCompletionItems(model, new Position(1, 4), context);
        }).then(result => {
            assert.strictEqual(result.suggestions.length, 1);
            assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
            model.dispose();
        });
    });
    test('No user snippets in suggestions, when inside the code, #30508', function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], '', 'foo', '', '<foo>$0</foo>', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, '<head>\n\t\n>/head>', 'fooLang'));
        return provider.provideCompletionItems(model, new Position(1, 1), context).then(result => {
            assert.strictEqual(result.suggestions.length, 1);
            return provider.provideCompletionItems(model, new Position(2, 2), context);
        }).then(result => {
            assert.strictEqual(result.suggestions.length, 1);
        });
    });
    test('SnippetSuggest - ensure extension snippets come last ', function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'second', 'second', '', 'second', '', 3 /* SnippetSource.Extension */, generateUuid()), new Snippet(false, ['fooLang'], 'first', 'first', '', 'first', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, '', 'fooLang'));
        return provider.provideCompletionItems(model, new Position(1, 1), context).then(result => {
            assert.strictEqual(result.suggestions.length, 2);
            const [first, second] = result.suggestions;
            assert.deepStrictEqual(first.label, {
                label: 'first',
                description: 'first'
            });
            assert.deepStrictEqual(second.label, {
                label: 'second',
                description: 'second'
            });
        });
    });
    test('Dash in snippets prefix broken #53945', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'p-a', 'p-a', '', 'second', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'p-', 'fooLang'));
        let result = await provider.provideCompletionItems(model, new Position(1, 2), context);
        assert.strictEqual(result.suggestions.length, 1);
        result = await provider.provideCompletionItems(model, new Position(1, 3), context);
        assert.strictEqual(result.suggestions.length, 1);
        result = await provider.provideCompletionItems(model, new Position(1, 3), context);
        assert.strictEqual(result.suggestions.length, 1);
    });
    test('No snippets suggestion on long lines beyond character 100 #58807', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b', 'fooLang'));
        const result = await provider.provideCompletionItems(model, new Position(1, 158), context);
        assert.strictEqual(result.suggestions.length, 1);
    });
    test('Type colon will trigger snippet #60746', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, ':', 'fooLang'));
        const result = await provider.provideCompletionItems(model, new Position(1, 2), context);
        assert.strictEqual(result.suggestions.length, 0);
    });
    test('substring of prefix can\'t trigger snippet #60737', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'mytemplate', 'mytemplate', '', 'second', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'template', 'fooLang'));
        const result = await provider.provideCompletionItems(model, new Position(1, 9), context);
        assert.strictEqual(result.suggestions.length, 1);
        assert.deepStrictEqual(result.suggestions[0].label, {
            label: 'mytemplate',
            description: 'mytemplate'
        });
    });
    test('No snippets suggestion beyond character 100 if not at end of line #60247', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b text_after_b', 'fooLang'));
        const result = await provider.provideCompletionItems(model, new Position(1, 158), context);
        assert.strictEqual(result.suggestions.length, 1);
    });
    test('issue #61296: VS code freezes when editing CSS file with emoji', async function () {
        const languageConfigurationService = new TestLanguageConfigurationService();
        disposables.add(languageConfigurationService.register('fooLang', {
            wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]*(?=[^,{;]*[,{]))|(([@#.!])?[\w-?]+%?|[@#!.])/g
        }));
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'bug', '-a-bug', '', 'second', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, languageConfigurationService);
        const model = disposables.add(instantiateTextModel(instantiationService, '.🐷-a-b', 'fooLang'));
        const result = await provider.provideCompletionItems(model, new Position(1, 8), context);
        assert.strictEqual(result.suggestions.length, 1);
    });
    test('No snippets shown when triggering completions at whitespace on line that already has text #62335', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = disposables.add(instantiateTextModel(instantiationService, 'a ', 'fooLang'));
        const result = await provider.provideCompletionItems(model, new Position(1, 3), context);
        assert.strictEqual(result.suggestions.length, 1);
    });
    test('Snippet prefix with special chars and numbers does not work #62906', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'noblockwdelay', '<<', '', '<= #dly"', '', 1 /* SnippetSource.User */, generateUuid()), new Snippet(false, ['fooLang'], 'noblockwdelay', '11', '', 'eleven', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        let model = instantiateTextModel(instantiationService, ' <', 'fooLang');
        let result = await provider.provideCompletionItems(model, new Position(1, 3), context);
        assert.strictEqual(result.suggestions.length, 1);
        let [first] = result.suggestions;
        assert.strictEqual(first.range.insert.startColumn, 2);
        model.dispose();
        model = instantiateTextModel(instantiationService, '1', 'fooLang');
        result = await provider.provideCompletionItems(model, new Position(1, 2), context);
        assert.strictEqual(result.suggestions.length, 1);
        [first] = result.suggestions;
        assert.strictEqual(first.range.insert.startColumn, 1);
        model.dispose();
    });
    test('Snippet replace range', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'notWordTest', 'not word', '', 'not word snippet', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        let model = instantiateTextModel(instantiationService, 'not wordFoo bar', 'fooLang');
        let result = await provider.provideCompletionItems(model, new Position(1, 3), context);
        assert.strictEqual(result.suggestions.length, 1);
        let [first] = result.suggestions;
        assert.strictEqual(first.range.insert.endColumn, 3);
        assert.strictEqual(first.range.replace.endColumn, 9);
        model.dispose();
        model = instantiateTextModel(instantiationService, 'not woFoo bar', 'fooLang');
        result = await provider.provideCompletionItems(model, new Position(1, 3), context);
        assert.strictEqual(result.suggestions.length, 1);
        [first] = result.suggestions;
        assert.strictEqual(first.range.insert.endColumn, 3);
        assert.strictEqual(first.range.replace.endColumn, 3);
        model.dispose();
        model = instantiateTextModel(instantiationService, 'not word', 'fooLang');
        result = await provider.provideCompletionItems(model, new Position(1, 1), context);
        assert.strictEqual(result.suggestions.length, 1);
        [first] = result.suggestions;
        assert.strictEqual(first.range.insert.endColumn, 1);
        assert.strictEqual(first.range.replace.endColumn, 9);
        model.dispose();
    });
    test('Snippet replace-range incorrect #108894', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'eng', 'eng', '', '<span></span>', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, 'filler e KEEP ng filler', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 9), context);
        assert.strictEqual(result.suggestions.length, 1);
        const [first] = result.suggestions;
        assert.strictEqual(first.range.insert.endColumn, 9);
        assert.strictEqual(first.range.replace.endColumn, 9);
        model.dispose();
    });
    test('Snippet will replace auto-closing pair if specified in prefix', async function () {
        const languageConfigurationService = new TestLanguageConfigurationService();
        disposables.add(languageConfigurationService.register('fooLang', {
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')'],
            ]
        }));
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'PSCustomObject', '[PSCustomObject]', '', '[PSCustomObject] @{ Key = Value }', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, languageConfigurationService);
        const model = instantiateTextModel(instantiationService, '[psc]', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 5), context);
        assert.strictEqual(result.suggestions.length, 1);
        const [first] = result.suggestions;
        assert.strictEqual(first.range.insert.endColumn, 5);
        // This is 6 because it should eat the `]` at the end of the text even if cursor is before it
        assert.strictEqual(first.range.replace.endColumn, 6);
        model.dispose();
    });
    test('Leading whitespace in snippet prefix #123860', async function () {
        snippetService = new SimpleSnippetService([new Snippet(false, ['fooLang'], 'cite-name', ' cite', '', '~\\cite{$CLIPBOARD}', '', 1 /* SnippetSource.User */, generateUuid())]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, ' ci', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 4), context);
        assert.strictEqual(result.suggestions.length, 1);
        const [first] = result.suggestions;
        assert.strictEqual(first.label.label, ' cite');
        assert.strictEqual(first.range.insert.startColumn, 1);
        model.dispose();
    });
    test('still show suggestions in string when disable string suggestion #136611', async function () {
        snippetService = new SimpleSnippetService([
            new Snippet(false, ['fooLang'], 'aaa', 'aaa', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], 'bbb', 'bbb', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            // new Snippet(['fooLang'], '\'ccc', '\'ccc', '', 'value', '', SnippetSource.User, generateUuid())
        ]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, '\'\'', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 2), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '\'' });
        assert.strictEqual(result.suggestions.length, 0);
        model.dispose();
    });
    test('still show suggestions in string when disable string suggestion #136611', async function () {
        snippetService = new SimpleSnippetService([
            new Snippet(false, ['fooLang'], 'aaa', 'aaa', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], 'bbb', 'bbb', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], '\'ccc', '\'ccc', '', 'value', '', 1 /* SnippetSource.User */, generateUuid())
        ]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, '\'\'', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 2), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '\'' });
        assert.strictEqual(result.suggestions.length, 1);
        model.dispose();
    });
    test('Snippet suggestions are too eager #138707 (word)', async function () {
        snippetService = new SimpleSnippetService([
            new Snippet(false, ['fooLang'], 'tys', 'tys', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], 'hell_or_tell', 'hell_or_tell', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], '^y', '^y', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
        ]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, '\'hellot\'', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 8), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
        assert.strictEqual(result.suggestions.length, 1);
        assert.strictEqual(result.suggestions[0].label.label, 'hell_or_tell');
        model.dispose();
    });
    test('Snippet suggestions are too eager #138707 (no word)', async function () {
        snippetService = new SimpleSnippetService([
            new Snippet(false, ['fooLang'], 'tys', 'tys', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], 't', 't', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], '^y', '^y', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
        ]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, ')*&^', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 5), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
        assert.strictEqual(result.suggestions.length, 1);
        assert.strictEqual(result.suggestions[0].label.label, '^y');
        model.dispose();
    });
    test('Snippet suggestions are too eager #138707 (word/word)', async function () {
        snippetService = new SimpleSnippetService([
            new Snippet(false, ['fooLang'], 'async arrow function', 'async arrow function', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], 'foobarrrrrr', 'foobarrrrrr', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
        ]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, 'foobar', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 7), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
        assert.strictEqual(result.suggestions.length, 1);
        assert.strictEqual(result.suggestions[0].label.label, 'foobarrrrrr');
        model.dispose();
    });
    test('Strange and useless autosuggestion #region/#endregion PHP #140039', async function () {
        snippetService = new SimpleSnippetService([
            new Snippet(false, ['fooLang'], 'reg', '#region', '', 'value', '', 1 /* SnippetSource.User */, generateUuid()),
        ]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, 'function abc(w)', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 15), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
        assert.strictEqual(result.suggestions.length, 0);
        model.dispose();
    });
    test.skip('Snippets disappear with . key #145960', async function () {
        snippetService = new SimpleSnippetService([
            new Snippet(false, ['fooLang'], 'div', 'div', '', 'div', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], 'div.', 'div.', '', 'div.', '', 1 /* SnippetSource.User */, generateUuid()),
            new Snippet(false, ['fooLang'], 'div#', 'div#', '', 'div#', '', 1 /* SnippetSource.User */, generateUuid()),
        ]);
        const provider = new SnippetCompletionProvider(languageService, snippetService, new TestLanguageConfigurationService());
        const model = instantiateTextModel(instantiationService, 'di', 'fooLang');
        const result = await provider.provideCompletionItems(model, new Position(1, 3), { triggerKind: 0 /* CompletionTriggerKind.Invoke */ });
        assert.strictEqual(result.suggestions.length, 3);
        model.applyEdits([EditOperation.insert(new Position(1, 3), '.')]);
        assert.strictEqual(model.getValue(), 'di.');
        const result2 = await provider.provideCompletionItems(model, new Position(1, 4), { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: '.' });
        assert.strictEqual(result2.suggestions.length, 1);
        assert.strictEqual(result2.suggestions[0].insertText, 'div.');
        model.dispose();
    });
});
