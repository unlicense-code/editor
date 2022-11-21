import { SinonStub } from 'sinon';
export interface Ctor<T> {
    new (): T;
}
export declare function mock<T>(): Ctor<T>;
export declare type MockObject<T, ExceptProps = never> = {
    [K in keyof T]: K extends ExceptProps ? T[K] : SinonStub;
};
export declare const mockObject: <T extends object>() => <TP extends Partial<T> = {}>(properties?: TP | undefined) => MockObject<T, keyof TP>;
