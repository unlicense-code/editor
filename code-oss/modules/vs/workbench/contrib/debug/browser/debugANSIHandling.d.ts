import { LinkDetector } from 'vs/workbench/contrib/debug/browser/linkDetector';
import { RGBA } from 'vs/base/common/color';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
/**
 * @param text The content to stylize.
 * @returns An {@link HTMLSpanElement} that contains the potentially stylized text.
 */
export declare function handleANSIOutput(text: string, linkDetector: LinkDetector, themeService: IThemeService, workspaceFolder: IWorkspaceFolder | undefined): HTMLSpanElement;
/**
 * @param root The {@link HTMLElement} to append the content to.
 * @param stringContent The text content to be appended.
 * @param cssClasses The list of CSS styles to apply to the text content.
 * @param linkDetector The {@link LinkDetector} responsible for generating links from {@param stringContent}.
 * @param customTextColor If provided, will apply custom color with inline style.
 * @param customBackgroundColor If provided, will apply custom backgroundColor with inline style.
 * @param customUnderlineColor If provided, will apply custom textDecorationColor with inline style.
 */
export declare function appendStylizedStringToContainer(root: HTMLElement, stringContent: string, cssClasses: string[], linkDetector: LinkDetector, workspaceFolder: IWorkspaceFolder | undefined, customTextColor?: RGBA, customBackgroundColor?: RGBA, customUnderlineColor?: RGBA): void;
/**
 * Calculate the color from the color set defined in the ANSI 8-bit standard.
 * Standard and high intensity colors are not defined in the standard as specific
 * colors, so these and invalid colors return `undefined`.
 * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit } for info.
 * @param colorNumber The number (ranging from 16 to 255) referring to the color
 * desired.
 */
export declare function calcANSI8bitColor(colorNumber: number): RGBA | undefined;
