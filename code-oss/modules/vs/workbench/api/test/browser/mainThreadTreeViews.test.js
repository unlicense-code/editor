/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { mock } from 'vs/base/test/common/mock';
import { Extensions, IViewDescriptorService, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { NullLogService } from 'vs/platform/log/common/log';
import { MainThreadTreeViews } from 'vs/workbench/api/browser/mainThreadTreeViews';
import { TestViewsService, workbenchInstantiationService } from 'vs/workbench/test/browser/workbenchTestServices';
import { TestExtensionService } from 'vs/workbench/test/common/workbenchTestServices';
import { TestNotificationService } from 'vs/platform/notification/test/common/testNotificationService';
import { Registry } from 'vs/platform/registry/common/platform';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { ViewDescriptorService } from 'vs/workbench/services/views/browser/viewDescriptorService';
import { CustomTreeView } from 'vs/workbench/browser/parts/views/treeView';
import { DisposableStore } from 'vs/base/common/lifecycle';
suite('MainThreadHostTreeView', function () {
    const testTreeViewId = 'testTreeView';
    const customValue = 'customValue';
    const ViewsRegistry = Registry.as(Extensions.ViewsRegistry);
    class MockExtHostTreeViewsShape extends mock() {
        async $getChildren(treeViewId, treeItemHandle) {
            return [{ handle: 'testItem1', collapsibleState: TreeItemCollapsibleState.Expanded, customProp: customValue }];
        }
        async $hasResolve() {
            return false;
        }
        $setVisible() { }
    }
    let container;
    let mainThreadTreeViews;
    let extHostTreeViewsShape;
    let disposables;
    setup(async () => {
        disposables = new DisposableStore();
        const instantiationService = workbenchInstantiationService(undefined, disposables);
        const viewDescriptorService = instantiationService.createInstance(ViewDescriptorService);
        instantiationService.stub(IViewDescriptorService, viewDescriptorService);
        container = Registry.as(Extensions.ViewContainersRegistry).registerViewContainer({ id: 'testContainer', title: 'test', ctorDescriptor: new SyncDescriptor({}) }, 0 /* ViewContainerLocation.Sidebar */);
        const viewDescriptor = {
            id: testTreeViewId,
            ctorDescriptor: null,
            name: 'Test View 1',
            treeView: instantiationService.createInstance(CustomTreeView, 'testTree', 'Test Title', 'extension.id'),
        };
        ViewsRegistry.registerViews([viewDescriptor], container);
        const testExtensionService = new TestExtensionService();
        extHostTreeViewsShape = new MockExtHostTreeViewsShape();
        mainThreadTreeViews = new MainThreadTreeViews(new class {
            remoteAuthority = '';
            extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
            dispose() { }
            assertRegistered() { }
            set(v) { return null; }
            getProxy() {
                return extHostTreeViewsShape;
            }
            drain() { return null; }
        }, new TestViewsService(), new TestNotificationService(), testExtensionService, new NullLogService());
        mainThreadTreeViews.$registerTreeViewDataProvider(testTreeViewId, { showCollapseAll: false, canSelectMany: false, dropMimeTypes: [], dragMimeTypes: [], hasHandleDrag: false, hasHandleDrop: false });
        await testExtensionService.whenInstalledExtensionsRegistered();
    });
    teardown(() => {
        ViewsRegistry.deregisterViews(ViewsRegistry.getViews(container), container);
        disposables.dispose();
    });
    test('getChildren keeps custom properties', async () => {
        const treeView = ViewsRegistry.getView(testTreeViewId).treeView;
        const children = await treeView.dataProvider?.getChildren({ handle: 'root', collapsibleState: TreeItemCollapsibleState.Expanded });
        assert(children.length === 1, 'Exactly one child should be returned');
        assert(children[0].customProp === customValue, 'Tree Items should keep custom properties');
    });
});
