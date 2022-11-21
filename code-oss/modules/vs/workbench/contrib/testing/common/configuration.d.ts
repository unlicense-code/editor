import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IConfigurationNode } from 'vs/platform/configuration/common/configurationRegistry';
export declare const enum TestingConfigKeys {
    AutoRunDelay = "testing.autoRun.delay",
    AutoRunMode = "testing.autoRun.mode",
    AutoOpenPeekView = "testing.automaticallyOpenPeekView",
    AutoOpenPeekViewDuringAutoRun = "testing.automaticallyOpenPeekViewDuringAutoRun",
    OpenTesting = "testing.openTesting",
    FollowRunningTest = "testing.followRunningTest",
    DefaultGutterClickAction = "testing.defaultGutterClickAction",
    GutterEnabled = "testing.gutterEnabled",
    SaveBeforeTest = "testing.saveBeforeTest",
    AlwaysRevealTestOnStateChange = "testing.alwaysRevealTestOnStateChange"
}
export declare const enum AutoOpenTesting {
    NeverOpen = "neverOpen",
    OpenOnTestStart = "openOnTestStart",
    OpenOnTestFailure = "openOnTestFailure"
}
export declare const enum AutoOpenPeekViewWhen {
    FailureVisible = "failureInVisibleDocument",
    FailureAnywhere = "failureAnywhere",
    Never = "never"
}
export declare const enum AutoRunMode {
    AllInWorkspace = "all",
    OnlyPreviouslyRun = "rerun"
}
export declare const enum DefaultGutterClickAction {
    Run = "run",
    Debug = "debug",
    ContextMenu = "contextMenu"
}
export declare const testingConfiguation: IConfigurationNode;
export interface ITestingConfiguration {
    [TestingConfigKeys.AutoRunMode]: AutoRunMode;
    [TestingConfigKeys.AutoRunDelay]: number;
    [TestingConfigKeys.AutoOpenPeekView]: AutoOpenPeekViewWhen;
    [TestingConfigKeys.AutoOpenPeekViewDuringAutoRun]: boolean;
    [TestingConfigKeys.FollowRunningTest]: boolean;
    [TestingConfigKeys.DefaultGutterClickAction]: DefaultGutterClickAction;
    [TestingConfigKeys.GutterEnabled]: boolean;
    [TestingConfigKeys.SaveBeforeTest]: boolean;
    [TestingConfigKeys.OpenTesting]: AutoOpenTesting;
    [TestingConfigKeys.AlwaysRevealTestOnStateChange]: boolean;
}
export declare const getTestingConfiguration: <K extends TestingConfigKeys>(config: IConfigurationService, key: K) => ITestingConfiguration[K];
