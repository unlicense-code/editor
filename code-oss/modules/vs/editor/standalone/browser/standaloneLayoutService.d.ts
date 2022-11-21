import * as dom from 'vs/base/browser/dom';
import { Event } from 'vs/base/common/event';
import { ILayoutService, ILayoutOffsetInfo } from 'vs/platform/layout/browser/layoutService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
declare class StandaloneLayoutService implements ILayoutService {
    private _codeEditorService;
    readonly _serviceBrand: undefined;
    onDidLayout: Event<any>;
    private _dimension?;
    get dimension(): dom.IDimension;
    get hasContainer(): boolean;
    get container(): HTMLElement;
    focus(): void;
    readonly offset: ILayoutOffsetInfo;
    constructor(_codeEditorService: ICodeEditorService);
}
export declare class EditorScopedLayoutService extends StandaloneLayoutService {
    private _container;
    get hasContainer(): boolean;
    get container(): HTMLElement;
    constructor(_container: HTMLElement, codeEditorService: ICodeEditorService);
}
export {};
