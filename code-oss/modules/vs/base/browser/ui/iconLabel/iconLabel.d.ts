import 'vs/css!./iconlabel';
import { IHoverDelegate } from 'vs/base/browser/ui/iconLabel/iconHoverDelegate';
import { ITooltipMarkdownString } from 'vs/base/browser/ui/iconLabel/iconLabelHover';
import { IMatch } from 'vs/base/common/filters';
import { Disposable } from 'vs/base/common/lifecycle';
export interface IIconLabelCreationOptions {
    readonly supportHighlights?: boolean;
    readonly supportDescriptionHighlights?: boolean;
    readonly supportIcons?: boolean;
    readonly hoverDelegate?: IHoverDelegate;
}
export interface IIconLabelValueOptions {
    title?: string | ITooltipMarkdownString;
    descriptionTitle?: string;
    hideIcon?: boolean;
    extraClasses?: readonly string[];
    italic?: boolean;
    strikethrough?: boolean;
    matches?: readonly IMatch[];
    labelEscapeNewLines?: boolean;
    descriptionMatches?: readonly IMatch[];
    disabledCommand?: boolean;
    readonly separator?: string;
    readonly domId?: string;
}
export declare class IconLabel extends Disposable {
    private readonly creationOptions?;
    private readonly domNode;
    private readonly nameNode;
    private descriptionNode;
    private readonly labelContainer;
    private readonly hoverDelegate;
    private readonly customHovers;
    constructor(container: HTMLElement, options?: IIconLabelCreationOptions);
    get element(): HTMLElement;
    setLabel(label: string | string[], description?: string, options?: IIconLabelValueOptions): void;
    private setupHover;
    dispose(): void;
    private getOrCreateDescriptionNode;
}
