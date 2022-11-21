import { EditorConfiguration, IEnvConfiguration } from 'vs/editor/browser/config/editorConfiguration';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { BareFontInfo, FontInfo } from 'vs/editor/common/config/fontInfo';
export declare class TestConfiguration extends EditorConfiguration {
    constructor(opts: IEditorOptions);
    protected _readEnvConfiguration(): IEnvConfiguration;
    protected _readFontInfo(styling: BareFontInfo): FontInfo;
}
