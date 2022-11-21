/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var DispatchConfig;
(function (DispatchConfig) {
    DispatchConfig[DispatchConfig["Code"] = 0] = "Code";
    DispatchConfig[DispatchConfig["KeyCode"] = 1] = "KeyCode";
})(DispatchConfig || (DispatchConfig = {}));
export function getDispatchConfig(configurationService) {
    const keyboard = configurationService.getValue('keyboard');
    const r = (keyboard ? keyboard.dispatch : null);
    return (r === 'keyCode' ? 1 /* DispatchConfig.KeyCode */ : 0 /* DispatchConfig.Code */);
}
