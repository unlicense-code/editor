/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isLinux, isMacintosh, isNative, isWeb, isWindows } from 'vs/base/common/platform';
export const WindowMinimumSize = {
    WIDTH: 400,
    WIDTH_WITH_VERTICAL_PANEL: 600,
    HEIGHT: 270
};
export function isWorkspaceToOpen(uriToOpen) {
    return !!uriToOpen.workspaceUri;
}
export function isFolderToOpen(uriToOpen) {
    return !!uriToOpen.folderUri;
}
export function isFileToOpen(uriToOpen) {
    return !!uriToOpen.fileUri;
}
export function getMenuBarVisibility(configurationService) {
    const titleBarStyle = getTitleBarStyle(configurationService);
    const menuBarVisibility = configurationService.getValue('window.menuBarVisibility');
    if (menuBarVisibility === 'default' || (titleBarStyle === 'native' && menuBarVisibility === 'compact') || (isMacintosh && isNative)) {
        return 'classic';
    }
    else {
        return menuBarVisibility;
    }
}
export function getTitleBarStyle(configurationService) {
    if (isWeb) {
        return 'custom';
    }
    const configuration = configurationService.getValue('window');
    if (configuration) {
        const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
        if (useNativeTabs) {
            return 'native'; // native tabs on sierra do not work with custom title style
        }
        const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
        if (useSimpleFullScreen) {
            return 'native'; // simple fullscreen does not work well with custom title style (https://github.com/microsoft/vscode/issues/63291)
        }
        const style = configuration.titleBarStyle;
        if (style === 'native' || style === 'custom') {
            return style;
        }
    }
    return isLinux ? 'native' : 'custom'; // default to custom on all macOS and Windows
}
export function useWindowControlsOverlay(configurationService) {
    if (!isWindows || isWeb) {
        return false; // only supported on a desktop Windows instance
    }
    if (getTitleBarStyle(configurationService) === 'native') {
        return false; // only supported when title bar is custom
    }
    const configuredUseWindowControlsOverlay = configurationService.getValue('window.experimental.windowControlsOverlay.enabled');
    if (typeof configuredUseWindowControlsOverlay === 'boolean') {
        return configuredUseWindowControlsOverlay;
    }
    return false; // disable by default
}
/**
 * According to Electron docs: `scale := 1.2 ^ level`.
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
 */
export function zoomLevelToZoomFactor(zoomLevel = 0) {
    return Math.pow(1.2, zoomLevel);
}
