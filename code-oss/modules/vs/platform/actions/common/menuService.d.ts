import { IMenu, IMenuCreateOptions, IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class MenuService implements IMenuService {
    private readonly _commandService;
    readonly _serviceBrand: undefined;
    private readonly _hiddenStates;
    constructor(_commandService: ICommandService, storageService: IStorageService);
    createMenu(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuCreateOptions): IMenu;
    resetHiddenStates(ids?: MenuId[]): void;
}
