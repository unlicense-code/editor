import { ITestItemChildren, TestItemCollection } from 'vs/workbench/contrib/testing/common/testItemCollection';
import { ITestItemContext } from 'vs/workbench/contrib/testing/common/testTypes';
import type * as vscode from 'vscode';
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
export declare const toItemFromContext: (context: ITestItemContext) => TestItemImpl;
export declare class TestItemImpl implements vscode.TestItem {
    readonly id: string;
    readonly uri: vscode.Uri | undefined;
    readonly children: ITestItemChildren<vscode.TestItem>;
    readonly parent: TestItemImpl | undefined;
    range: vscode.Range | undefined;
    description: string | undefined;
    sortText: string | undefined;
    label: string;
    error: string | vscode.MarkdownString;
    busy: boolean;
    canResolveChildren: boolean;
    tags: readonly vscode.TestTag[];
    /**
     * Note that data is deprecated and here for back-compat only
     */
    constructor(controllerId: string, id: string, label: string, uri: vscode.Uri | undefined);
}
export declare class TestItemRootImpl extends TestItemImpl {
    readonly _isRoot = true;
    constructor(controllerId: string, label: string);
}
export declare class ExtHostTestItemCollection extends TestItemCollection<TestItemImpl> {
    constructor(controllerId: string, controllerLabel: string, editors: ExtHostDocumentsAndEditors);
}
