/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { mock } from 'vs/base/test/common/mock';
import { NullLogService } from 'vs/platform/log/common/log';
import { NullApiDeprecationService } from 'vs/workbench/api/common/extHostApiDeprecationService';
import { ExtHostWebviews } from 'vs/workbench/api/common/extHostWebview';
import { ExtHostWebviewPanels } from 'vs/workbench/api/common/extHostWebviewPanels';
import { decodeAuthority, webviewResourceBaseHost } from 'vs/workbench/contrib/webview/common/webview';
import { SingleProxyRPCProtocol } from 'vs/workbench/api/test/common/testRPCProtocol';
suite('ExtHostWebview', () => {
    let rpcProtocol;
    setup(() => {
        const shape = createNoopMainThreadWebviews();
        rpcProtocol = SingleProxyRPCProtocol(shape);
    });
    test('Cannot register multiple serializers for the same view type', async () => {
        const viewType = 'view.type';
        const extHostWebviews = new ExtHostWebviews(rpcProtocol, { authority: undefined, isRemote: false }, undefined, new NullLogService(), NullApiDeprecationService);
        const extHostWebviewPanels = new ExtHostWebviewPanels(rpcProtocol, extHostWebviews, undefined);
        let lastInvokedDeserializer = undefined;
        class NoopSerializer {
            async deserializeWebviewPanel(_webview, _state) {
                lastInvokedDeserializer = this;
            }
        }
        const extension = {};
        const serializerA = new NoopSerializer();
        const serializerB = new NoopSerializer();
        const serializerARegistration = extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerA);
        await extHostWebviewPanels.$deserializeWebviewPanel('x', viewType, {
            title: 'title',
            state: {},
            panelOptions: {},
            webviewOptions: {},
            active: true,
        }, 0);
        assert.strictEqual(lastInvokedDeserializer, serializerA);
        assert.throws(() => extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB), 'Should throw when registering two serializers for the same view');
        serializerARegistration.dispose();
        extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB);
        await extHostWebviewPanels.$deserializeWebviewPanel('x', viewType, {
            title: 'title',
            state: {},
            panelOptions: {},
            webviewOptions: {},
            active: true,
        }, 0);
        assert.strictEqual(lastInvokedDeserializer, serializerB);
    });
    test('asWebviewUri for local file paths', () => {
        const webview = createWebview(rpcProtocol, /* remoteAuthority */ undefined);
        assert.strictEqual((webview.webview.asWebviewUri(URI.parse('file:///Users/codey/file.html')).toString()), `https://file%2B.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html`, 'Unix basic');
        assert.strictEqual((webview.webview.asWebviewUri(URI.parse('file:///Users/codey/file.html#frag')).toString()), `https://file%2B.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html#frag`, 'Unix should preserve fragment');
        assert.strictEqual((webview.webview.asWebviewUri(URI.parse('file:///Users/codey/f%20ile.html')).toString()), `https://file%2B.vscode-resource.${webviewResourceBaseHost}/Users/codey/f%20ile.html`, 'Unix with encoding');
        assert.strictEqual((webview.webview.asWebviewUri(URI.parse('file://localhost/Users/codey/file.html')).toString()), `https://file%2Blocalhost.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html`, 'Unix should preserve authority');
        assert.strictEqual((webview.webview.asWebviewUri(URI.parse('file:///c:/codey/file.txt')).toString()), `https://file%2B.vscode-resource.${webviewResourceBaseHost}/c%3A/codey/file.txt`, 'Windows C drive');
    });
    test('asWebviewUri for remote file paths', () => {
        const webview = createWebview(rpcProtocol, /* remoteAuthority */ 'remote');
        assert.strictEqual((webview.webview.asWebviewUri(URI.parse('file:///Users/codey/file.html')).toString()), `https://vscode-remote%2Bremote.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html`, 'Unix basic');
    });
    test('asWebviewUri for remote with / and + in name', () => {
        const webview = createWebview(rpcProtocol, /* remoteAuthority */ 'remote');
        const authority = 'ssh-remote+localhost=foo/bar';
        const sourceUri = URI.from({
            scheme: 'vscode-remote',
            authority: authority,
            path: '/Users/cody/x.png'
        });
        const webviewUri = webview.webview.asWebviewUri(sourceUri);
        assert.strictEqual(webviewUri.toString(), `https://vscode-remote%2Bssh-002dremote-002blocalhost-003dfoo-002fbar.vscode-resource.vscode-cdn.net/Users/cody/x.png`, 'Check transform');
        assert.strictEqual(decodeAuthority(webviewUri.authority), `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`, 'Check decoded authority');
    });
    test('asWebviewUri for remote with port in name', () => {
        const webview = createWebview(rpcProtocol, /* remoteAuthority */ 'remote');
        const authority = 'localhost:8080';
        const sourceUri = URI.from({
            scheme: 'vscode-remote',
            authority: authority,
            path: '/Users/cody/x.png'
        });
        const webviewUri = webview.webview.asWebviewUri(sourceUri);
        assert.strictEqual(webviewUri.toString(), `https://vscode-remote%2Blocalhost-003a8080.vscode-resource.vscode-cdn.net/Users/cody/x.png`, 'Check transform');
        assert.strictEqual(decodeAuthority(webviewUri.authority), `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`, 'Check decoded authority');
    });
});
function createWebview(rpcProtocol, remoteAuthority) {
    const extHostWebviews = new ExtHostWebviews(rpcProtocol, {
        authority: remoteAuthority,
        isRemote: !!remoteAuthority,
    }, undefined, new NullLogService(), NullApiDeprecationService);
    const extHostWebviewPanels = new ExtHostWebviewPanels(rpcProtocol, extHostWebviews, undefined);
    const webview = extHostWebviewPanels.createWebviewPanel({
        extensionLocation: URI.from({
            scheme: remoteAuthority ? Schemas.vscodeRemote : Schemas.file,
            authority: remoteAuthority,
            path: '/ext/path',
        })
    }, 'type', 'title', 1, {});
    return webview;
}
function createNoopMainThreadWebviews() {
    return new class extends mock() {
        $createWebviewPanel() { }
        $registerSerializer() { }
        $unregisterSerializer() { }
    };
}
