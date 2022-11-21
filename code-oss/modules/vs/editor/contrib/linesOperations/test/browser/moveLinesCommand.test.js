var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { Selection } from 'vs/editor/common/core/selection';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { LanguageService } from 'vs/editor/common/services/languageService';
import { MoveLinesCommand } from 'vs/editor/contrib/linesOperations/browser/moveLinesCommand';
import { testCommand } from 'vs/editor/test/browser/testCommand';
import { TestLanguageConfigurationService } from 'vs/editor/test/common/modes/testLanguageConfigurationService';
function testMoveLinesDownCommand(lines, selection, expectedLines, expectedSelection, languageConfigurationService = new TestLanguageConfigurationService()) {
    testCommand(lines, null, selection, (accessor, sel) => new MoveLinesCommand(sel, true, 3 /* EditorAutoIndentStrategy.Advanced */, languageConfigurationService), expectedLines, expectedSelection);
}
function testMoveLinesUpCommand(lines, selection, expectedLines, expectedSelection, languageConfigurationService = new TestLanguageConfigurationService()) {
    testCommand(lines, null, selection, (accessor, sel) => new MoveLinesCommand(sel, false, 3 /* EditorAutoIndentStrategy.Advanced */, languageConfigurationService), expectedLines, expectedSelection);
}
function testMoveLinesDownWithIndentCommand(languageId, lines, selection, expectedLines, expectedSelection, languageConfigurationService = new TestLanguageConfigurationService()) {
    testCommand(lines, languageId, selection, (accessor, sel) => new MoveLinesCommand(sel, true, 4 /* EditorAutoIndentStrategy.Full */, languageConfigurationService), expectedLines, expectedSelection);
}
function testMoveLinesUpWithIndentCommand(languageId, lines, selection, expectedLines, expectedSelection, languageConfigurationService = new TestLanguageConfigurationService()) {
    testCommand(lines, languageId, selection, (accessor, sel) => new MoveLinesCommand(sel, false, 4 /* EditorAutoIndentStrategy.Full */, languageConfigurationService), expectedLines, expectedSelection);
}
suite('Editor Contrib - Move Lines Command', () => {
    test('move first up / last down disabled', function () {
        testMoveLinesUpCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(1, 1, 1, 1), [
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(1, 1, 1, 1));
        testMoveLinesDownCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(5, 1, 5, 1), [
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(5, 1, 5, 1));
    });
    test('move first line down', function () {
        testMoveLinesDownCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(1, 4, 1, 1), [
            'second line',
            'first',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(2, 4, 2, 1));
    });
    test('move 2nd line up', function () {
        testMoveLinesUpCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(2, 1, 2, 1), [
            'second line',
            'first',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(1, 1, 1, 1));
    });
    test('issue #1322a: move 2nd line up', function () {
        testMoveLinesUpCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(2, 12, 2, 12), [
            'second line',
            'first',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(1, 12, 1, 12));
    });
    test('issue #1322b: move last line up', function () {
        testMoveLinesUpCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(5, 6, 5, 6), [
            'first',
            'second line',
            'third line',
            'fifth',
            'fourth line'
        ], new Selection(4, 6, 4, 6));
    });
    test('issue #1322c: move last line selected up', function () {
        testMoveLinesUpCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(5, 6, 5, 1), [
            'first',
            'second line',
            'third line',
            'fifth',
            'fourth line'
        ], new Selection(4, 6, 4, 1));
    });
    test('move last line up', function () {
        testMoveLinesUpCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(5, 1, 5, 1), [
            'first',
            'second line',
            'third line',
            'fifth',
            'fourth line'
        ], new Selection(4, 1, 4, 1));
    });
    test('move 4th line down', function () {
        testMoveLinesDownCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(4, 1, 4, 1), [
            'first',
            'second line',
            'third line',
            'fifth',
            'fourth line'
        ], new Selection(5, 1, 5, 1));
    });
    test('move multiple lines down', function () {
        testMoveLinesDownCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(4, 4, 2, 2), [
            'first',
            'fifth',
            'second line',
            'third line',
            'fourth line'
        ], new Selection(5, 4, 3, 2));
    });
    test('invisible selection is ignored', function () {
        testMoveLinesDownCommand([
            'first',
            'second line',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(2, 1, 1, 1), [
            'second line',
            'first',
            'third line',
            'fourth line',
            'fifth'
        ], new Selection(3, 1, 2, 1));
    });
});
let IndentRulesMode = class IndentRulesMode extends Disposable {
    languageId = 'moveLinesIndentMode';
    constructor(indentationRules, languageService, languageConfigurationService) {
        super();
        this._register(languageService.registerLanguage({ id: this.languageId }));
        this._register(languageConfigurationService.register(this.languageId, {
            indentationRules: indentationRules
        }));
    }
};
IndentRulesMode = __decorate([
    __param(1, ILanguageService),
    __param(2, ILanguageConfigurationService)
], IndentRulesMode);
suite('Editor contrib - Move Lines Command honors Indentation Rules', () => {
    const indentRules = {
        decreaseIndentPattern: /^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
        increaseIndentPattern: /(\{[^}"'`]*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
        indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/,
        unIndentedLinePattern: /^(?!.*([;{}]|\S:)\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!.*(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$))/
    };
    // https://github.com/microsoft/vscode/issues/28552#issuecomment-307862797
    test('first line indentation adjust to 0', () => {
        const languageService = new LanguageService();
        const languageConfigurationService = new TestLanguageConfigurationService();
        const mode = new IndentRulesMode(indentRules, languageService, languageConfigurationService);
        testMoveLinesUpWithIndentCommand(mode.languageId, [
            'class X {',
            '\tz = 2',
            '}'
        ], new Selection(2, 1, 2, 1), [
            'z = 2',
            'class X {',
            '}'
        ], new Selection(1, 1, 1, 1), languageConfigurationService);
        mode.dispose();
        languageService.dispose();
    });
    // https://github.com/microsoft/vscode/issues/28552#issuecomment-307867717
    test('move lines across block', () => {
        const languageService = new LanguageService();
        const languageConfigurationService = new TestLanguageConfigurationService();
        const mode = new IndentRulesMode(indentRules, languageService, languageConfigurationService);
        testMoveLinesDownWithIndentCommand(mode.languageId, [
            'const value = 2;',
            'const standardLanguageDescriptions = [',
            '    {',
            '        diagnosticSource: \'js\',',
            '    }',
            '];'
        ], new Selection(1, 1, 1, 1), [
            'const standardLanguageDescriptions = [',
            '    const value = 2;',
            '    {',
            '        diagnosticSource: \'js\',',
            '    }',
            '];'
        ], new Selection(2, 5, 2, 5), languageConfigurationService);
        mode.dispose();
        languageService.dispose();
    });
    test('move line should still work as before if there is no indentation rules', () => {
        testMoveLinesUpWithIndentCommand(null, [
            'if (true) {',
            '    var task = new Task(() => {',
            '        var work = 1234;',
            '    });',
            '}'
        ], new Selection(3, 1, 3, 1), [
            'if (true) {',
            '        var work = 1234;',
            '    var task = new Task(() => {',
            '    });',
            '}'
        ], new Selection(2, 1, 2, 1));
    });
});
let EnterRulesMode = class EnterRulesMode extends Disposable {
    languageId = 'moveLinesEnterMode';
    constructor(languageService, languageConfigurationService) {
        super();
        this._register(languageService.registerLanguage({ id: this.languageId }));
        this._register(languageConfigurationService.register(this.languageId, {
            indentationRules: {
                decreaseIndentPattern: /^\s*\[$/,
                increaseIndentPattern: /^\s*\]$/,
            },
            brackets: [
                ['{', '}']
            ]
        }));
    }
};
EnterRulesMode = __decorate([
    __param(0, ILanguageService),
    __param(1, ILanguageConfigurationService)
], EnterRulesMode);
suite('Editor - contrib - Move Lines Command honors onEnter Rules', () => {
    test('issue #54829. move block across block', () => {
        const languageService = new LanguageService();
        const languageConfigurationService = new TestLanguageConfigurationService();
        const mode = new EnterRulesMode(languageService, languageConfigurationService);
        testMoveLinesDownWithIndentCommand(mode.languageId, [
            'if (true) {',
            '    if (false) {',
            '        if (1) {',
            '            console.log(\'b\');',
            '        }',
            '        console.log(\'a\');',
            '    }',
            '}'
        ], new Selection(3, 9, 5, 10), [
            'if (true) {',
            '    if (false) {',
            '        console.log(\'a\');',
            '        if (1) {',
            '            console.log(\'b\');',
            '        }',
            '    }',
            '}'
        ], new Selection(4, 9, 6, 10), languageConfigurationService);
        mode.dispose();
        languageService.dispose();
    });
});
