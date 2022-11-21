/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { TerminalUriLinkDetector } from 'vs/workbench/contrib/terminal/browser/links/terminalUriLinkDetector';
import { assertLinkHelper, resolveLinkForTest } from 'vs/workbench/contrib/terminal/test/browser/links/linkTestUtils';
import { Terminal } from 'xterm';
suite('Workbench - TerminalUriLinkDetector', () => {
    let configurationService;
    let detector;
    let xterm;
    setup(() => {
        const instantiationService = new TestInstantiationService();
        configurationService = new TestConfigurationService();
        instantiationService.stub(IConfigurationService, configurationService);
        xterm = new Terminal({ allowProposedApi: true, cols: 80, rows: 30 });
        detector = instantiationService.createInstance(TerminalUriLinkDetector, xterm, resolveLinkForTest);
    });
    async function assertLink(type, text, expected) {
        await assertLinkHelper(text, expected, detector, type);
    }
    const linkComputerCases = [
        ["Url" /* TerminalBuiltinLinkType.Url */, 'x = "http://foo.bar";', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'x = (http://foo.bar);', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'x = \'http://foo.bar\';', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'x =  http://foo.bar ;', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'x = <http://foo.bar>;', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'x = {http://foo.bar};', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '(see http://foo.bar)', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '[see http://foo.bar]', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '{see http://foo.bar}', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '<see http://foo.bar>', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '<url>http://foo.bar</url>', [{ range: [[6, 1], [19, 1]], text: 'http://foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '// Click here to learn more. https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409', [{ range: [[30, 1], [7, 2]], text: 'https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '// Click here to learn more. https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx', [{ range: [[30, 1], [28, 2]], text: 'https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '// https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js', [{ range: [[4, 1], [9, 2]], text: 'https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '<!-- !!! Do not remove !!!   WebContentRef(link:https://go.microsoft.com/fwlink/?LinkId=166007, area:Admin, updated:2015, nextUpdate:2016, tags:SqlServer)   !!! Do not remove !!! -->', [{ range: [[49, 1], [14, 2]], text: 'https://go.microsoft.com/fwlink/?LinkId=166007' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'For instructions, see https://go.microsoft.com/fwlink/?LinkId=166007.</value>', [{ range: [[23, 1], [68, 1]], text: 'https://go.microsoft.com/fwlink/?LinkId=166007' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'For instructions, see https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx.</value>', [{ range: [[23, 1], [21, 2]], text: 'https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'x = "https://en.wikipedia.org/wiki/Zürich";', [{ range: [[6, 1], [41, 1]], text: 'https://en.wikipedia.org/wiki/Zürich' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '請參閱 http://go.microsoft.com/fwlink/?LinkId=761051。', [{ range: [[8, 1], [53, 1]], text: 'http://go.microsoft.com/fwlink/?LinkId=761051' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '（請參閱 http://go.microsoft.com/fwlink/?LinkId=761051）', [{ range: [[10, 1], [55, 1]], text: 'http://go.microsoft.com/fwlink/?LinkId=761051' }]],
        ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file:///foo.bar";', [{ range: [[6, 1], [20, 1]], text: 'file:///foo.bar' }]],
        ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file://c:/foo.bar";', [{ range: [[6, 1], [22, 1]], text: 'file://c:/foo.bar' }]],
        ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file://shares/foo.bar";', [{ range: [[6, 1], [26, 1]], text: 'file://shares/foo.bar' }]],
        ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file://shäres/foo.bar";', [{ range: [[6, 1], [26, 1]], text: 'file://shäres/foo.bar' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'Some text, then http://www.bing.com.', [{ range: [[17, 1], [35, 1]], text: 'http://www.bing.com' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'let url = `http://***/_api/web/lists/GetByTitle(\'Teambuildingaanvragen\')/items`;', [{ range: [[12, 1], [78, 1]], text: 'http://***/_api/web/lists/GetByTitle(\'Teambuildingaanvragen\')/items' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '7. At this point, ServiceMain has been called.  There is no functionality presently in ServiceMain, but you can consult the [MSDN documentation](https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx) to add functionality as desired!', [{ range: [[66, 2], [64, 3]], text: 'https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'let x = "http://[::1]:5000/connect/token"', [{ range: [[10, 1], [40, 1]], text: 'http://[::1]:5000/connect/token' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, '2. Navigate to **https://portal.azure.com**', [{ range: [[18, 1], [41, 1]], text: 'https://portal.azure.com' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'POST|https://portal.azure.com|2019-12-05|', [{ range: [[6, 1], [29, 1]], text: 'https://portal.azure.com' }]],
        ["Url" /* TerminalBuiltinLinkType.Url */, 'aa  https://foo.bar/[this is foo site]  aa', [{ range: [[5, 1], [38, 1]], text: 'https://foo.bar/[this is foo site]' }]]
    ];
    for (const c of linkComputerCases) {
        test('link computer case: `' + c[1] + '`', async () => {
            await assertLink(c[0], c[1], c[2]);
        });
    }
    test('should support multiple link results', async () => {
        await assertLink("Url" /* TerminalBuiltinLinkType.Url */, 'http://foo.bar http://bar.foo', [
            { range: [[1, 1], [14, 1]], text: 'http://foo.bar' },
            { range: [[16, 1], [29, 1]], text: 'http://bar.foo' }
        ]);
    });
    test('should detect file:// links with :line suffix', async () => {
        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'file:///c:/folder/file:23', [
            { range: [[1, 1], [25, 1]], text: 'file:///c:/folder/file:23' }
        ]);
    });
    test('should detect file:// links with :line:col suffix', async () => {
        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'file:///c:/folder/file:23:10', [
            { range: [[1, 1], [28, 1]], text: 'file:///c:/folder/file:23:10' }
        ]);
    });
    test('should filter out https:// link that exceed 4096 characters', async () => {
        // 8 + 200 * 10 = 2008 characters
        await assertLink("Url" /* TerminalBuiltinLinkType.Url */, `https://${'foobarbaz/'.repeat(200)}`, [{
                range: [[1, 1], [8, 26]],
                text: `https://${'foobarbaz/'.repeat(200)}`
            }]);
        // 8 + 450 * 10 = 4508 characters
        await assertLink("Url" /* TerminalBuiltinLinkType.Url */, `https://${'foobarbaz/'.repeat(450)}`, []);
    });
    test('should filter out file:// links that exceed 4096 characters', async () => {
        // 8 + 200 * 10 = 2008 characters
        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `file:///${'foobarbaz/'.repeat(200)}`, [{
                text: `file:///${'foobarbaz/'.repeat(200)}`,
                range: [[1, 1], [8, 26]]
            }]);
        // 8 + 450 * 10 = 4508 characters
        await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `file:///${'foobarbaz/'.repeat(450)}`, []);
    });
});
