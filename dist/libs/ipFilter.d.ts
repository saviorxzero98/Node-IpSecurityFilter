import { IpAddress } from "./ipAddress";
export declare enum IpFilterMode {
    /** 只處理黑名單，沒在名單內的IP一律允許 */
    Deny = "deny",
    /** 只處理白名單，沒在名單內的IP一律拒絕 */
    Allow = "allow"
}
export declare class IpFilter {
    private mode;
    private allowList;
    private denyList;
    constructor(mode: IpFilterMode);
    /** 取得白名單 */
    getAllowList(): IpAddress[];
    /** 取得黑名單 */
    getDenyList(): IpAddress[];
    /** 加入白名單 */
    addAllowAddress(ip: string | IpAddress): void;
    /** 加入白名單 */
    addAllowAddressList(ipList: string[] | IpAddress[]): void;
    /** 加入黑名單 */
    addDenyAddress(ip: string | IpAddress): void;
    /** 加入黑名單 */
    addDenyAddressList(ipList: string[] | IpAddress[]): void;
    /** 檢查 IP，true: 允許; false: 不允許 */
    check(ip: string | IpAddress): boolean;
    /** 使用白名單檢查是否允許的IP  */
    private allowListContains;
    /** 使用黑名單檢查是否拒絕的IP */
    private denyListContains;
}
