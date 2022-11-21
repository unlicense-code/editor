/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { localize } from 'vs/nls';
import { OPTIONS, parseArgs } from 'vs/platform/environment/node/argv';
const MIN_MAX_MEMORY_SIZE_MB = 2048;
function parseAndValidate(cmdLineArgs, reportWarnings) {
    const onMultipleValues = (id, val) => {
        console.warn(localize('multipleValues', "Option '{0}' is defined more than once. Using value '{1}'.", id, val));
    };
    const onEmptyValue = (id) => {
        console.warn(localize('emptyValue', "Option '{0}' requires a non empty value. Ignoring the option.", id));
    };
    const onDeprecatedOption = (deprecatedOption, message) => {
        console.warn(localize('deprecatedArgument', "Option '{0}' is deprecated: {1}", deprecatedOption, message));
    };
    const getSubcommandReporter = (command) => ({
        onUnknownOption: (id) => {
            if (command !== 'tunnel') {
                console.warn(localize('unknownSubCommandOption', "Warning: '{0}' is not in the list of known options for subcommand '{1}'", id, command));
            }
        },
        onMultipleValues,
        onEmptyValue,
        onDeprecatedOption,
        getSubcommandReporter: command !== 'tunnel' ? getSubcommandReporter : undefined
    });
    const errorReporter = {
        onUnknownOption: (id) => {
            console.warn(localize('unknownOption', "Warning: '{0}' is not in the list of known options, but still passed to Electron/Chromium.", id));
        },
        onMultipleValues,
        onEmptyValue,
        onDeprecatedOption,
        getSubcommandReporter
    };
    const args = parseArgs(cmdLineArgs, OPTIONS, reportWarnings ? errorReporter : undefined);
    if (args.goto) {
        args._.forEach(arg => assert(/^(\w:)?[^:]+(:\d*){0,2}$/.test(arg), localize('gotoValidation', "Arguments in `--goto` mode should be in the format of `FILE(:LINE(:CHARACTER))`.")));
    }
    if (args['max-memory']) {
        assert(parseInt(args['max-memory']) >= MIN_MAX_MEMORY_SIZE_MB, `The max-memory argument cannot be specified lower than ${MIN_MAX_MEMORY_SIZE_MB} MB.`);
    }
    return args;
}
function stripAppPath(argv) {
    const index = argv.findIndex(a => !/^-/.test(a));
    if (index > -1) {
        return [...argv.slice(0, index), ...argv.slice(index + 1)];
    }
    return undefined;
}
/**
 * Use this to parse raw code process.argv such as: `Electron . --verbose --wait`
 */
export function parseMainProcessArgv(processArgv) {
    let [, ...args] = processArgv;
    // If dev, remove the first non-option argument: it's the app location
    if (process.env['VSCODE_DEV']) {
        args = stripAppPath(args) || [];
    }
    // If called from CLI, don't report warnings as they are already reported.
    const reportWarnings = !isLaunchedFromCli(process.env);
    return parseAndValidate(args, reportWarnings);
}
/**
 * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
 */
export function parseCLIProcessArgv(processArgv) {
    let [, , ...args] = processArgv; // remove the first non-option argument: it's always the app location
    // If dev, remove the first non-option argument: it's the app location
    if (process.env['VSCODE_DEV']) {
        args = stripAppPath(args) || [];
    }
    return parseAndValidate(args, true);
}
export function addArg(argv, ...args) {
    const endOfArgsMarkerIndex = argv.indexOf('--');
    if (endOfArgsMarkerIndex === -1) {
        argv.push(...args);
    }
    else {
        // if the we have an argument "--" (end of argument marker)
        // we cannot add arguments at the end. rather, we add
        // arguments before the "--" marker.
        argv.splice(endOfArgsMarkerIndex, 0, ...args);
    }
    return argv;
}
export function isLaunchedFromCli(env) {
    return env['VSCODE_CLI'] === '1';
}
