import { Event } from 'vs/base/common/event';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { ILifecycleMainService, LifecycleMainPhase, ShutdownEvent } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { ICodeWindow, UnloadReason } from 'vs/platform/window/electron-main/window';
export declare class TestLifecycleMainService implements ILifecycleMainService {
    _serviceBrand: undefined;
    onBeforeShutdown: Event<any>;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<ShutdownEvent>;
    fireOnWillShutdown(): Promise<void>;
    onWillLoadWindow: Event<any>;
    onBeforeCloseWindow: Event<any>;
    wasRestarted: boolean;
    quitRequested: boolean;
    phase: LifecycleMainPhase;
    registerWindow(window: ICodeWindow): void;
    reload(window: ICodeWindow, cli?: NativeParsedArgs): Promise<void>;
    unload(window: ICodeWindow, reason: UnloadReason): Promise<boolean>;
    relaunch(options?: {
        addArgs?: string[] | undefined;
        removeArgs?: string[] | undefined;
    }): Promise<void>;
    quit(willRestart?: boolean): Promise<boolean>;
    kill(code?: number): Promise<void>;
    when(phase: LifecycleMainPhase): Promise<void>;
}
export declare class InMemoryTestStateMainService implements IStateMainService {
    _serviceBrand: undefined;
    private readonly data;
    setItem(key: string, data?: object | string | number | boolean | undefined | null): void;
    setItems(items: readonly {
        key: string;
        data?: object | string | number | boolean | undefined | null;
    }[]): void;
    getItem<T>(key: string): T | undefined;
    removeItem(key: string): void;
    close(): Promise<void>;
}
