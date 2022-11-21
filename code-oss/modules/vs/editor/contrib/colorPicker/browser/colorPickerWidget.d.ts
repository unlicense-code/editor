import { Widget } from 'vs/base/browser/ui/widget';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./colorPicker';
import { ColorPickerModel } from 'vs/editor/contrib/colorPicker/browser/colorPickerModel';
import { IEditorHoverColorPickerWidget } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export declare class ColorPickerHeader extends Disposable {
    private readonly model;
    private readonly domNode;
    private readonly pickedColorNode;
    private backgroundColor;
    constructor(container: HTMLElement, model: ColorPickerModel, themeService: IThemeService);
    private onDidChangeColor;
    private onDidChangePresentation;
}
export declare class ColorPickerBody extends Disposable {
    private readonly model;
    private pixelRatio;
    private readonly domNode;
    private readonly saturationBox;
    private readonly hueStrip;
    private readonly opacityStrip;
    constructor(container: HTMLElement, model: ColorPickerModel, pixelRatio: number);
    private flushColor;
    private onDidSaturationValueChange;
    private onDidOpacityChange;
    private onDidHueChange;
    layout(): void;
}
export declare class ColorPickerWidget extends Widget implements IEditorHoverColorPickerWidget {
    readonly model: ColorPickerModel;
    private pixelRatio;
    private static readonly ID;
    body: ColorPickerBody;
    constructor(container: Node, model: ColorPickerModel, pixelRatio: number, themeService: IThemeService);
    getId(): string;
    layout(): void;
}
