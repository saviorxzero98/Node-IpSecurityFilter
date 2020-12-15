"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipAddress_1 = require("./ipAddress");
var IpFilterMode;
(function (IpFilterMode) {
    /** 只處理黑名單，沒在名單內的IP一律允許 */
    IpFilterMode["Deny"] = "deny";
    /** 只處理白名單，沒在名單內的IP一律拒絕 */
    IpFilterMode["Allow"] = "allow";
})(IpFilterMode = exports.IpFilterMode || (exports.IpFilterMode = {}));
class IpFilter {
    constructor(mode) {
        this.mode = mode;
        this.allowList = [];
        this.denyList = [];
    }
    /** 取得白名單 */
    getAllowList() {
        return this.allowList;
    }
    /** 取得黑名單 */
    getDenyList() {
        return this.denyList;
    }
    /** 加入白名單 */
    addAllowAddress(ip) {
        if (ip) {
            let address;
            if (typeof ip === 'string') {
                address = new ipAddress_1.IpAddress(ip);
            }
            else if (ip instanceof ipAddress_1.IpAddress) {
                address = ip;
            }
            // 檢查是否合法
            if (address.getType() !== ipAddress_1.IpAddressType.Invalid) {
                this.allowList.push(address);
            }
        }
    }
    /** 加入白名單 */
    addAllowAddressList(ipList) {
        if (ipList && Array.isArray(ipList)) {
            for (let ip of ipList) {
                this.addAllowAddress(ip);
            }
        }
    }
    /** 加入黑名單 */
    addDenyAddress(ip) {
        if (ip) {
            let address;
            if (typeof ip === 'string') {
                address = new ipAddress_1.IpAddress(ip);
            }
            else if (ip instanceof ipAddress_1.IpAddress) {
                address = ip;
            }
            // 檢查是否合法
            if (address.getType() !== ipAddress_1.IpAddressType.Invalid) {
                this.denyList.push(address);
            }
        }
    }
    /** 加入黑名單 */
    addDenyAddressList(ipList) {
        if (ipList && Array.isArray(ipList)) {
            for (let ip of ipList) {
                this.addDenyAddress(ip);
            }
        }
    }
    /** 檢查 IP，true: 允許; false: 不允許 */
    check(ip) {
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
    allowListContains(ip) {
        let isAllowIp = false;
        for (let allowIp of this.allowList) {
            if (allowIp.contains(ip)) {
                return true;
            }
        }
        return isAllowIp;
    }
    /** 使用黑名單檢查是否拒絕的IP */
    denyListContains(ip) {
        let isDenyIp = false;
        for (let denyIp of this.denyList) {
            if (denyIp.contains(ip)) {
                return true;
            }
        }
        return isDenyIp;
    }
}
exports.IpFilter = IpFilter;
//# sourceMappingURL=ipFilter.js.map