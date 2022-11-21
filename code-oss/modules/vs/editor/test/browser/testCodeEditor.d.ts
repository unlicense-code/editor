import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { EditorConfiguration, IEditorConstructionOptions } from 'vs/editor/browser/config/editorConfiguration';
import { IActiveCodeEditor, ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { View } from 'vs/editor/browser/view';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import * as editorOptions from 'vs/editor/common/config/editorOptions';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ITextBufferFactory, ITextModel } from 'vs/editor/common/model';
import { ViewModel } from 'vs/editor/common/viewModel/viewModelImpl';
import { BrandedService, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
export interface ITestCodeEditor extends IActiveCodeEditor {
    getViewModel(): ViewModel | undefined;
    registerAndInstantiateContribution<T extends IEditorContribution, Services extends BrandedService[]>(id: string, ctor: new (editor: ICodeEditor, ...services: Services) => T): T;
    registerDisposable(disposable: IDisposable): void;
}
export declare class TestCodeEditor extends CodeEditorWidget implements ICodeEditor {
    protected _createConfiguration(isSimpleWidget: boolean, options: Readonly<IEditorConstructionOptions>): EditorConfiguration;
    protected _createView(viewModel: ViewModel): [View, boolean];
    private _hasTextFocus;
    setHasTextFocus(hasTextFocus: boolean): void;
    hasTextFocus(): boolean;
    getViewModel(): ViewModel | undefined;
    registerAndInstantiateContribution<T extends IEditorContribution>(id: string, ctor: new (editor: ICodeEditor, ...services: BrandedService[]) => T): T;
    registerDisposable(disposable: IDisposable): void;
}
export interface TestCodeEditorCreationOptions extends editorOptions.IEditorOptions {
    /**
     * If the editor has text focus.
     * Defaults to true.
     */
    hasTextFocus?: boolean;
}
export interface TestCodeEditorInstantiationOptions extends TestCodeEditorCreationOptions {
    /**
     * Services to use.
     */
    serviceCollection?: ServiceCollection;
}
export declare function withTestCodeEditor(text: ITextModel | string | string[] | ITextBufferFactory, options: TestCodeEditorInstantiationOptions, callback: (editor: ITestCodeEditor, viewModel: ViewModel, instantiationService: TestInstantiationService) => void): void;
export declare function withAsyncTestCodeEditor(text: ITextModel | string | string[] | ITextBufferFactory, options: TestCodeEditorInstantiationOptions, callback: (editor: ITestCodeEditor, viewModel: ViewModel, instantiationService: TestInstantiationService) => Promise<void>): Promise<void>;
export declare function createCodeEditorServices(disposables: DisposableStore, services?: ServiceCollection): TestInstantiationService;
export declare function createTestCodeEditor(model: ITextModel | undefined, options?: TestCodeEditorInstantiationOptions): ITestCodeEditor;
export declare function instantiateTestCodeEditor(instantiationService: IInstantiationService, model: ITextModel | null, options?: TestCodeEditorCreationOptions): ITestCodeEditor;
