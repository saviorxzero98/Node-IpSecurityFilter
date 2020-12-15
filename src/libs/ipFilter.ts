import { IpAddress, IpAddressType } from "./ipAddress";

export enum IpFilterMode {
    /** 只處理黑名單，沒在名單內的IP一律允許 */
    Deny = 'deny',

    /** 只處理白名單，沒在名單內的IP一律拒絕 */
    Allow = 'allow',
}
export class IpFilter {
    private mode: IpFilterMode;
    private allowList: IpAddress[];
    private denyList: IpAddress[];

    
    constructor(mode: IpFilterMode) {
        this.mode = mode;
        this.allowList = [];
        this.denyList = [];
    }

    /** 取得白名單 */
    public getAllowList(): IpAddress[] {
        return this.allowList;
    }

    /** 取得黑名單 */
    public getDenyList(): IpAddress[] {
        return this.denyList;
    }

    /** 加入白名單 */
    public addAllowAddress(ip: string | IpAddress) {
        if (ip) {
            let address: IpAddress;
            if (typeof ip === 'string') {
                address = new IpAddress(ip);
            }
            else if (ip instanceof IpAddress) {
                address = ip;
            }

            // 檢查是否合法
            if (address.getType() !== IpAddressType.Invalid) {
                this.allowList.push(address);
            }
        }
    }

    /** 加入白名單 */
    public addAllowAddressList(ipList: string[] | IpAddress[]) {
        if (ipList && Array.isArray(ipList)) {
            for (let ip of ipList) {
                this.addAllowAddress(ip);
            }
        }
    }

    /** 加入黑名單 */
    public addDenyAddress(ip: string | IpAddress) {
        if (ip) {
            let address: IpAddress;
            if (typeof ip === 'string') {
                address = new IpAddress(ip);
            }
            else if (ip instanceof IpAddress) {
                address = ip;
            }

            // 檢查是否合法
            if (address.getType() !== IpAddressType.Invalid) {
                this.denyList.push(address);
            }
        }
    }

    /** 加入黑名單 */
    public addDenyAddressList(ipList: string[] | IpAddress[]) {
        if (ipList && Array.isArray(ipList)) {
            for (let ip of ipList) {
                this.addDenyAddress(ip);
            }
        }
    }

    /** 檢查 IP，true: 允許; false: 不允許 */
    public check(ip: string | IpAddress): boolean {
        let isAllowIp = false;

        switch (this.mode) {
            case IpFilterMode.Allow:
                isAllowIp = this.allowListContains(ip);
                break;

            case IpFilterMode.Deny:
                isAllowIp = !this.denyListContains(ip);
                break;
        }
        return isAllowIp;
    }

    /** 使用白名單檢查是否允許的IP  */
    private allowListContains(ip: string | IpAddress) : boolean {
        let isAllowIp = false;
        for (let allowIp of this.allowList) {
            if (allowIp.contains(ip)) {
                return true;
            }
        }
        return isAllowIp;
    }

    /** 使用黑名單檢查是否拒絕的IP */
    private denyListContains(ip: string | IpAddress) : boolean {
        let isDenyIp = false;
        for (let denyIp of this.denyList) {
            if (denyIp.contains(ip)) {
                return true;
            }
        }
        return isDenyIp;
    }
}
