import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorPlaceholder, IEditorPlaceholderContents } from 'vs/workbench/browser/parts/editor/editorPlaceholder';
export interface IOpenCallbacks {
    openInternal: (input: EditorInput, options: IEditorOptions | undefined) => Promise<void>;
}
export declare abstract class BaseBinaryResourceEditor extends EditorPlaceholder {
    private readonly callbacks;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: import("vs/base/common/event").Event<void>;
    private readonly _onDidOpenInPlace;
    readonly onDidOpenInPlace: import("vs/base/common/event").Event<void>;
    private metadata;
    constructor(id: string, callbacks: IOpenCallbacks, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, instantiationService: IInstantiationService);
    getTitle(): string;
    protected getContents(input: EditorInput, options: IEditorOptions): Promise<IEditorPlaceholderContents>;
    private handleMetadataChanged;
    getMetadata(): string | undefined;
}
