// This implements the modlet pattern folder imports via 
// 'live-share/' => 'live-share/live-share.js'
export const EXTENSION_NAME = "workspace";
export const EXTENSION_ID = `codespaces-contrib.${EXTENSION_NAME}`;
export const INPUT_SCHEME = `${EXTENSION_NAME}-input`;
export const EXTENSION_FILE = `${EXTENSION_NAME}.json`;
export const URI_PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

const OPENED_NOTIFICATION = "workspaceOpened";
const CLOSED_NOTIFICATION = "workspaceClosed";

export const ConnectSession = (SessionProvider) => new ReadableStream(SessionProvider);

// Example Code OSS / VSCODE as WorkspaceProvider
const CodeOSSWorkspace = async (resolver="vscode") => {
    const { workspace: { getWorkspaceFolder, asRelativePath }, Uri: { parse: Uri } } = await import(resolver);
    return { getWorkspaceFolder, asRelativePath, Uri };
}

// Generates workspaceStream
export const Workspaces = async (shareApi="vsls", workspaceApi=CodeOSSWorkspace()) => ({ start: (controller) =>
    (await import(shareApi)).getApi(EXTENSION_ID).then((workspace) => {    
        (!workspace) && controller.cancel(`workspace.getApi(${EXTENSION_ID}): undefined`)
        controller.enqueue({ workspace })
        workspace?.onDidChangeSession((e) => e.session.id && controller.enqueue({ workspace }))
    }) 
});




// WorkspaceProvider(ConnectSession(Workspaces("vsls","../store")), CodeOSSWorkspace);
export const WorkspaceProvider = async (workspaceStream, Workspace) => {
    //storeSpecifier='../store',
    const { getWorkspaceFolder, asRelativePath, Uri } = await Workspace();
    
    workspaceStream.pipeTo(new WritableStream({ write: ({ workspace }, _controller) => {
        if (workspace.session.role === workspace.Role.Host) {
            (await workspace.shareService(EXTENSION_NAME)).onRequest(
            "getActive", (workspaceFolder) => (workspaceFolder = getWorkspaceFolder(uri)) && store.active
                ? ({ uri: Uri(`vsls:/${(workspaceFolder && workspaceFolder.index > 0)
                        ? `~${workspaceFolder.index}/`
                        : ''
                    }${ `${workspaceFolder?.uri}` === `${store.active.rootUri}`
                        ? ""
                        : asRelativePath(store.active.rootUri, false)}`).toString() })
                : null 
            )
        } else {
    
            // TODO: pass that to a target like preview
            Uri((await (await workspace.LiveShare
                .getSharedService(EXTENSION_NAME))
                .request("getActive", [])).uri)
        }
    } }))
        
}

// Client start reading WorkspaceProvider(ConnectSession(Workspaces("vsls","../store")));
export async function initializeService(workspace) {
    // initializeBaseService(vslsApi, vslsApi.session.peerNumber, service);
    
}

// TODO: Implement REPSessionProvider

/*
import { LiveShare, SharedService, SharedServiceProxy } from "vsls";
interface Session {
  data?: any;
  peer?: number;
}
export default function (
  api: LiveShare,
  peer: number,
  service: SharedService | SharedServiceProxy,
  broadcastNotifications: boolean = false
) {
  /*
  onDidClose(() => {
    service.notify(CLOSED_NOTIFICATION, { peer });
  });
  service.onNotify(CLOSED_NOTIFICATION, (session: Session) => {
    if (session.peer === peer) return;
    store.active?.webViewPanel.dispose();
    if (broadcastNotifications) {
      service.notify(CLOSED_NOTIFICATION, session);
    }
  });
  onDidOpen((uri) => {
    let sharedUri;
    if (api.session.role === Role.Host) {
      sharedUri = api.convertLocalUriToShared(uri).toString();
    } else {
      sharedUri = api.convertSharedUriToLocal(uri).toString();
    }
    const session = {
      peer,
      data: {
        uri: sharedUri,
      },
    };
    service.notify(_OPENED_NOTIFICATION, session);
  });
  service.onNotify(_OPENED_NOTIFICATION, (session: Session) => {
    if (session.peer === peer) return;
    open(session.data.uri);
    if (broadcastNotifications) {
      service.notify(_OPENED_NOTIFICATION, session);
    }
  });*/
