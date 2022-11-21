import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { BracketPairColorizationOptions, DefaultEndOfLine, ITextBufferFactory } from 'vs/editor/common/model';
import { TextModel } from 'vs/editor/common/model/textModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceIdCtorPair, TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
declare class TestTextModel extends TextModel {
    registerDisposable(disposable: IDisposable): void;
}
export declare function withEditorModel(text: string[], callback: (model: TextModel) => void): void;
export interface IRelaxedTextModelCreationOptions {
    tabSize?: number;
    indentSize?: number;
    insertSpaces?: boolean;
    detectIndentation?: boolean;
    trimAutoWhitespace?: boolean;
    defaultEOL?: DefaultEndOfLine;
    isForSimpleWidget?: boolean;
    largeFileOptimizations?: boolean;
    bracketColorizationOptions?: BracketPairColorizationOptions;
}
export declare function createTextModel(text: string | ITextBufferFactory, languageId?: string | null, options?: IRelaxedTextModelCreationOptions, uri?: URI | null): TextModel;
export declare function instantiateTextModel(instantiationService: IInstantiationService, text: string | ITextBufferFactory, languageId?: string | null, _options?: IRelaxedTextModelCreationOptions, uri?: URI | null): TestTextModel;
export declare function createModelServices(disposables: DisposableStore, services?: ServiceIdCtorPair<any>[]): TestInstantiationService;
export {};
