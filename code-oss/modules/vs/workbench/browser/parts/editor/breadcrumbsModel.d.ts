import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { FileKind } from 'vs/platform/files/common/files';
import { IOutline, IOutlineService } from 'vs/workbench/services/outline/browser/outline';
import { IEditorPane } from 'vs/workbench/common/editor';
export declare class FileElement {
    readonly uri: URI;
    readonly kind: FileKind;
    constructor(uri: URI, kind: FileKind);
}
export declare class OutlineElement2 {
    readonly element: IOutline<any> | any;
    readonly outline: IOutline<any>;
    constructor(element: IOutline<any> | any, outline: IOutline<any>);
}
export declare class BreadcrumbsModel {
    readonly resource: URI;
    private readonly _workspaceService;
    private readonly _outlineService;
    private readonly _disposables;
    private _fileInfo;
    private readonly _cfgFilePath;
    private readonly _cfgSymbolPath;
    private readonly _currentOutline;
    private readonly _outlineDisposables;
    private readonly _onDidUpdate;
    readonly onDidUpdate: Event<this>;
    constructor(resource: URI, editor: IEditorPane | undefined, configurationService: IConfigurationService, _workspaceService: IWorkspaceContextService, _outlineService: IOutlineService);
    dispose(): void;
    isRelative(): boolean;
    getElements(): ReadonlyArray<FileElement | OutlineElement2>;
    private _initFilePathInfo;
    private _onDidChangeWorkspaceFolders;
    private _bindToEditor;
}
