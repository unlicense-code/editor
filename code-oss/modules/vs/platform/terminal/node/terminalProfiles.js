/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as cp from 'child_process';
import { Codicon } from 'vs/base/common/codicons';
import { basename, delimiter, normalize } from 'vs/base/common/path';
import { isLinux, isWindows } from 'vs/base/common/platform';
import * as pfs from 'vs/base/node/pfs';
import { enumeratePowerShellInstallations } from 'vs/base/node/powershell';
import { findExecutable, getWindowsBuildNumber } from 'vs/platform/terminal/node/terminalEnvironment';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
let profileSources;
let logIfWslNotInstalled = true;
export function detectAvailableProfiles(profiles, defaultProfile, includeDetectedProfiles, configurationService, shellEnv = process.env, fsProvider, logService, variableResolver, testPwshSourcePaths) {
    fsProvider = fsProvider || {
        existsFile: pfs.SymlinkSupport.existsFile,
        readFile: pfs.Promises.readFile
    };
    if (isWindows) {
        return detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, configurationService.getValue("terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */) !== false, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue("terminal.integrated.profiles.windows" /* TerminalSettingId.ProfilesWindows */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue("terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */), testPwshSourcePaths, variableResolver);
    }
    return detectAvailableUnixProfiles(fsProvider, logService, includeDetectedProfiles, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue(isLinux ? "terminal.integrated.profiles.linux" /* TerminalSettingId.ProfilesLinux */ : "terminal.integrated.profiles.osx" /* TerminalSettingId.ProfilesMacOs */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue(isLinux ? "terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */ : "terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */), testPwshSourcePaths, variableResolver, shellEnv);
}
async function detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, useWslProfiles, configProfiles, defaultProfileName, testPwshSourcePaths, variableResolver) {
    // Determine the correct System32 path. We want to point to Sysnative
    // when the 32-bit version of VS Code is running on a 64-bit machine.
    // The reason for this is because PowerShell's important PSReadline
    // module doesn't work if this is not the case. See #27915.
    const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
    const system32Path = `${process.env['windir']}\\${is32ProcessOn64Windows ? 'Sysnative' : 'System32'}`;
    let useWSLexe = false;
    if (getWindowsBuildNumber() >= 16299) {
        useWSLexe = true;
    }
    await initializeWindowsProfiles(testPwshSourcePaths);
    const detectedProfiles = new Map();
    // Add auto detected profiles
    if (includeDetectedProfiles) {
        detectedProfiles.set('PowerShell', {
            source: "PowerShell" /* ProfileSource.Pwsh */,
            icon: Codicon.terminalPowershell,
            isAutoDetected: true
        });
        detectedProfiles.set('Windows PowerShell', {
            path: `${system32Path}\\WindowsPowerShell\\v1.0\\powershell.exe`,
            icon: Codicon.terminalPowershell,
            isAutoDetected: true
        });
        detectedProfiles.set('Git Bash', {
            source: "Git Bash" /* ProfileSource.GitBash */,
            isAutoDetected: true
        });
        detectedProfiles.set('Command Prompt', {
            path: `${system32Path}\\cmd.exe`,
            icon: Codicon.terminalCmd,
            isAutoDetected: true
        });
    }
    applyConfigProfilesToMap(configProfiles, detectedProfiles);
    const resultProfiles = await transformToTerminalProfiles(detectedProfiles.entries(), defaultProfileName, fsProvider, shellEnv, logService, variableResolver);
    if (includeDetectedProfiles || useWslProfiles) {
        try {
            const result = await getWslProfiles(`${system32Path}\\${useWSLexe ? 'wsl' : 'bash'}.exe`, defaultProfileName);
            for (const wslProfile of result) {
                if (!configProfiles || !(wslProfile.profileName in configProfiles)) {
                    resultProfiles.push(wslProfile);
                }
            }
        }
        catch (e) {
            if (logIfWslNotInstalled) {
                logService?.info('WSL is not installed, so could not detect WSL profiles');
                logIfWslNotInstalled = false;
            }
        }
    }
    return resultProfiles;
}
async function transformToTerminalProfiles(entries, defaultProfileName, fsProvider, shellEnv = process.env, logService, variableResolver) {
    const resultProfiles = [];
    for (const [profileName, profile] of entries) {
        if (profile === null) {
            continue;
        }
        let originalPaths;
        let args;
        let icon = undefined;
        if ('source' in profile) {
            const source = profileSources?.get(profile.source);
            if (!source) {
                continue;
            }
            originalPaths = source.paths;
            // if there are configured args, override the default ones
            args = profile.args || source.args;
            if (profile.icon) {
                icon = validateIcon(profile.icon);
            }
            else if (source.icon) {
                icon = source.icon;
            }
        }
        else {
            originalPaths = Array.isArray(profile.path) ? profile.path : [profile.path];
            args = isWindows ? profile.args : Array.isArray(profile.args) ? profile.args : undefined;
            icon = validateIcon(profile.icon);
        }
        const paths = (await variableResolver?.(originalPaths)) || originalPaths.slice();
        const validatedProfile = await validateProfilePaths(profileName, defaultProfileName, paths, fsProvider, shellEnv, args, profile.env, profile.overrideName, profile.isAutoDetected, logService);
        if (validatedProfile) {
            validatedProfile.isAutoDetected = profile.isAutoDetected;
            validatedProfile.icon = icon;
            validatedProfile.color = profile.color;
            resultProfiles.push(validatedProfile);
        }
        else {
            logService?.debug('Terminal profile not validated', profileName, originalPaths);
        }
    }
    logService?.debug('Validated terminal profiles', resultProfiles);
    return resultProfiles;
}
function validateIcon(icon) {
    if (typeof icon === 'string') {
        return { id: icon };
    }
    return icon;
}
async function initializeWindowsProfiles(testPwshSourcePaths) {
    if (profileSources && !testPwshSourcePaths) {
        return;
    }
    profileSources = new Map();
    profileSources.set('Git Bash', {
        profileName: 'Git Bash',
        paths: [
            `${process.env['ProgramW6432']}\\Git\\bin\\bash.exe`,
            `${process.env['ProgramW6432']}\\Git\\usr\\bin\\bash.exe`,
            `${process.env['ProgramFiles']}\\Git\\bin\\bash.exe`,
            `${process.env['ProgramFiles']}\\Git\\usr\\bin\\bash.exe`,
            `${process.env['ProgramFiles(X86)']}\\Git\\bin\\bash.exe`,
            `${process.env['ProgramFiles(X86)']}\\Git\\usr\\bin\\bash.exe`,
            `${process.env['LocalAppData']}\\Programs\\Git\\bin\\bash.exe`,
            `${process.env['UserProfile']}\\scoop\\apps\\git-with-openssh\\current\\bin\\bash.exe`,
        ],
        args: ['--login', '-i']
    });
    profileSources.set('PowerShell', {
        profileName: 'PowerShell',
        paths: testPwshSourcePaths || await getPowershellPaths(),
        icon: ThemeIcon.asThemeIcon(Codicon.terminalPowershell)
    });
}
async function getPowershellPaths() {
    const paths = [];
    // Add all of the different kinds of PowerShells
    for await (const pwshExe of enumeratePowerShellInstallations()) {
        paths.push(pwshExe.exePath);
    }
    return paths;
}
async function getWslProfiles(wslPath, defaultProfileName) {
    const profiles = [];
    const distroOutput = await new Promise((resolve, reject) => {
        // wsl.exe output is encoded in utf16le (ie. A -> 0x4100)
        cp.exec('wsl.exe -l -q', { encoding: 'utf16le', timeout: 1000 }, (err, stdout) => {
            if (err) {
                return reject('Problem occurred when getting wsl distros');
            }
            resolve(stdout);
        });
    });
    if (!distroOutput) {
        return [];
    }
    const regex = new RegExp(/[\r?\n]/);
    const distroNames = distroOutput.split(regex).filter(t => t.trim().length > 0 && t !== '');
    for (const distroName of distroNames) {
        // Skip empty lines
        if (distroName === '') {
            continue;
        }
        // docker-desktop and docker-desktop-data are treated as implementation details of
        // Docker Desktop for Windows and therefore not exposed
        if (distroName.startsWith('docker-desktop')) {
            continue;
        }
        // Create the profile, adding the icon depending on the distro
        const profileName = `${distroName} (WSL)`;
        const profile = {
            profileName,
            path: wslPath,
            args: [`-d`, `${distroName}`],
            isDefault: profileName === defaultProfileName,
            icon: getWslIcon(distroName),
            isAutoDetected: false
        };
        // Add the profile
        profiles.push(profile);
    }
    return profiles;
}
function getWslIcon(distroName) {
    if (distroName.includes('Ubuntu')) {
        return ThemeIcon.asThemeIcon(Codicon.terminalUbuntu);
    }
    else if (distroName.includes('Debian')) {
        return ThemeIcon.asThemeIcon(Codicon.terminalDebian);
    }
    else {
        return ThemeIcon.asThemeIcon(Codicon.terminalLinux);
    }
}
async function detectAvailableUnixProfiles(fsProvider, logService, includeDetectedProfiles, configProfiles, defaultProfileName, testPaths, variableResolver, shellEnv) {
    const detectedProfiles = new Map();
    // Add non-quick launch profiles
    if (includeDetectedProfiles) {
        const contents = (await fsProvider.readFile('/etc/shells')).toString();
        const profiles = testPaths || contents.split('\n').filter(e => e.trim().indexOf('#') !== 0 && e.trim().length > 0);
        const counts = new Map();
        for (const profile of profiles) {
            let profileName = basename(profile);
            let count = counts.get(profileName) || 0;
            count++;
            if (count > 1) {
                profileName = `${profileName} (${count})`;
            }
            counts.set(profileName, count);
            detectedProfiles.set(profileName, { path: profile, isAutoDetected: true });
        }
    }
    applyConfigProfilesToMap(configProfiles, detectedProfiles);
    return await transformToTerminalProfiles(detectedProfiles.entries(), defaultProfileName, fsProvider, shellEnv, logService, variableResolver);
}
function applyConfigProfilesToMap(configProfiles, profilesMap) {
    if (!configProfiles) {
        return;
    }
    for (const [profileName, value] of Object.entries(configProfiles)) {
        if (value === null || (!('path' in value) && !('source' in value))) {
            profilesMap.delete(profileName);
        }
        else {
            value.icon = value.icon || profilesMap.get(profileName)?.icon;
            profilesMap.set(profileName, value);
        }
    }
}
async function validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected, logService) {
    if (potentialPaths.length === 0) {
        return Promise.resolve(undefined);
    }
    const path = potentialPaths.shift();
    if (path === '') {
        return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected);
    }
    const profile = { profileName, path, args, env, overrideName, isAutoDetected, isDefault: profileName === defaultProfileName };
    // For non-absolute paths, check if it's available on $PATH
    if (basename(path) === path) {
        // The executable isn't an absolute path, try find it on the PATH
        const envPaths = shellEnv.PATH ? shellEnv.PATH.split(delimiter) : undefined;
        const executable = await findExecutable(path, undefined, envPaths, undefined, fsProvider.existsFile);
        if (!executable) {
            return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args);
        }
        profile.path = executable;
        profile.isFromPath = true;
        return profile;
    }
    const result = await fsProvider.existsFile(normalize(path));
    if (result) {
        return profile;
    }
    return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected);
}
