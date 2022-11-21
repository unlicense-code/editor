import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionRecommendationReson } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
export declare type ExtensionRecommendation = {
    readonly extensionId: string;
    readonly reason: IExtensionRecommendationReson;
};
export declare abstract class ExtensionRecommendations extends Disposable {
    readonly abstract recommendations: ReadonlyArray<ExtensionRecommendation>;
    protected abstract doActivate(): Promise<void>;
    private _activationPromise;
    get activated(): boolean;
    activate(): Promise<void>;
}
