"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipAddress_1 = require("./ipAddress");
const ipFilter_1 = require("./ipFilter");
/** IP 過濾工具程式 */
class IpSecurityUtils {
    /** 取得 Ip Security Middleware */
    static getIpSecurityMiddleware(config, errorlogger) {
        return (req, res, next) => {
            // 檢查是否啟用 IP 過濾
            if (config == undefined || !config.isEnable) {
                next();
                return;
            }
            // 檢查 IP
            if (req && req.connection) {
                let ipFilter = IpSecurityUtils.createIpSecurityFilter(config);
                let remoteAddress = req.connection.remoteAddress;
                // 是否使用 Proxy
                if (req.headers && req.headers[IpSecurityUtils.xForwardedFor]) {
                    let proxyIps = IpSecurityUtils.getClientIpListFromxForwardedFor(req.headers[IpSecurityUtils.xForwardedFor]);
                    // 檢查 Proxy 的 IP 是否可信任的 (確保不是造假)
                    if (!IpSecurityUtils.isTrustedProxy(proxyIps, remoteAddress, config, errorlogger)) {
                        if (errorlogger) {
                            errorlogger(`Deny ip ${remoteAddress} access and X-Forward-For ${req.headers[IpSecurityUtils.xForwardedFor]}`);
                        }
                        res.status(403).end();
                        return;
                    }
                    // 取得 Client IP
                    if (proxyIps.length !== 0) {
                        remoteAddress = proxyIps[0];
                    }
                }
                // 檢查 IP 是否允許
                if (ipFilter.check(remoteAddress)) {
                    next();
                }
                else {
                    if (errorlogger) {
                        errorlogger(`Deny ip ${remoteAddress} access.`);
                    }
                }
            }
            res.status(403).end();
        };
    }
    /** 建立 IP Filter */
    static createIpSecurityFilter(config) {
        let filterMode;
        switch (config.mode) {
            case ipFilter_1.IpFilterMode.Allow:
                filterMode = ipFilter_1.IpFilterMode.Allow;
                break;
            default:
                filterMode = ipFilter_1.IpFilterMode.Deny;
                break;
        }
        let ipFilter = new ipFilter_1.IpFilter(filterMode);
        ipFilter.addAllowAddressList(config.allowIpList);
        ipFilter.addDenyAddressList(config.denyIpList);
        return ipFilter;
    }
    /** 檢查 Proxy 是否可被信任 */
    static isTrustedProxy(forwardedIpList, remoteAddress, config, errorlogger) {
        let ipFilter = new ipFilter_1.IpFilter(ipFilter_1.IpFilterMode.Allow);
        ipFilter.addAllowAddressList(config.trustedProxyIpList);
        for (let i = 1; i < forwardedIpList.length; i++) {
            let forwardedIp = forwardedIpList[i];
            if (!ipFilter.check(forwardedIp)) {
                if (errorlogger) {
                    errorlogger(`Deny proxy ip ${forwardedIp} access.`);
                }
                return false;
            }
        }
        return ipFilter.check(remoteAddress);
    }
    ;
    /** 取得 Client 的 IP */
    static getClientIp(req) {
        let ipAddress;
        if (req && req.connection) {
            let remoteAddress = req.connection.remoteAddress;
            // 是否使用 Proxy
            if (req.headers && req.headers[IpSecurityUtils.xForwardedFor]) {
                let proxyIps = IpSecurityUtils.getClientIpListFromxForwardedFor(req.headers[IpSecurityUtils.xForwardedFor]);
                // 取得 Client IP
                if (proxyIps.length !== 0) {
                    ipAddress = new ipAddress_1.IpAddress(proxyIps[0]).toString();
                    return ipAddress;
                }
            }
            if (remoteAddress) {
                ipAddress = new ipAddress_1.IpAddress(remoteAddress).toString();
            }
        }
        return ipAddress;
    }
    /** 取得 x-forwarded-for 的所有 IP */
    static getClientIpListFromxForwardedFor(value) {
        if (value) {
            let forwardedIpList = value.split(',').map((e) => {
                const ip = e.trim();
                if (ip.includes(':')) {
                    const splitted = ip.split(':');
                    if (splitted.length === 2) {
                        return splitted[0];
                    }
                }
                return ip;
            });
            return forwardedIpList;
        }
        return [];
    }
}
exports.IpSecurityUtils = IpSecurityUtils;
IpSecurityUtils.xForwardedFor = 'x-forwarded-for';
/** IP 設定規則 */
class IpSecurityRule {
    constructor(isEnable = false, mode = ipFilter_1.IpFilterMode.Deny, allowIpList, denyIpList, trustedProxyIpList) {
        this.isEnable = isEnable;
        this.mode = mode;
        this.allowIpList = (allowIpList && Array.isArray(allowIpList)) ? allowIpList : [];
        this.denyIpList = (denyIpList && Array.isArray(denyIpList)) ? denyIpList : [];
        this.trustedProxyIpList = (trustedProxyIpList && Array.isArray(trustedProxyIpList)) ? trustedProxyIpList : [];
    }
    /** 建立 Rule */
    static createRule(options) {
        if (options) {
            let isEnable = options['isEnable'];
            let mode = options['mode'];
            let allowIpList = options['allowIpList'];
            let denyIpList = options['denyIpList'];
            let trustedProxyIpList = options['trustedProxyIpList'];
            return new IpSecurityRule(isEnable, mode, allowIpList, denyIpList, trustedProxyIpList);
        }
        else {
            return new IpSecurityRule();
        }
    }
}
exports.IpSecurityRule = IpSecurityRule;
IpSecurityRule.configName = 'ipSecurityOptions';
//# sourceMappingURL=ipSecurityMiddleware.js.map