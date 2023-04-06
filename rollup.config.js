const files = { "workbench.ts":`import { URI, UriComponents } from "vs/base/common/uri";
import { create } from "vs/workbench/workbench.web.main";
import { IWorkbenchConstructionOptions } from "vs/workbench/browser/web.api";
import { IWorkspace, IWorkspaceProvider } from "vs/workbench/services/host/browser/browserHostService";
declare const window: any;

(async function () {
  // create workbench
  let config: IWorkbenchConstructionOptions & {
    folderUri?: UriComponents;
    workspaceUri?: UriComponents;
    domElementId?: string;
  } = {};

  if (window.product) {
    config = window.product;
  } else {
    const result = await fetch("/product.json");
    config = await result.json();
  }

  if (Array.isArray(config.additionalBuiltinExtensions)) {
    const tempConfig = { ...config };

    tempConfig.additionalBuiltinExtensions =
      config.additionalBuiltinExtensions.map((ext) => URI.revive(ext));
    config = tempConfig;
  }

  let workspace;
  if (config.folderUri) {
    workspace = { folderUri: URI.revive(config.folderUri) };
  } else if (config.workspaceUri) {
    workspace = { workspaceUri: URI.revive(config.workspaceUri) };
  } else {
    workspace = undefined;
  }

  if (workspace) {
    const workspaceProvider: IWorkspaceProvider = {
      workspace,
      open: async (
        workspace: IWorkspace,
        options?: { reuse?: boolean; payload?: object }
      ) => true,
      trusted: true,
    };
    config = { ...config, workspaceProvider };
  }

  const domElement = !!config.domElementId
    && document.getElementById(config.domElementId)
    || document.body;

  create(domElement, config);
})();`;
                             
const process = await import("node:process");
const child_process = await import("node:child_process");
const fs = await import("node:fs");
const fse = await import("fs-extra").then(({default:fs})=>fs);

const vscodeVersion = "1.76.0";

if (!fs.existsSync("vscode")) {
  child_process.execSync(`git clone -s https://github.com/microsoft/vscode.git -b ${vscodeVersion}`, {
    stdio: "inherit",
  });
}



if (!fs.existsSync("node_modules")) { child_process.execSync("yarn", { stdio: "inherit" }); }

fs.copyFileSync("../workbench.ts", "src/vs/code/browser/workbench/workbench.ts");

child_process.execSync("yarn gulp vscode-web-min", { stdio: "inherit", cwd: "./vscode" });

// Create final bundels
if (fs.existsSync("../dist")) { fs.rmdirSync("../dist", { recursive: true }); }
fs.mkdirSync("../dist");
fs.copySync("../vscode-web", "../dist");

