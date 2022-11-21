import { AutorunObserver } from 'vs/base/common/observableImpl/autorun';
import { IObservable, ObservableValue, TransactionImpl } from 'vs/base/common/observableImpl/base';
import { Derived } from 'vs/base/common/observableImpl/derived';
import { FromEventObservable } from 'vs/base/common/observableImpl/utils';
export declare function setLogger(logger: IObservableLogger): void;
export declare function getLogger(): IObservableLogger | undefined;
interface IChangeInformation {
    oldValue: unknown;
    newValue: unknown;
    change: unknown;
    didChange: boolean;
}
export interface IObservableLogger {
    handleObservableChanged(observable: ObservableValue<unknown, unknown>, info: IChangeInformation): void;
    handleFromEventObservableTriggered(observable: FromEventObservable<any, any>, info: IChangeInformation): void;
    handleAutorunCreated(autorun: AutorunObserver): void;
    handleAutorunTriggered(autorun: AutorunObserver): void;
    handleDerivedCreated(observable: Derived<unknown>): void;
    handleDerivedRecomputed(observable: Derived<unknown>, info: IChangeInformation): void;
    handleBeginTransaction(transaction: TransactionImpl): void;
    handleEndTransaction(): void;
}
export declare class ConsoleObservableLogger implements IObservableLogger {
    private indentation;
    private textToConsoleArgs;
    private formatInfo;
    handleObservableChanged(observable: IObservable<unknown, unknown>, info: IChangeInformation): void;
    private readonly changedObservablesSets;
    formatChanges(changes: Set<IObservable<any, any>>): ConsoleText | undefined;
    handleDerivedCreated(derived: Derived<unknown>): void;
    handleDerivedRecomputed(derived: Derived<unknown>, info: IChangeInformation): void;
    handleFromEventObservableTriggered(observable: FromEventObservable<any, any>, info: IChangeInformation): void;
    handleAutorunCreated(autorun: AutorunObserver): void;
    handleAutorunTriggered(autorun: AutorunObserver): void;
    handleBeginTransaction(transaction: TransactionImpl): void;
    handleEndTransaction(): void;
}
declare type ConsoleText = (ConsoleText | undefined)[] | {
    text: string;
    style: string;
    data?: Record<string, unknown>;
} | {
    data: Record<string, unknown>;
};
export {};
