import { IEditorConfiguration } from 'vs/editor/common/config/editorConfiguration';
import { ViewEventHandler } from 'vs/editor/common/viewEventHandler';
import { IViewLayout, IViewModel } from 'vs/editor/common/viewModel';
import { IColorTheme } from 'vs/platform/theme/common/themeService';
import { EditorTheme } from 'vs/editor/common/editorTheme';
export declare class ViewContext {
    readonly configuration: IEditorConfiguration;
    readonly viewModel: IViewModel;
    readonly viewLayout: IViewLayout;
    readonly theme: EditorTheme;
    constructor(configuration: IEditorConfiguration, theme: IColorTheme, model: IViewModel);
    addEventHandler(eventHandler: ViewEventHandler): void;
    removeEventHandler(eventHandler: ViewEventHandler): void;
}
