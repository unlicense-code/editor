import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { ExtensionMessageCollector } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ILocalizedString } from 'vs/platform/action/common/action';
declare namespace schema {
    interface IUserFriendlyMenuItem {
        command: string;
        alt?: string;
        when?: string;
        group?: string;
    }
    interface IUserFriendlySubmenuItem {
        submenu: string;
        when?: string;
        group?: string;
    }
    interface IUserFriendlySubmenu {
        id: string;
        label: string;
        icon?: IUserFriendlyIcon;
    }
    function isMenuItem(item: IUserFriendlyMenuItem | IUserFriendlySubmenuItem): item is IUserFriendlyMenuItem;
    function isValidMenuItem(item: IUserFriendlyMenuItem, collector: ExtensionMessageCollector): boolean;
    function isValidSubmenuItem(item: IUserFriendlySubmenuItem, collector: ExtensionMessageCollector): boolean;
    function isValidItems(items: (IUserFriendlyMenuItem | IUserFriendlySubmenuItem)[], collector: ExtensionMessageCollector): boolean;
    function isValidSubmenu(submenu: IUserFriendlySubmenu, collector: ExtensionMessageCollector): boolean;
    const menusContribution: IJSONSchema;
    const submenusContribution: IJSONSchema;
    interface IUserFriendlyCommand {
        command: string;
        title: string | ILocalizedString;
        shortTitle?: string | ILocalizedString;
        enablement?: string;
        category?: string | ILocalizedString;
        icon?: IUserFriendlyIcon;
    }
    type IUserFriendlyIcon = string | {
        light: string;
        dark: string;
    };
    function isValidCommand(command: IUserFriendlyCommand, collector: ExtensionMessageCollector): boolean;
    const commandsContribution: IJSONSchema;
}
export declare const commandsExtensionPoint: import("vs/workbench/services/extensions/common/extensionsRegistry").IExtensionPoint<schema.IUserFriendlyCommand | schema.IUserFriendlyCommand[]>;
export {};
