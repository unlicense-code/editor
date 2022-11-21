import { IPtyService } from 'vs/platform/terminal/common/terminal';
export declare const ILocalPtyService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILocalPtyService>;
/**
 * A service responsible for communicating with the pty host process on Electron.
 *
 * **This service should only be used within the terminal component.**
 */
export interface ILocalPtyService extends IPtyService {
}
