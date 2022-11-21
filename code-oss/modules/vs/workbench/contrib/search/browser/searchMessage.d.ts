import { DisposableStore } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { TextSearchCompleteMessage } from 'vs/workbench/services/search/common/searchExtTypes';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ICommandService } from 'vs/platform/commands/common/commands';
export declare const renderSearchMessage: (message: TextSearchCompleteMessage, instantiationService: IInstantiationService, notificationService: INotificationService, openerService: IOpenerService, commandService: ICommandService, disposableStore: DisposableStore, triggerSearch: () => void) => HTMLElement;
