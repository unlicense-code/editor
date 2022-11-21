/**
 * Given a start point and a max number of retries, will find a port that
 * is openable. Will return 0 in case no free port can be found.
 */
export declare function findFreePort(startPort: number, giveUpAfter: number, timeout: number, stride?: number): Promise<number>;
export declare const BROWSER_RESTRICTED_PORTS: any;
/**
 * Uses listen instead of connect. Is faster, but if there is another listener on 0.0.0.0 then this will take 127.0.0.1 from that listener.
 */
export declare function findFreePortFaster(startPort: number, giveUpAfter: number, timeout: number, hostname?: string): Promise<number>;
