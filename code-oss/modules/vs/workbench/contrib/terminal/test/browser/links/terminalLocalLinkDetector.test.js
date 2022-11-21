/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { format } from 'vs/base/common/strings';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { TerminalLocalLinkDetector } from 'vs/workbench/contrib/terminal/browser/links/terminalLocalLinkDetector';
import { TerminalCapabilityStore } from 'vs/platform/terminal/common/capabilities/terminalCapabilityStore';
import { assertLinkHelper, resolveLinkForTest } from 'vs/workbench/contrib/terminal/test/browser/links/linkTestUtils';
import { Terminal } from 'xterm';
const unixLinks = [
    '/foo',
    '~/foo',
    './foo',
    './$foo',
    '../foo',
    '/foo/bar',
    '/foo/bar+more',
    'foo/bar',
    'foo/bar+more',
];
const windowsLinks = [
    'c:\\foo',
    '\\\\?\\c:\\foo',
    'c:/foo',
    '.\\foo',
    './foo',
    './$foo',
    '..\\foo',
    '~\\foo',
    '~/foo',
    'c:/foo/bar',
    'c:\\foo\\bar',
    'c:\\foo\\bar+more',
    'c:\\foo/bar\\baz',
    'foo/bar',
    'foo/bar',
    'foo\\bar',
    'foo\\bar+more',
];
const supportedLinkFormats = [
    { urlFormat: '{0}' },
    { urlFormat: '{0} on line {1}', line: '5' },
    { urlFormat: '{0} on line {1}, column {2}', line: '5', column: '3' },
    { urlFormat: '{0}:line {1}', line: '5' },
    { urlFormat: '{0}:line {1}, column {2}', line: '5', column: '3' },
    { urlFormat: '{0}: line {1}', line: '5' },
    { urlFormat: '{0}: line {1}, col {2}', line: '5', column: '3' },
    { urlFormat: '{0}({1})', line: '5' },
    { urlFormat: '{0} ({1})', line: '5' },
    { urlFormat: '{0}({1},{2})', line: '5', column: '3' },
    { urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
    { urlFormat: '{0}({1}, {2})', line: '5', column: '3' },
    { urlFormat: '{0} ({1}, {2})', line: '5', column: '3' },
    { urlFormat: '{0}:{1}', line: '5' },
    { urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
    { urlFormat: '{0} {1}:{2}', line: '5', column: '3' },
    { urlFormat: '{0}[{1}]', line: '5' },
    { urlFormat: '{0} [{1}]', line: '5' },
    { urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
    { urlFormat: '{0} [{1},{2}]', line: '5', column: '3' },
    { urlFormat: '{0}[{1}, {2}]', line: '5', column: '3' },
    { urlFormat: '{0} [{1}, {2}]', line: '5', column: '3' },
    { urlFormat: '{0}",{1}', line: '5' },
    { urlFormat: '{0}\',{1}', line: '5' }
];
suite('Workbench - TerminalLocalLinkDetector', () => {
    let instantiationService;
    let configurationService;
    let detector;
    let xterm;
    async function assertLink(type, text, expected) {
        await assertLinkHelper(text, expected, detector, type);
    }
    setup(() => {
        instantiationService = new TestInstantiationService();
        configurationService = new TestConfigurationService();
        instantiationService.stub(IConfigurationService, configurationService);
        xterm = new Terminal({ allowProposedApi: true, cols: 80, rows: 30 });
    });
    suite('platform independent', () => {
        setup(() => {
            detector = instantiationService.createInstance(TerminalLocalLinkDetector, xterm, new TerminalCapabilityStore(), 3 /* OperatingSystem.Linux */, resolveLinkForTest);
        });
        test('should support multiple link results', async () => {
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, './foo ./bar', [
                { range: [[1, 1], [5, 1]], text: './foo' },
                { range: [[7, 1], [11, 1]], text: './bar' }
            ]);
        });
    });
    suite('macOS/Linux', () => {
        setup(() => {
            detector = instantiationService.createInstance(TerminalLocalLinkDetector, xterm, new TerminalCapabilityStore(), 3 /* OperatingSystem.Linux */, resolveLinkForTest);
        });
        for (const baseLink of unixLinks) {
            suite(`Link: ${baseLink}`, () => {
                for (let i = 0; i < supportedLinkFormats.length; i++) {
                    const linkFormat = supportedLinkFormats[i];
                    test(`Format: ${linkFormat.urlFormat}`, async () => {
                        const formattedLink = format(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, formattedLink, [{ text: formattedLink, range: [[1, 1], [formattedLink.length, 1]] }]);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, ` ${formattedLink} `, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `(${formattedLink})`, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `[${formattedLink}]`, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                    });
                }
            });
        }
        test('Git diff links', async () => {
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `diff --git a/foo/bar b/foo/bar`, [
                { text: 'foo/bar', range: [[14, 1], [20, 1]] },
                { text: 'foo/bar', range: [[24, 1], [30, 1]] }
            ]);
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `--- a/foo/bar`, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `+++ b/foo/bar`, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
        });
    });
    suite('Windows', () => {
        setup(() => {
            detector = instantiationService.createInstance(TerminalLocalLinkDetector, xterm, new TerminalCapabilityStore(), 1 /* OperatingSystem.Windows */, resolveLinkForTest);
        });
        for (const baseLink of windowsLinks) {
            suite(`Link "${baseLink}"`, () => {
                for (let i = 0; i < supportedLinkFormats.length; i++) {
                    const linkFormat = supportedLinkFormats[i];
                    test(`Format: ${linkFormat.urlFormat}`, async () => {
                        const formattedLink = format(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, formattedLink, [{ text: formattedLink, range: [[1, 1], [formattedLink.length, 1]] }]);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, ` ${formattedLink} `, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `(${formattedLink})`, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `[${formattedLink}]`, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                    });
                }
            });
        }
        test('Git diff links', async () => {
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `diff --git a/foo/bar b/foo/bar`, [
                { text: 'foo/bar', range: [[14, 1], [20, 1]] },
                { text: 'foo/bar', range: [[24, 1], [30, 1]] }
            ]);
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `--- a/foo/bar`, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `+++ b/foo/bar`, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
        });
    });
});
