import { Event } from 'vs/base/common/event';
export interface IHistoryNavigationWidget {
    readonly element: HTMLElement;
    showPreviousValue(): void;
    showNextValue(): void;
    onDidFocus: Event<void>;
    onDidBlur: Event<void>;
}
