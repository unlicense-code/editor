/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var LoadReason;
(function (LoadReason) {
    /**
     * The window is loaded for the first time.
     */
    LoadReason[LoadReason["INITIAL"] = 1] = "INITIAL";
    /**
     * The window is loaded into a different workspace context.
     */
    LoadReason[LoadReason["LOAD"] = 2] = "LOAD";
    /**
     * The window is reloaded.
     */
    LoadReason[LoadReason["RELOAD"] = 3] = "RELOAD";
})(LoadReason || (LoadReason = {}));
export var UnloadReason;
(function (UnloadReason) {
    /**
     * The window is closed.
     */
    UnloadReason[UnloadReason["CLOSE"] = 1] = "CLOSE";
    /**
     * All windows unload because the application quits.
     */
    UnloadReason[UnloadReason["QUIT"] = 2] = "QUIT";
    /**
     * The window is reloaded.
     */
    UnloadReason[UnloadReason["RELOAD"] = 3] = "RELOAD";
    /**
     * The window is loaded into a different workspace context.
     */
    UnloadReason[UnloadReason["LOAD"] = 4] = "LOAD";
})(UnloadReason || (UnloadReason = {}));
export const defaultWindowState = function (mode = 1 /* WindowMode.Normal */) {
    return {
        width: 1024,
        height: 768,
        mode
    };
};
export var WindowMode;
(function (WindowMode) {
    WindowMode[WindowMode["Maximized"] = 0] = "Maximized";
    WindowMode[WindowMode["Normal"] = 1] = "Normal";
    WindowMode[WindowMode["Minimized"] = 2] = "Minimized";
    WindowMode[WindowMode["Fullscreen"] = 3] = "Fullscreen";
})(WindowMode || (WindowMode = {}));
export var WindowError;
(function (WindowError) {
    /**
     * Maps to the `unresponsive` event on a `BrowserWindow`.
     */
    WindowError[WindowError["UNRESPONSIVE"] = 1] = "UNRESPONSIVE";
    /**
     * Maps to the `render-process-gone` event on a `WebContents`.
     */
    WindowError[WindowError["PROCESS_GONE"] = 2] = "PROCESS_GONE";
    /**
     * Maps to the `did-fail-load` event on a `WebContents`.
     */
    WindowError[WindowError["LOAD"] = 3] = "LOAD";
})(WindowError || (WindowError = {}));
