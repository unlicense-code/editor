import { BreadcrumbsWidget } from 'vs/base/browser/ui/breadcrumbs/breadcrumbsWidget';
import { Event } from 'vs/base/common/event';
import * as glob from 'vs/base/common/glob';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationOverrides, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { GroupIdentifier } from 'vs/workbench/common/editor';
export declare const IBreadcrumbsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IBreadcrumbsService>;
export interface IBreadcrumbsService {
    readonly _serviceBrand: undefined;
    register(group: GroupIdentifier, widget: BreadcrumbsWidget): IDisposable;
    getWidget(group: GroupIdentifier): BreadcrumbsWidget | undefined;
}
export declare class BreadcrumbsService implements IBreadcrumbsService {
    readonly _serviceBrand: undefined;
    private readonly _map;
    register(group: number, widget: BreadcrumbsWidget): IDisposable;
    getWidget(group: number): BreadcrumbsWidget | undefined;
}
export declare abstract class BreadcrumbsConfig<T> {
    abstract get name(): string;
    abstract get onDidChange(): Event<void>;
    abstract getValue(overrides?: IConfigurationOverrides): T;
    abstract updateValue(value: T, overrides?: IConfigurationOverrides): Promise<void>;
    abstract dispose(): void;
    private constructor();
    static readonly IsEnabled: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<boolean>;
    };
    static readonly UseQuickPick: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<boolean>;
    };
    static readonly FilePath: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<"on" | "off" | "last">;
    };
    static readonly SymbolPath: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<"on" | "off" | "last">;
    };
    static readonly SymbolSortOrder: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<"type" | "name" | "position">;
    };
    static readonly Icons: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<boolean>;
    };
    static readonly TitleScrollbarSizing: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<"default" | "large" | undefined>;
    };
    static readonly FileExcludes: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<glob.IExpression>;
    };
    private static _stub;
}
