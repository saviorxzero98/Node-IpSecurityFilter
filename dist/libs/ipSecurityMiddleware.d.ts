import { IpFilter } from "./ipFilter";
export declare type IpDenyMessageCallback = (message: string) => void;
/** IP 過濾工具程式 */
export declare class IpSecurityUtils {
    static readonly xForwardedFor: string;
    /** 取得 Ip Security Middleware */
    static getIpSecurityMiddleware(config: IpSecurityRule, errorlogger?: IpDenyMessageCallback): (req: any, res: any, next: any) => void;
    /** 建立 IP Filter */
    static createIpSecurityFilter(config: IpSecurityRule): IpFilter;
    /** 檢查 Proxy 是否可被信任 */
    static isTrustedProxy(forwardedIpList: string[], remoteAddress: string, config: IpSecurityRule, errorlogger?: IpDenyMessageCallback): boolean;
    /** 取得 Client 的 IP */
    static getClientIp(req: any): string;
    /** 取得 x-forwarded-for 的所有 IP */
    static getClientIpListFromxForwardedFor(value: string): string[];
}
/** IP 設定規則 */
export declare class IpSecurityRule {
    static readonly configName = "ipSecurityOptions";
    isEnable: boolean;
    mode: string;
    allowIpList: string[];
    denyIpList: string[];
    trustedProxyIpList: string[];
    constructor(isEnable?: boolean, mode?: string, allowIpList?: string[], denyIpList?: string[], trustedProxyIpList?: string[]);
    /** 建立 Rule */
    static createRule(options: any): IpSecurityRule;
}
