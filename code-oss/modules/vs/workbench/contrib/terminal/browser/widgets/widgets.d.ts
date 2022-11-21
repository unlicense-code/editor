import { IDisposable } from 'vs/base/common/lifecycle';
export interface ITerminalWidget extends IDisposable {
    /**
     * Only one widget of each ID can be displayed at once.
     */
    id: string;
    attach(container: HTMLElement): void;
}
