import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionHostProfile, IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IExtensionHostProfileService, ProfileSessionState } from 'vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IProductService } from 'vs/platform/product/common/productService';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export declare class ExtensionHostProfileService extends Disposable implements IExtensionHostProfileService {
    private readonly _extensionService;
    private readonly _editorService;
    private readonly _instantiationService;
    private readonly _nativeHostService;
    private readonly _dialogService;
    private readonly _statusbarService;
    private readonly _productService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeState;
    readonly onDidChangeState: Event<void>;
    private readonly _onDidChangeLastProfile;
    readonly onDidChangeLastProfile: Event<void>;
    private readonly _unresponsiveProfiles;
    private _profile;
    private _profileSession;
    private _state;
    private profilingStatusBarIndicator;
    private readonly profilingStatusBarIndicatorLabelUpdater;
    get state(): ProfileSessionState;
    get lastProfile(): IExtensionHostProfile | null;
    constructor(_extensionService: IExtensionService, _editorService: IEditorService, _instantiationService: IInstantiationService, _nativeHostService: INativeHostService, _dialogService: IDialogService, _statusbarService: IStatusbarService, _productService: IProductService);
    private _setState;
    private updateProfilingStatusBarIndicator;
    startProfiling(): Promise<any>;
    stopProfiling(): void;
    private _setLastProfile;
    getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    setUnresponsiveProfile(extensionId: ExtensionIdentifier, profile: IExtensionHostProfile): void;
}