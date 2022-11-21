import { ITerminalProfiles } from 'vs/workbench/contrib/terminal/common/terminal';
export interface ITestTerminalConfig {
    profiles: ITerminalProfiles;
    useWslProfiles: boolean;
}
