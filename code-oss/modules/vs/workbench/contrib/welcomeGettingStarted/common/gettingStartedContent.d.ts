import 'vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker';
import 'vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
export declare type BuiltinGettingStartedStep = {
    id: string;
    title: string;
    description: string;
    completionEvents?: string[];
    when?: string;
    media: {
        type: 'image';
        path: string | {
            hc: string;
            hcLight?: string;
            light: string;
            dark: string;
        };
        altText: string;
    } | {
        type: 'svg';
        path: string;
        altText: string;
    } | {
        type: 'markdown';
        path: string;
    };
};
export declare type BuiltinGettingStartedCategory = {
    id: string;
    title: string;
    description: string;
    isFeatured: boolean;
    next?: string;
    icon: ThemeIcon;
    when?: string;
    content: {
        type: 'steps';
        steps: BuiltinGettingStartedStep[];
    };
};
export declare type BuiltinGettingStartedStartEntry = {
    id: string;
    title: string;
    description: string;
    icon: ThemeIcon;
    when?: string;
    content: {
        type: 'startEntry';
        command: string;
    };
};
declare type GettingStartedWalkthroughContent = BuiltinGettingStartedCategory[];
declare type GettingStartedStartEntryContent = BuiltinGettingStartedStartEntry[];
export declare const startEntries: GettingStartedStartEntryContent;
export declare const walkthroughs: GettingStartedWalkthroughContent;
export {};
