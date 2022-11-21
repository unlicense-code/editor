/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
export const GitCommandLineRegex = /git/;
export const GitPushCommandLineRegex = /git\s+push/;
export const GitTwoDashesRegex = /error: did you mean `--(.+)` \(with two dashes\)\?/;
export const AnyCommandLineRegex = /.+/;
export const GitSimilarOutputRegex = /(?:(most similar (command|commands) (is|are)))((\n\s*(?<fixedCommand>[^\s]+))+)/m;
export const FreePortOutputRegex = /address already in use (0\.0\.0\.0|127\.0\.0\.1|localhost|::):(?<portNumber>\d{4,5})|Unable to bind [^ ]*:(\d{4,5})|can't listen on port (\d{4,5})|listen EADDRINUSE [^ ]*:(\d{4,5})/;
export const GitPushOutputRegex = /git push --set-upstream origin (?<branchName>[^\s]+)/;
// The previous line starts with "Create a pull request for \'([^\s]+)\' on GitHub by visiting:\s*"
// it's safe to assume it's a github pull request if the URL includes `/pull/`
export const GitCreatePrOutputRegex = /remote:\s*(?<link>https:\/\/github\.com\/.+\/.+\/pull\/new\/.+)/;
export function gitSimilar() {
    return {
        source: 'builtin',
        id: 'Git Similar',
        commandLineMatcher: GitCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitSimilarOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 10
        },
        exitStatus: false,
        getQuickFixes: (matchResult, command) => {
            if (!matchResult?.outputMatch) {
                return;
            }
            const actions = [];
            const results = matchResult.outputMatch[0].split('\n').map(r => r.trim());
            for (let i = 1; i < results.length; i++) {
                const fixedCommand = results[i];
                if (fixedCommand) {
                    actions.push({
                        id: 'Git Similar',
                        type: "command" /* TerminalQuickFixType.Command */,
                        command: command.command.replace(/git\s+[^\s]+/, `git ${fixedCommand}`),
                        addNewLine: true
                    });
                }
            }
            return actions;
        }
    };
}
export function gitTwoDashes() {
    return {
        source: 'builtin',
        id: 'Git Two Dashes',
        commandLineMatcher: GitCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitTwoDashesRegex,
            anchor: 'bottom',
            offset: 0,
            length: 2
        },
        exitStatus: false,
        getQuickFixes: (matchResult, command) => {
            const problemArg = matchResult?.outputMatch?.[1];
            if (!problemArg) {
                return;
            }
            return {
                type: "command" /* TerminalQuickFixType.Command */,
                id: 'Git Two Dashes',
                command: command.command.replace(` -${problemArg}`, ` --${problemArg}`),
                addNewLine: true
            };
        }
    };
}
export function freePort(terminalInstance) {
    return {
        source: 'builtin',
        id: 'Free Port',
        commandLineMatcher: AnyCommandLineRegex,
        outputMatcher: {
            lineMatcher: FreePortOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 30
        },
        exitStatus: false,
        getQuickFixes: (matchResult, command) => {
            const port = matchResult?.outputMatch?.groups?.portNumber;
            if (!port) {
                return;
            }
            const label = localize("terminal.freePort", "Free port {0}", port);
            return {
                class: "port" /* TerminalQuickFixType.Port */,
                tooltip: label,
                id: 'terminal.freePort',
                label,
                enabled: true,
                run: async () => {
                    await terminalInstance?.freePortKillProcess?.(port, command.command);
                }
            };
        }
    };
}
export function gitPushSetUpstream() {
    return {
        id: 'Git Push Set Upstream',
        commandLineMatcher: GitPushCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitPushOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 5
        },
        exitStatus: false,
        commandToRun: 'git push --set-upstream origin ${group:branchName}',
        extensionIdentifier: 'git'
    };
}
export function gitCreatePr() {
    return {
        id: 'Git Create Pr',
        commandLineMatcher: GitPushCommandLineRegex,
        outputMatcher: {
            lineMatcher: GitCreatePrOutputRegex,
            anchor: 'bottom',
            offset: 0,
            length: 5
        },
        exitStatus: true,
        linkToOpen: '${group:link}',
        extensionIdentifier: 'git'
    };
}
