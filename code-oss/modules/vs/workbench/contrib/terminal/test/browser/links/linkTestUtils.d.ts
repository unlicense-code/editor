import { ITerminalLinkDetector, ITerminalSimpleLink, ResolvedLink, TerminalLinkType } from 'vs/workbench/contrib/terminal/browser/links/links';
import { URI } from 'vs/base/common/uri';
export declare function assertLinkHelper(text: string, expected: (Pick<ITerminalSimpleLink, 'text'> & {
    range: [number, number][];
})[], detector: ITerminalLinkDetector, expectedType: TerminalLinkType): Promise<void>;
export declare function resolveLinkForTest(link: string, uri?: URI): Promise<ResolvedLink>;
