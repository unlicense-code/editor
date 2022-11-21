export declare function getCodiconAriaLabel(text: string | undefined): string;
/**
 * The Codicon library is a set of default icons that are built-in in VS Code.
 *
 * In the product (outside of base) Codicons should only be used as defaults. In order to have all icons in VS Code
 * themeable, component should define new, UI component specific icons using `iconRegistry.registerIcon`.
 * In that call a Codicon can be named as default.
 */
export declare class Codicon implements CSSIcon {
    readonly id: string;
    readonly definition: IconDefinition;
    description?: string | undefined;
    private constructor();
    get classNames(): string;
    get classNamesArray(): string[];
    get cssSelector(): string;
    private static _allCodicons;
    /**
     * @returns Returns all default icons covered by the codicon font. Only to be used by the icon registry in platform.
     */
    static getAll(): readonly Codicon[];
    static readonly add: Codicon;
    static readonly plus: Codicon;
    static readonly gistNew: Codicon;
    static readonly repoCreate: Codicon;
    static readonly lightbulb: Codicon;
    static readonly lightBulb: Codicon;
    static readonly repo: Codicon;
    static readonly repoDelete: Codicon;
    static readonly gistFork: Codicon;
    static readonly repoForked: Codicon;
    static readonly gitPullRequest: Codicon;
    static readonly gitPullRequestAbandoned: Codicon;
    static readonly recordKeys: Codicon;
    static readonly keyboard: Codicon;
    static readonly tag: Codicon;
    static readonly tagAdd: Codicon;
    static readonly tagRemove: Codicon;
    static readonly person: Codicon;
    static readonly personFollow: Codicon;
    static readonly personOutline: Codicon;
    static readonly personFilled: Codicon;
    static readonly gitBranch: Codicon;
    static readonly gitBranchCreate: Codicon;
    static readonly gitBranchDelete: Codicon;
    static readonly sourceControl: Codicon;
    static readonly mirror: Codicon;
    static readonly mirrorPublic: Codicon;
    static readonly star: Codicon;
    static readonly starAdd: Codicon;
    static readonly starDelete: Codicon;
    static readonly starEmpty: Codicon;
    static readonly comment: Codicon;
    static readonly commentAdd: Codicon;
    static readonly alert: Codicon;
    static readonly warning: Codicon;
    static readonly search: Codicon;
    static readonly searchSave: Codicon;
    static readonly logOut: Codicon;
    static readonly signOut: Codicon;
    static readonly logIn: Codicon;
    static readonly signIn: Codicon;
    static readonly eye: Codicon;
    static readonly eyeUnwatch: Codicon;
    static readonly eyeWatch: Codicon;
    static readonly circleFilled: Codicon;
    static readonly primitiveDot: Codicon;
    static readonly closeDirty: Codicon;
    static readonly debugBreakpoint: Codicon;
    static readonly debugBreakpointDisabled: Codicon;
    static readonly debugHint: Codicon;
    static readonly primitiveSquare: Codicon;
    static readonly edit: Codicon;
    static readonly pencil: Codicon;
    static readonly info: Codicon;
    static readonly issueOpened: Codicon;
    static readonly gistPrivate: Codicon;
    static readonly gitForkPrivate: Codicon;
    static readonly lock: Codicon;
    static readonly mirrorPrivate: Codicon;
    static readonly close: Codicon;
    static readonly removeClose: Codicon;
    static readonly x: Codicon;
    static readonly repoSync: Codicon;
    static readonly sync: Codicon;
    static readonly clone: Codicon;
    static readonly desktopDownload: Codicon;
    static readonly beaker: Codicon;
    static readonly microscope: Codicon;
    static readonly vm: Codicon;
    static readonly deviceDesktop: Codicon;
    static readonly file: Codicon;
    static readonly fileText: Codicon;
    static readonly more: Codicon;
    static readonly ellipsis: Codicon;
    static readonly kebabHorizontal: Codicon;
    static readonly mailReply: Codicon;
    static readonly reply: Codicon;
    static readonly organization: Codicon;
    static readonly organizationFilled: Codicon;
    static readonly organizationOutline: Codicon;
    static readonly newFile: Codicon;
    static readonly fileAdd: Codicon;
    static readonly newFolder: Codicon;
    static readonly fileDirectoryCreate: Codicon;
    static readonly trash: Codicon;
    static readonly trashcan: Codicon;
    static readonly history: Codicon;
    static readonly clock: Codicon;
    static readonly folder: Codicon;
    static readonly fileDirectory: Codicon;
    static readonly symbolFolder: Codicon;
    static readonly logoGithub: Codicon;
    static readonly markGithub: Codicon;
    static readonly github: Codicon;
    static readonly terminal: Codicon;
    static readonly console: Codicon;
    static readonly repl: Codicon;
    static readonly zap: Codicon;
    static readonly symbolEvent: Codicon;
    static readonly error: Codicon;
    static readonly stop: Codicon;
    static readonly variable: Codicon;
    static readonly symbolVariable: Codicon;
    static readonly array: Codicon;
    static readonly symbolArray: Codicon;
    static readonly symbolModule: Codicon;
    static readonly symbolPackage: Codicon;
    static readonly symbolNamespace: Codicon;
    static readonly symbolObject: Codicon;
    static readonly symbolMethod: Codicon;
    static readonly symbolFunction: Codicon;
    static readonly symbolConstructor: Codicon;
    static readonly symbolBoolean: Codicon;
    static readonly symbolNull: Codicon;
    static readonly symbolNumeric: Codicon;
    static readonly symbolNumber: Codicon;
    static readonly symbolStructure: Codicon;
    static readonly symbolStruct: Codicon;
    static readonly symbolParameter: Codicon;
    static readonly symbolTypeParameter: Codicon;
    static readonly symbolKey: Codicon;
    static readonly symbolText: Codicon;
    static readonly symbolReference: Codicon;
    static readonly goToFile: Codicon;
    static readonly symbolEnum: Codicon;
    static readonly symbolValue: Codicon;
    static readonly symbolRuler: Codicon;
    static readonly symbolUnit: Codicon;
    static readonly activateBreakpoints: Codicon;
    static readonly archive: Codicon;
    static readonly arrowBoth: Codicon;
    static readonly arrowDown: Codicon;
    static readonly arrowLeft: Codicon;
    static readonly arrowRight: Codicon;
    static readonly arrowSmallDown: Codicon;
    static readonly arrowSmallLeft: Codicon;
    static readonly arrowSmallRight: Codicon;
    static readonly arrowSmallUp: Codicon;
    static readonly arrowUp: Codicon;
    static readonly bell: Codicon;
    static readonly bold: Codicon;
    static readonly book: Codicon;
    static readonly bookmark: Codicon;
    static readonly debugBreakpointConditionalUnverified: Codicon;
    static readonly debugBreakpointConditional: Codicon;
    static readonly debugBreakpointConditionalDisabled: Codicon;
    static readonly debugBreakpointDataUnverified: Codicon;
    static readonly debugBreakpointData: Codicon;
    static readonly debugBreakpointDataDisabled: Codicon;
    static readonly debugBreakpointLogUnverified: Codicon;
    static readonly debugBreakpointLog: Codicon;
    static readonly debugBreakpointLogDisabled: Codicon;
    static readonly briefcase: Codicon;
    static readonly broadcast: Codicon;
    static readonly browser: Codicon;
    static readonly bug: Codicon;
    static readonly calendar: Codicon;
    static readonly caseSensitive: Codicon;
    static readonly check: Codicon;
    static readonly checklist: Codicon;
    static readonly chevronDown: Codicon;
    static readonly dropDownButton: Codicon;
    static readonly chevronLeft: Codicon;
    static readonly chevronRight: Codicon;
    static readonly chevronUp: Codicon;
    static readonly chromeClose: Codicon;
    static readonly chromeMaximize: Codicon;
    static readonly chromeMinimize: Codicon;
    static readonly chromeRestore: Codicon;
    static readonly circle: Codicon;
    static readonly circleOutline: Codicon;
    static readonly debugBreakpointUnverified: Codicon;
    static readonly circleSlash: Codicon;
    static readonly circuitBoard: Codicon;
    static readonly clearAll: Codicon;
    static readonly clippy: Codicon;
    static readonly closeAll: Codicon;
    static readonly cloudDownload: Codicon;
    static readonly cloudUpload: Codicon;
    static readonly code: Codicon;
    static readonly collapseAll: Codicon;
    static readonly colorMode: Codicon;
    static readonly commentDiscussion: Codicon;
    static readonly compareChanges: Codicon;
    static readonly creditCard: Codicon;
    static readonly dash: Codicon;
    static readonly dashboard: Codicon;
    static readonly database: Codicon;
    static readonly debugContinue: Codicon;
    static readonly debugDisconnect: Codicon;
    static readonly debugPause: Codicon;
    static readonly debugRestart: Codicon;
    static readonly debugStart: Codicon;
    static readonly debugStepInto: Codicon;
    static readonly debugStepOut: Codicon;
    static readonly debugStepOver: Codicon;
    static readonly debugStop: Codicon;
    static readonly debug: Codicon;
    static readonly deviceCameraVideo: Codicon;
    static readonly deviceCamera: Codicon;
    static readonly deviceMobile: Codicon;
    static readonly diffAdded: Codicon;
    static readonly diffIgnored: Codicon;
    static readonly diffModified: Codicon;
    static readonly diffRemoved: Codicon;
    static readonly diffRenamed: Codicon;
    static readonly diff: Codicon;
    static readonly discard: Codicon;
    static readonly editorLayout: Codicon;
    static readonly emptyWindow: Codicon;
    static readonly exclude: Codicon;
    static readonly extensions: Codicon;
    static readonly eyeClosed: Codicon;
    static readonly fileBinary: Codicon;
    static readonly fileCode: Codicon;
    static readonly fileMedia: Codicon;
    static readonly filePdf: Codicon;
    static readonly fileSubmodule: Codicon;
    static readonly fileSymlinkDirectory: Codicon;
    static readonly fileSymlinkFile: Codicon;
    static readonly fileZip: Codicon;
    static readonly files: Codicon;
    static readonly filter: Codicon;
    static readonly flame: Codicon;
    static readonly foldDown: Codicon;
    static readonly foldUp: Codicon;
    static readonly fold: Codicon;
    static readonly folderActive: Codicon;
    static readonly folderOpened: Codicon;
    static readonly gear: Codicon;
    static readonly gift: Codicon;
    static readonly gistSecret: Codicon;
    static readonly gist: Codicon;
    static readonly gitCommit: Codicon;
    static readonly gitCompare: Codicon;
    static readonly gitMerge: Codicon;
    static readonly githubAction: Codicon;
    static readonly githubAlt: Codicon;
    static readonly globe: Codicon;
    static readonly grabber: Codicon;
    static readonly graph: Codicon;
    static readonly gripper: Codicon;
    static readonly heart: Codicon;
    static readonly home: Codicon;
    static readonly horizontalRule: Codicon;
    static readonly hubot: Codicon;
    static readonly inbox: Codicon;
    static readonly issueClosed: Codicon;
    static readonly issueReopened: Codicon;
    static readonly issues: Codicon;
    static readonly italic: Codicon;
    static readonly jersey: Codicon;
    static readonly json: Codicon;
    static readonly kebabVertical: Codicon;
    static readonly key: Codicon;
    static readonly law: Codicon;
    static readonly lightbulbAutofix: Codicon;
    static readonly linkExternal: Codicon;
    static readonly link: Codicon;
    static readonly listOrdered: Codicon;
    static readonly listUnordered: Codicon;
    static readonly liveShare: Codicon;
    static readonly loading: Codicon;
    static readonly location: Codicon;
    static readonly mailRead: Codicon;
    static readonly mail: Codicon;
    static readonly markdown: Codicon;
    static readonly megaphone: Codicon;
    static readonly mention: Codicon;
    static readonly milestone: Codicon;
    static readonly mortarBoard: Codicon;
    static readonly move: Codicon;
    static readonly multipleWindows: Codicon;
    static readonly mute: Codicon;
    static readonly noNewline: Codicon;
    static readonly note: Codicon;
    static readonly octoface: Codicon;
    static readonly openPreview: Codicon;
    static readonly package_: Codicon;
    static readonly paintcan: Codicon;
    static readonly pin: Codicon;
    static readonly play: Codicon;
    static readonly run: Codicon;
    static readonly plug: Codicon;
    static readonly preserveCase: Codicon;
    static readonly preview: Codicon;
    static readonly project: Codicon;
    static readonly pulse: Codicon;
    static readonly question: Codicon;
    static readonly quote: Codicon;
    static readonly radioTower: Codicon;
    static readonly reactions: Codicon;
    static readonly references: Codicon;
    static readonly refresh: Codicon;
    static readonly regex: Codicon;
    static readonly remoteExplorer: Codicon;
    static readonly remote: Codicon;
    static readonly remove: Codicon;
    static readonly replaceAll: Codicon;
    static readonly replace: Codicon;
    static readonly repoClone: Codicon;
    static readonly repoForcePush: Codicon;
    static readonly repoPull: Codicon;
    static readonly repoPush: Codicon;
    static readonly report: Codicon;
    static readonly requestChanges: Codicon;
    static readonly rocket: Codicon;
    static readonly rootFolderOpened: Codicon;
    static readonly rootFolder: Codicon;
    static readonly rss: Codicon;
    static readonly ruby: Codicon;
    static readonly saveAll: Codicon;
    static readonly saveAs: Codicon;
    static readonly save: Codicon;
    static readonly screenFull: Codicon;
    static readonly screenNormal: Codicon;
    static readonly searchStop: Codicon;
    static readonly server: Codicon;
    static readonly settingsGear: Codicon;
    static readonly settings: Codicon;
    static readonly shield: Codicon;
    static readonly smiley: Codicon;
    static readonly sortPrecedence: Codicon;
    static readonly splitHorizontal: Codicon;
    static readonly splitVertical: Codicon;
    static readonly squirrel: Codicon;
    static readonly starFull: Codicon;
    static readonly starHalf: Codicon;
    static readonly symbolClass: Codicon;
    static readonly symbolColor: Codicon;
    static readonly symbolCustomColor: Codicon;
    static readonly symbolConstant: Codicon;
    static readonly symbolEnumMember: Codicon;
    static readonly symbolField: Codicon;
    static readonly symbolFile: Codicon;
    static readonly symbolInterface: Codicon;
    static readonly symbolKeyword: Codicon;
    static readonly symbolMisc: Codicon;
    static readonly symbolOperator: Codicon;
    static readonly symbolProperty: Codicon;
    static readonly wrench: Codicon;
    static readonly wrenchSubaction: Codicon;
    static readonly symbolSnippet: Codicon;
    static readonly tasklist: Codicon;
    static readonly telescope: Codicon;
    static readonly textSize: Codicon;
    static readonly threeBars: Codicon;
    static readonly thumbsdown: Codicon;
    static readonly thumbsup: Codicon;
    static readonly tools: Codicon;
    static readonly triangleDown: Codicon;
    static readonly triangleLeft: Codicon;
    static readonly triangleRight: Codicon;
    static readonly triangleUp: Codicon;
    static readonly twitter: Codicon;
    static readonly unfold: Codicon;
    static readonly unlock: Codicon;
    static readonly unmute: Codicon;
    static readonly unverified: Codicon;
    static readonly verified: Codicon;
    static readonly versions: Codicon;
    static readonly vmActive: Codicon;
    static readonly vmOutline: Codicon;
    static readonly vmRunning: Codicon;
    static readonly watch: Codicon;
    static readonly whitespace: Codicon;
    static readonly wholeWord: Codicon;
    static readonly window: Codicon;
    static readonly wordWrap: Codicon;
    static readonly zoomIn: Codicon;
    static readonly zoomOut: Codicon;
    static readonly listFilter: Codicon;
    static readonly listFlat: Codicon;
    static readonly listSelection: Codicon;
    static readonly selection: Codicon;
    static readonly listTree: Codicon;
    static readonly debugBreakpointFunctionUnverified: Codicon;
    static readonly debugBreakpointFunction: Codicon;
    static readonly debugBreakpointFunctionDisabled: Codicon;
    static readonly debugStackframeActive: Codicon;
    static readonly circleSmallFilled: Codicon;
    static readonly debugStackframeDot: Codicon;
    static readonly debugStackframe: Codicon;
    static readonly debugStackframeFocused: Codicon;
    static readonly debugBreakpointUnsupported: Codicon;
    static readonly symbolString: Codicon;
    static readonly debugReverseContinue: Codicon;
    static readonly debugStepBack: Codicon;
    static readonly debugRestartFrame: Codicon;
    static readonly callIncoming: Codicon;
    static readonly callOutgoing: Codicon;
    static readonly menu: Codicon;
    static readonly expandAll: Codicon;
    static readonly feedback: Codicon;
    static readonly groupByRefType: Codicon;
    static readonly ungroupByRefType: Codicon;
    static readonly account: Codicon;
    static readonly bellDot: Codicon;
    static readonly debugConsole: Codicon;
    static readonly library: Codicon;
    static readonly output: Codicon;
    static readonly runAll: Codicon;
    static readonly syncIgnored: Codicon;
    static readonly pinned: Codicon;
    static readonly githubInverted: Codicon;
    static readonly debugAlt: Codicon;
    static readonly serverProcess: Codicon;
    static readonly serverEnvironment: Codicon;
    static readonly pass: Codicon;
    static readonly stopCircle: Codicon;
    static readonly playCircle: Codicon;
    static readonly record: Codicon;
    static readonly debugAltSmall: Codicon;
    static readonly vmConnect: Codicon;
    static readonly cloud: Codicon;
    static readonly merge: Codicon;
    static readonly exportIcon: Codicon;
    static readonly graphLeft: Codicon;
    static readonly magnet: Codicon;
    static readonly notebook: Codicon;
    static readonly redo: Codicon;
    static readonly checkAll: Codicon;
    static readonly pinnedDirty: Codicon;
    static readonly passFilled: Codicon;
    static readonly circleLargeFilled: Codicon;
    static readonly circleLarge: Codicon;
    static readonly circleLargeOutline: Codicon;
    static readonly combine: Codicon;
    static readonly gather: Codicon;
    static readonly table: Codicon;
    static readonly variableGroup: Codicon;
    static readonly typeHierarchy: Codicon;
    static readonly typeHierarchySub: Codicon;
    static readonly typeHierarchySuper: Codicon;
    static readonly gitPullRequestCreate: Codicon;
    static readonly runAbove: Codicon;
    static readonly runBelow: Codicon;
    static readonly notebookTemplate: Codicon;
    static readonly debugRerun: Codicon;
    static readonly workspaceTrusted: Codicon;
    static readonly workspaceUntrusted: Codicon;
    static readonly workspaceUnspecified: Codicon;
    static readonly terminalCmd: Codicon;
    static readonly terminalDebian: Codicon;
    static readonly terminalLinux: Codicon;
    static readonly terminalPowershell: Codicon;
    static readonly terminalTmux: Codicon;
    static readonly terminalUbuntu: Codicon;
    static readonly terminalBash: Codicon;
    static readonly arrowSwap: Codicon;
    static readonly copy: Codicon;
    static readonly personAdd: Codicon;
    static readonly filterFilled: Codicon;
    static readonly wand: Codicon;
    static readonly debugLineByLine: Codicon;
    static readonly inspect: Codicon;
    static readonly layers: Codicon;
    static readonly layersDot: Codicon;
    static readonly layersActive: Codicon;
    static readonly compass: Codicon;
    static readonly compassDot: Codicon;
    static readonly compassActive: Codicon;
    static readonly azure: Codicon;
    static readonly issueDraft: Codicon;
    static readonly gitPullRequestClosed: Codicon;
    static readonly gitPullRequestDraft: Codicon;
    static readonly debugAll: Codicon;
    static readonly debugCoverage: Codicon;
    static readonly runErrors: Codicon;
    static readonly folderLibrary: Codicon;
    static readonly debugContinueSmall: Codicon;
    static readonly beakerStop: Codicon;
    static readonly graphLine: Codicon;
    static readonly graphScatter: Codicon;
    static readonly pieChart: Codicon;
    static readonly bracket: Codicon;
    static readonly bracketDot: Codicon;
    static readonly bracketError: Codicon;
    static readonly lockSmall: Codicon;
    static readonly azureDevops: Codicon;
    static readonly verifiedFilled: Codicon;
    static readonly newLine: Codicon;
    static readonly layout: Codicon;
    static readonly layoutActivitybarLeft: Codicon;
    static readonly layoutActivitybarRight: Codicon;
    static readonly layoutPanelLeft: Codicon;
    static readonly layoutPanelCenter: Codicon;
    static readonly layoutPanelJustify: Codicon;
    static readonly layoutPanelRight: Codicon;
    static readonly layoutPanel: Codicon;
    static readonly layoutSidebarLeft: Codicon;
    static readonly layoutSidebarRight: Codicon;
    static readonly layoutStatusbar: Codicon;
    static readonly layoutMenubar: Codicon;
    static readonly layoutCentered: Codicon;
    static readonly layoutSidebarRightOff: Codicon;
    static readonly layoutPanelOff: Codicon;
    static readonly layoutSidebarLeftOff: Codicon;
    static readonly target: Codicon;
    static readonly indent: Codicon;
    static readonly recordSmall: Codicon;
    static readonly errorSmall: Codicon;
    static readonly arrowCircleDown: Codicon;
    static readonly arrowCircleLeft: Codicon;
    static readonly arrowCircleRight: Codicon;
    static readonly arrowCircleUp: Codicon;
    static readonly heartFilled: Codicon;
    static readonly map: Codicon;
    static readonly mapFilled: Codicon;
    static readonly circleSmall: Codicon;
    static readonly bellSlash: Codicon;
    static readonly bellSlashDot: Codicon;
    static readonly commentUnresolved: Codicon;
    static readonly gitPullRequestGoToChanges: Codicon;
    static readonly gitPullRequestNewChanges: Codicon;
    static readonly searchFuzzy: Codicon;
    static readonly dialogError: Codicon;
    static readonly dialogWarning: Codicon;
    static readonly dialogInfo: Codicon;
    static readonly dialogClose: Codicon;
    static readonly treeItemExpanded: Codicon;
    static readonly treeFilterOnTypeOn: Codicon;
    static readonly treeFilterOnTypeOff: Codicon;
    static readonly treeFilterClear: Codicon;
    static readonly treeItemLoading: Codicon;
    static readonly menuSelection: Codicon;
    static readonly menuSubmenu: Codicon;
    static readonly menuBarMore: Codicon;
    static readonly scrollbarButtonLeft: Codicon;
    static readonly scrollbarButtonRight: Codicon;
    static readonly scrollbarButtonUp: Codicon;
    static readonly scrollbarButtonDown: Codicon;
    static readonly toolBarMore: Codicon;
    static readonly quickInputBack: Codicon;
}
export interface CSSIcon {
    readonly id: string;
}
export declare namespace CSSIcon {
    const iconNameSegment = "[A-Za-z0-9]+";
    const iconNameExpression = "[A-Za-z0-9-]+";
    const iconModifierExpression = "~[A-Za-z]+";
    const iconNameCharacter = "[A-Za-z0-9~-]";
    function asClassNameArray(icon: CSSIcon): string[];
    function asClassName(icon: CSSIcon): string;
    function asCSSSelector(icon: CSSIcon): string;
}
interface IconDefinition {
    fontCharacter: string;
}
export {};
