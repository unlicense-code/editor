/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { settingKeyToDisplayFormat, parseQuery } from 'vs/workbench/contrib/preferences/browser/settingsTreeModels';
suite('SettingsTree', () => {
    test('settingKeyToDisplayFormat', () => {
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.bar'), {
            category: 'Foo',
            label: 'Bar'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.bar.etc'), {
            category: 'Foo › Bar',
            label: 'Etc'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('fooBar.etcSomething'), {
            category: 'Foo Bar',
            label: 'Etc Something'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo'), {
            category: '',
            label: 'Foo'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.1leading.number'), {
            category: 'Foo › 1leading',
            label: 'Number'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.1Leading.number'), {
            category: 'Foo › 1 Leading',
            label: 'Number'
        });
    });
    test('settingKeyToDisplayFormat - with category', () => {
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.bar', 'foo'), {
            category: '',
            label: 'Bar'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('disableligatures.ligatures', 'disableligatures'), {
            category: '',
            label: 'Ligatures'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.bar.etc', 'foo'), {
            category: 'Bar',
            label: 'Etc'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('fooBar.etcSomething', 'foo'), {
            category: 'Foo Bar',
            label: 'Etc Something'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.bar.etc', 'foo/bar'), {
            category: '',
            label: 'Etc'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('foo.bar.etc', 'something/foo'), {
            category: 'Bar',
            label: 'Etc'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('bar.etc', 'something.bar'), {
            category: '',
            label: 'Etc'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('fooBar.etc', 'fooBar'), {
            category: '',
            label: 'Etc'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('fooBar.somethingElse.etc', 'fooBar'), {
            category: 'Something Else',
            label: 'Etc'
        });
    });
    test('settingKeyToDisplayFormat - known acronym/term', () => {
        assert.deepStrictEqual(settingKeyToDisplayFormat('css.someCssSetting'), {
            category: 'CSS',
            label: 'Some CSS Setting'
        });
        assert.deepStrictEqual(settingKeyToDisplayFormat('powershell.somePowerShellSetting'), {
            category: 'PowerShell',
            label: 'Some PowerShell Setting'
        });
    });
    test('parseQuery', () => {
        function testParseQuery(input, expected) {
            assert.deepStrictEqual(parseQuery(input), expected, input);
        }
        testParseQuery('', {
            tags: [],
            extensionFilters: [],
            query: '',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@modified', {
            tags: ['modified'],
            extensionFilters: [],
            query: '',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@tag:foo', {
            tags: ['foo'],
            extensionFilters: [],
            query: '',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@modified foo', {
            tags: ['modified'],
            extensionFilters: [],
            query: 'foo',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@tag:foo @modified', {
            tags: ['foo', 'modified'],
            extensionFilters: [],
            query: '',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@tag:foo @modified my query', {
            tags: ['foo', 'modified'],
            extensionFilters: [],
            query: 'my query',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('test @modified query', {
            tags: ['modified'],
            extensionFilters: [],
            query: 'test  query',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('test @modified', {
            tags: ['modified'],
            extensionFilters: [],
            query: 'test',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('query has @ for some reason', {
            tags: [],
            extensionFilters: [],
            query: 'query has @ for some reason',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@ext:github.vscode-pull-request-github', {
            tags: [],
            extensionFilters: ['github.vscode-pull-request-github'],
            query: '',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@ext:github.vscode-pull-request-github,vscode.git', {
            tags: [],
            extensionFilters: ['github.vscode-pull-request-github', 'vscode.git'],
            query: '',
            featureFilters: [],
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@feature:scm', {
            tags: [],
            extensionFilters: [],
            featureFilters: ['scm'],
            query: '',
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@feature:scm,terminal', {
            tags: [],
            extensionFilters: [],
            featureFilters: ['scm', 'terminal'],
            query: '',
            idFilters: [],
            languageFilter: undefined
        });
        testParseQuery('@id:files.autoSave', {
            tags: [],
            extensionFilters: [],
            featureFilters: [],
            query: '',
            idFilters: ['files.autoSave'],
            languageFilter: undefined
        });
        testParseQuery('@id:files.autoSave,terminal.integrated.commandsToSkipShell', {
            tags: [],
            extensionFilters: [],
            featureFilters: [],
            query: '',
            idFilters: ['files.autoSave', 'terminal.integrated.commandsToSkipShell'],
            languageFilter: undefined
        });
        testParseQuery('@lang:cpp', {
            tags: [],
            extensionFilters: [],
            featureFilters: [],
            query: '',
            idFilters: [],
            languageFilter: 'cpp'
        });
        testParseQuery('@lang:cpp,python', {
            tags: [],
            extensionFilters: [],
            featureFilters: [],
            query: '',
            idFilters: [],
            languageFilter: 'cpp'
        });
    });
});
