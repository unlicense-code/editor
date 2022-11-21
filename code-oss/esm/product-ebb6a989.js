'use strict';

var nameShort = "Code - OSS";
var nameLong = "Code - OSS";
var applicationName = "code-oss";
var dataFolderName = ".vscode-oss";
var win32MutexName = "vscodeoss";
var licenseName = "MIT";
var licenseUrl = "https://github.com/microsoft/vscode/blob/main/LICENSE.txt";
var serverGreeting = [
];
var serverLicense = [
];
var serverLicensePrompt = "";
var serverApplicationName = "code-server-oss";
var serverDataFolderName = ".vscode-server-oss";
var tunnelApplicationName = "code-tunnel-oss";
var tunnelApplicationConfig = {
	authenticationProviders: {
		github: {
			scopes: [
				"user:email",
				"read:org"
			]
		}
	}
};
var win32DirName = "Microsoft Code OSS";
var win32NameVersion = "Microsoft Code OSS";
var win32RegValueName = "CodeOSS";
var win32AppId = "{{E34003BB-9E10-4501-8C11-BE3FAA83F23F}";
var win32x64AppId = "{{D77B7E06-80BA-4137-BCF4-654B95CCEBC5}";
var win32arm64AppId = "{{D1ACE434-89C5-48D1-88D3-E2991DF85475}";
var win32UserAppId = "{{C6065F05-9603-4FC4-8101-B9781A25D88E}";
var win32x64UserAppId = "{{CC6B787D-37A0-49E8-AE24-8559A032BE0C}";
var win32arm64UserAppId = "{{3AEBF0C8-F733-4AD4-BADE-FDB816D53D7B}";
var win32AppUserModelId = "Microsoft.CodeOSS";
var win32ShellNameShort = "C&ode - OSS";
var darwinBundleIdentifier = "com.visualstudio.code.oss";
var linuxIconName = "com.visualstudio.code.oss";
var licenseFileName = "LICENSE.txt";
var reportIssueUrl = "https://github.com/microsoft/vscode/issues/new";
var urlProtocol = "code-oss";
var webviewContentExternalBaseUrlTemplate = "https://{{uuid}}.vscode-cdn.net/insider/ef65ac1ba57f57f2a3961bfe94aa20481caca4c6/out/vs/workbench/contrib/webview/browser/pre/";
var builtInExtensions = [
	{
		name: "ms-vscode.js-debug-companion",
		version: "1.0.18",
		repo: "https://github.com/microsoft/vscode-js-debug-companion",
		metadata: {
			id: "99cb0b7f-7354-4278-b8da-6cc79972169d",
			publisherId: {
				publisherId: "5f5636e7-69ed-4afe-b5d6-8d231fb3d3ee",
				publisherName: "ms-vscode",
				displayName: "Microsoft",
				flags: "verified"
			},
			publisherDisplayName: "Microsoft"
		}
	},
	{
		name: "ms-vscode.js-debug",
		version: "1.72.1",
		repo: "https://github.com/microsoft/vscode-js-debug",
		metadata: {
			id: "25629058-ddac-4e17-abba-74678e126c5d",
			publisherId: {
				publisherId: "5f5636e7-69ed-4afe-b5d6-8d231fb3d3ee",
				publisherName: "ms-vscode",
				displayName: "Microsoft",
				flags: "verified"
			},
			publisherDisplayName: "Microsoft"
		}
	},
	{
		name: "ms-vscode.vscode-js-profile-table",
		version: "1.0.3",
		repo: "https://github.com/microsoft/vscode-js-profile-visualizer",
		metadata: {
			id: "7e52b41b-71ad-457b-ab7e-0620f1fc4feb",
			publisherId: {
				publisherId: "5f5636e7-69ed-4afe-b5d6-8d231fb3d3ee",
				publisherName: "ms-vscode",
				displayName: "Microsoft",
				flags: "verified"
			},
			publisherDisplayName: "Microsoft"
		}
	}
];
var product = {
	nameShort: nameShort,
	nameLong: nameLong,
	applicationName: applicationName,
	dataFolderName: dataFolderName,
	win32MutexName: win32MutexName,
	licenseName: licenseName,
	licenseUrl: licenseUrl,
	serverGreeting: serverGreeting,
	serverLicense: serverLicense,
	serverLicensePrompt: serverLicensePrompt,
	serverApplicationName: serverApplicationName,
	serverDataFolderName: serverDataFolderName,
	tunnelApplicationName: tunnelApplicationName,
	tunnelApplicationConfig: tunnelApplicationConfig,
	win32DirName: win32DirName,
	win32NameVersion: win32NameVersion,
	win32RegValueName: win32RegValueName,
	win32AppId: win32AppId,
	win32x64AppId: win32x64AppId,
	win32arm64AppId: win32arm64AppId,
	win32UserAppId: win32UserAppId,
	win32x64UserAppId: win32x64UserAppId,
	win32arm64UserAppId: win32arm64UserAppId,
	win32AppUserModelId: win32AppUserModelId,
	win32ShellNameShort: win32ShellNameShort,
	darwinBundleIdentifier: darwinBundleIdentifier,
	linuxIconName: linuxIconName,
	licenseFileName: licenseFileName,
	reportIssueUrl: reportIssueUrl,
	urlProtocol: urlProtocol,
	webviewContentExternalBaseUrlTemplate: webviewContentExternalBaseUrlTemplate,
	builtInExtensions: builtInExtensions
};

exports.applicationName = applicationName;
exports.builtInExtensions = builtInExtensions;
exports.darwinBundleIdentifier = darwinBundleIdentifier;
exports.dataFolderName = dataFolderName;
exports.default = product;
exports.licenseFileName = licenseFileName;
exports.licenseName = licenseName;
exports.licenseUrl = licenseUrl;
exports.linuxIconName = linuxIconName;
exports.nameLong = nameLong;
exports.nameShort = nameShort;
exports.reportIssueUrl = reportIssueUrl;
exports.serverApplicationName = serverApplicationName;
exports.serverDataFolderName = serverDataFolderName;
exports.serverGreeting = serverGreeting;
exports.serverLicense = serverLicense;
exports.serverLicensePrompt = serverLicensePrompt;
exports.tunnelApplicationConfig = tunnelApplicationConfig;
exports.tunnelApplicationName = tunnelApplicationName;
exports.urlProtocol = urlProtocol;
exports.webviewContentExternalBaseUrlTemplate = webviewContentExternalBaseUrlTemplate;
exports.win32AppId = win32AppId;
exports.win32AppUserModelId = win32AppUserModelId;
exports.win32DirName = win32DirName;
exports.win32MutexName = win32MutexName;
exports.win32NameVersion = win32NameVersion;
exports.win32RegValueName = win32RegValueName;
exports.win32ShellNameShort = win32ShellNameShort;
exports.win32UserAppId = win32UserAppId;
exports.win32arm64AppId = win32arm64AppId;
exports.win32arm64UserAppId = win32arm64UserAppId;
exports.win32x64AppId = win32x64AppId;
exports.win32x64UserAppId = win32x64UserAppId;
